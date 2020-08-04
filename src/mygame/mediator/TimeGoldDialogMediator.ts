import Mediator from "../../game/Mediator";
import TimeGoldSession from "../session/TimeGoldSession";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import SdkSession from "../session/SdkSession";
import RotationEffect from "../scene/RotationEffect";
import { ui } from "../../ui/layaMaxUI";

export default class TimeGoldDialogMediator extends Mediator {
    public timeGoldSession: TimeGoldSession = null;
    public sdkSession: SdkSession = null;

    constructor() {
        super();
    }

    public dialog: ui.scene.TimeGoldUI;

    public setSprite(sp: Laya.Sprite): void {
        this.dialog = <ui.scene.TimeGoldUI>sp;
    }

    public LingBtn_click(): void {
        if (this.timeGoldSession.gold == 0) {
            this.dialog.close();
            return;
        }
        App.dialog( MyGameInit.NewGetItemDialog , true ,  this.timeGoldSession.gold );
        this.timeGoldSession.rewardGold(false);
        this.init();
    }

    public AdLingBtn_click(): void {
        if ( this.timeGoldSession.gold == 0 ){
            this.dialog.close();
            return;
        }
        this.sdkSession.playAdVideo(SdkSession.TIME_GOLD, new Laya.Handler(this, this.adFun));
    }

    public adFun(stat: number): void {
        if (this.timeGoldSession.gold == 0) {
            this.dialog.close();
            return;
        }
        if (stat == 1) {
            App.dialog( MyGameInit.NewGetItemDialog , true ,  this.timeGoldSession.gold * 3 );
            this.timeGoldSession.rewardGold(true);
            this.init();
        }
    }

    public init(): void {
        this.dialog.goldFc.value = this.timeGoldSession.gold + "";
        this.dialog.btn1Fc.value = this.timeGoldSession.gold + "";
        this.dialog.btn2Fc.value = this.timeGoldSession.gold * 3 + "";
        this.sdkSession.initAdBtn(this.dialog.AdLingBtn , SdkSession.TIME_GOLD );
        this.dialog.effectView.ani1.play();
        RotationEffect.play(this.dialog.light);
    }
}