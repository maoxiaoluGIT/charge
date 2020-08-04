import Mediator from "../../game/Mediator";
import { ui } from "../../ui/layaMaxUI";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import { SysPet } from "../config/SysConfig";
import BagSession, { GOLD_TYPE } from "../session/BagSession";
import SdkSession from "../session/SdkSession";
import Tips from "../scene/Tips";
import DataSession from "../session/DataSession";
import TreasureSession from "../session/TreasureSession";

export default class TreasureDialogMediator extends Mediator{
    public bagSession:BagSession = null;
    public sdkSession:SdkSession = null;
    public dataSession:DataSession = null;
    public treasureSession:TreasureSession = null;

    constructor(){
        super();
    }

    public dialog:ui.scene.TreasureDialogUI;
    
    public setSprite( sp:Laya.Sprite ):void{
        this.dialog = <ui.scene.TreasureDialogUI>sp;
    }

    public init():void{
        this.init1Box();
        this.init2Box();
        this.init3Box();
        this.dialog.adview.ani1.interval = 1000/35;
        this.dialog.adview.ani1.play(0,true);
        this.checkTime();
    }

    public checkTime():void{
        if( this.treasureSession.time > Laya.Browser.now() ){
            //倒计时
            Laya.timer.loop(1000,this,this.fpFun);
            this.fpFun();
            this.dialog.timeBox.visible = true;
        }else{
            this.dialog.timeBox.visible = false;
        }
    }

    public fpFun():void{
        let sec = ( this.treasureSession.time - Laya.Browser.now() ) / 1000;
        let hour = Math.floor( sec / 3600 );
        sec -= hour * 3600;
        let min = parseInt( sec % 3600 / 60 + "");
        sec -= min * 60;
        sec = Math.ceil( sec );
        let str = "0" + hour + " " + this.getNum(min) + " " + this.getNum(sec);
        this.dialog.timeFc.value = str;
    }

    public getNum( v:number ):string{
        if( v < 10 ){
            return "0" + v;
        }
        return v + "";
    }

    public init1Box():void{
        let sys:SysPet = <SysPet>App.getConfig( MyGameInit.sys_pet , 5 );
        this.dialog.priceFc.value = sys.boxCost + "";
        this.dialog.t1.text = sys.txt;
        this.dialog.btn1.clickHandler = new Laya.Handler( this,this.btn1Fun );
    }

    public btn1Fun():void{
        let sys:SysPet = <SysPet>App.getConfig( MyGameInit.sys_pet , 5 );
        if( sys.boxCost > this.bagSession.gold ){
            Tips.show("金币不够");
            return;
        }
        this.bagSession.changeGold( -sys.boxCost ,GOLD_TYPE.TREASURE1 );
        let a = new ui.scene.PTbaoxiangUI();
        a.popup();
        a.zOrder = 10001;
        a.ani1.interval = 1000/15;
        a.ani1.play( 0,false );
        a.ani1.on(Laya.Event.COMPLETE , this, this.ani1OverFun,[a] );
    }

    public ani1OverFun(a:Laya.Dialog):void{
        a.removeSelf();
        let sys:SysPet = <SysPet>App.getConfig( MyGameInit.sys_pet , 5 );
        let lv = App.getRandom2( sys.equipLvMin,sys.equipLvMax );
        let e = this.bagSession.getNewItemByLv( lv );
        this.bagSession.addEquipInBag(e);
        App.dialog( MyGameInit.NewGetItemDialog , false, e );
    }

    public init2Box():void {
        this.dialog.btn2.clickHandler = new Laya.Handler( this,this.btn2Fun );
        let v = this.bagSession.getAverageEquipLv();
        let sys:SysPet = SysPet.getLv( TreasureDialogMediator.GoldBox , v );
        if( sys == null ){
            //八成是少一个装备 然后 平均值 不对
            sys = SysPet.getLv( TreasureDialogMediator.GoldBox , 1 );
        }
        this.dialog.gold2.value = sys.boxCost + "";
        this.dialog.t2.text = sys.txt;
    }

    public btn2Fun():void{
        let v = this.bagSession.getAverageEquipLv();
        let sys:SysPet = SysPet.getLv( TreasureDialogMediator.GoldBox , v );
        if( sys.boxCost > this.bagSession.gold ){
            Tips.show("金币不够");
            return;
        }
        this.bagSession.changeGold( -sys.boxCost ,GOLD_TYPE.TREASURE2 );
        let a = new ui.scene.ZJbaoxiangUI();
        a.popup();
        a.zOrder = 10001;
        a.ani1.interval = 1000/15;
        a.ani1.play( 0,false );
        a.ani1.on(Laya.Event.COMPLETE , this, this.ani2OverFun,[a] );
    }

    public ani2OverFun(a:Laya.Dialog):void{
        a.removeSelf();
        let v = this.bagSession.getAverageEquipLv();
        let sys:SysPet = SysPet.getLv( TreasureDialogMediator.GoldBox  , v );
        let lv = App.getRandom2( sys.equipLvMin,sys.equipLvMax );
        let e = this.bagSession.getNewItemByLv( lv );
        this.bagSession.addEquipInBag(e);
        this.init2Box();
        App.dialog( MyGameInit.NewGetItemDialog , false, e );
    }

    public init3Box():void{
        let sys = this.getSys3();
        App.getRandom2( sys.equipLvMin,sys.equipLvMax );
        this.dialog.t3.text = sys.txt;
        this.sdkSession.initAdBtn( this.dialog.adBtn , SdkSession.TREASURE );
        this.dialog.adBtn.clickHandler = new Laya.Handler( this , this.adFun );
    }

    public getSys3():SysPet{
        let v = this.bagSession.getAverageEquipLv();
        return SysPet.getLv( TreasureDialogMediator.AD_BOX , v );
    }

    public adFun():void{
        if( this.treasureSession.canOpen() == false ){
            Tips.show("时间不到");
            return;
        }
        this.sdkSession.playAdVideo( SdkSession.TREASURE ,new Laya.Handler(this,this.adOverFun) );
    }

    public adOverFun():void{
        let a = new ui.scene.NBbaoxiangUI();
        a.popup();
        a.zOrder = 10001;
        a.ani1.interval = 1000/15;
        a.ani1.play( 0,false );
        a.ani1.on(Laya.Event.COMPLETE , this, this.aniOverFun,[a] );
    }

    public aniOverFun( a:Laya.Dialog ):void{
        a.close();
        let arr:Array<any> = [];
        for( let i:number = 0; i < 6; i++  ){
            let sys = this.getSys3();
            let lv = App.getRandom2(sys.equipLvMin , sys.equipLvMax);
            let e = this.bagSession.getNewItemByLv( lv );
            if( this.bagSession.addEquipInBag(e) ){
                arr.push(e);
            }
        }
        if( arr.length == 0 ){
            Tips.show("请您清理背包");
            return;
        }
        App.dialog( MyGameInit.NewGetItemDialog , false, arr );
        this.treasureSession.openBox();
        this.checkTime();
    }

    public getLoaderUrl():Array<string>{
        return ["res/atlas/dabaoxiang.atlas"];
    }

    public static AD_BOX:number = 700003;
    public static GoldBox:number  = 700004;
}