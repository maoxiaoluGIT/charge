import Mediator from "../../game/Mediator";
import { ui } from "../../ui/layaMaxUI";
import SetSession from "../session/SetSession";
import DataSession from "../session/DataSession";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import MyConfig from "../../MyConfig";

export default class SettingMediator extends Mediator{
    public setSession:SetSession = null;
    public dataSession:DataSession = null;

    constructor(){
        super();
    }

    public yesBtn_click():void{
        this.exitGameFun();
    }

    public btn1_click():void{
        this.musicFun();
    }

    public btn2_click():void{
        this.soundFun();
    }

    public clearBtn_click():void{
        this.dataSession.clearData();
    }

    public dialog:ui.scene.SettingDialogUI;

    public setSprite(s:Laya.Sprite):void{
        this.dialog = <any>s;
    }

    public init():void {
        if( App.getInstance().nowSceneUrl == MyGameInit.MainScene ){
            this.dialog.yesBtn.disabled = true;
        }else{
            this.dialog.yesBtn.disabled = false;
        }
        this.reset();
        let s1 = "ID:" + this.dataSession.saveKey.substring( this.dataSession.saveKey.length - 4  );
        let s2 = "VER:" + DataSession.GAME_VER + "";
        this.dialog.idtext.text = s1 + "    " + s2;
   
        this.dialog.clearBtn.visible = (MyConfig.TEST == 1);
    }

    public musicFun():void {
        this.setSession.setMusic( Laya.SoundManager.musicMuted );
        App.getInstance().gameSoundManager.setBgmMuted( Laya.SoundManager.musicMuted );
        this.reset();
    }

    public soundFun():void{
        this.setSession.setSound( Laya.SoundManager.soundMuted );
        App.getInstance().gameSoundManager.setBgmMuted( Laya.SoundManager.soundMuted );
        this.reset();
    }

    public exitGameFun():void{
        App.getInstance().openScene(MyGameInit.MainScene , true, MyGameInit.SelectStage);
        this.dialog.close();
    }

    public reset():void{
        if( Laya.SoundManager.musicMuted ){
            this.dialog.btn1.skin = "sence/btn_hong.png";
            this.dialog.img1.skin = "setdialog/shengyinguan.png";
        }else{
            this.dialog.btn1.skin = "sence/btn_lv.png";
            this.dialog.img1.skin = "setdialog/shengyinkai.png";
        }
        if( Laya.SoundManager.soundMuted ){
            this.dialog.btn2.skin = "sence/btn_hong.png";
            this.dialog.img2.skin = "setdialog/yinxiaoguan.png";
        }else{
            this.dialog.btn2.skin = "sence/btn_lv.png";
            this.dialog.img2.skin = "setdialog/yinxiaokai.png";
        }
    }

    public getLoaderUrl():Array<string>{
        return ["res/atlas/setdialog.atlas"];
    }
}