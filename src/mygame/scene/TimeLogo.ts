import { ui } from "../../ui/layaMaxUI";
import TimeGoldSession from "../session/TimeGoldSession";
import App from "../../game/App";
import MyEvent from "../MyEvent";

export default class TimeLogo{
    public timeGoldSession:TimeGoldSession = null;

    constructor(){
        App.getInstance().injOne(this);
    }

    public mainUI:ui.scene.TimeLogoUI;
    public setUI(a:ui.scene.TimeLogoUI):void{
        this.mainUI = a;
        this.mainUI.on(Laya.Event.UNDISPLAY , this, this.undisFun );
        Laya.timer.frameLoop( 1,this,this.loopFun );
        //App.onEvent( MyEvent.TIME_GOLD_UPDATE , this, this.onTIME_GOLD_UPDATE );
    }

    public undisFun():void{
        Laya.timer.clearAll(this);
        //App.getInstance().eventManager.off( MyEvent.TIME_GOLD_UPDATE , this, this.onTIME_GOLD_UPDATE );
    }

    public onTIME_GOLD_UPDATE():void{
        //this.mainUI.goldFc.value = 
    }

    public loopFun():void{
        let arr = this.timeGoldSession.getNowTime();
        this.mainUI.timeFc.value = this.getString( arr[0] ) + " " + this.getString( arr[1] );
        this.mainUI.goldFc.value = this.timeGoldSession.gold + "";
        let ms = arr[2] * 1000 + arr[3];
        let endA = 360 * ( (60000 - ms) / 60000 ) - 90;
        let a = this.mainUI.shanbox;
        a.graphics.clear();
        a.graphics.drawPie(a.width/2 -1 ,a.height/2 + 2 , 35,-90 , endA , "#ffec1d" );
    }

    public getString( value:number ):string{
        return value < 10 ?  0 + "" + value : value + "";
    }
}