import Session from "../../game/Session";
import App from "../../game/App";
import MyEvent from "../MyEvent";
import GirlViewC from "../scene/GirlViewC";
import MyGameInit from "../MyGameInit";
import { ui } from "../../ui/layaMaxUI";
import DataSession from "./DataSession";
import GameEvent from "../../game/GameEvent";
import LogType from "./LogType";

export default class NewerSession extends Session {
    public isNew: boolean = false;
    public dataSession: DataSession = null;

    constructor() {
        super();
    }

    public clearNew(): void {
        this.isNew = false;

        if (this.g) {
            this.g.removeSelf();
            this.g = null;
        }
        Laya.timer.clearAll(this);
        App.getInstance().eventManager.offAllCaller(this);
        NewerSession.hand = null;
        App.sendEvent(MyEvent.NEWER_OVER);
        this.dataSession.saveData();
    }

    /**
     * 血量已经一半
     */
    public onHP_HALF(): void {
        if (this.isNew == false) {
            return;
        }
        this.dataSession.save1();
        this.dataSession.log(LogType.NEWER_HALF);
        App.getInstance().openScene(MyGameInit.MainScene);
    }

    public onNEWER_INIT(): void {
        this.isNew = true;
    }

    public onENTER_BATTLE_SCENE(): void {
        if (this.isNew == false) {
            return;
        }
        this.enterFun();
    }

    /**
     * 第二次进入游戏
     */
    public onSECOND_NEW(): void {
        this.isNew = true;
        this.g = new GirlViewC();
        Laya.stage.addChild(this.g);
    }

    public g: GirlViewC = null;

    public enterFun(): void {
        this.g = new GirlViewC();
        Laya.stage.addChild(this.g);
        this.g.startOne();
        this.g.once(GirlViewC.NEXT, this, this.nextFun);
    }

    public nextFun(): void {
        App.sendEvent(MyEvent.START_NEWER_MV);
        App.getInstance().eventManager.once(MyEvent.JINGTOU_BACK, this, this.nextFun2);
    }

    public nextFun2(): void {
        this.g.moveGuide();
        App.onEvent(MyEvent.GET_NEW_ITEM, this, this.getnewFun);
    }

    public itemnum: number = 0;

    public getnewFun(): void {
        this.itemnum++;
        if (this.itemnum == 2) {
            this.g.tailihai();
        }
        this.g.once(GirlViewC.NEXT, this, this.next2Fun);
    }

    public next2Fun(): void {
        App.sendEvent(MyEvent.SHOUZHITOU);
        App.getInstance().eventManager.once(MyEvent.EQUIP_OVER, this, this.equipFun);
    }

    public equipFun(): void {
        this.g.bianQiang();
    }

    /**
     * 新手
     */
    public static getHand(): ui.scene.newhand1UI {
        if (NewerSession.hand == null) {
            NewerSession.hand = new ui.scene.newhand1UI();
        }
        NewerSession.hand.lightClip.play();
        return NewerSession.hand;
    }

    /**
     * 最后一步
     */
    public last(): void {
        App.getInstance().eventManager.once(GameEvent.OPEN_SCENE_START, this, this.clickLast);
    }

    public clickLast(url: string): void {
        if (url == MyGameInit.BattleScene) {
            this.clearNew();
        }
    }

    public static hand: ui.scene.newhand1UI = null;
}