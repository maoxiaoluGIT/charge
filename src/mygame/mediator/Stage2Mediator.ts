import Mediator from "../../game/Mediator";
import NewerSession from "../session/NewerSession";
import BattleSession from "../session/BattleSession";
import { SysStageMap, SysStageInfo } from "../config/SysConfig";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import { ui } from "../../ui/layaMaxUI";
import DataSession from "../session/DataSession";
import LogType from "../session/LogType";

export default class Stage2Mediator extends Mediator{
    public battleSession:BattleSession = null;
    public newerSession:NewerSession = null;
    public stageArr:Array<Laya.Box> = [];
    public bossArr:Array<ui.scene.BossStageViewUI> = [];
    public dataSession:DataSession = null;

    constructor(){
        super();
    }

    public selectStageView:any;
    public setSprite(sprite:Laya.Sprite):void {
        this.selectStageView = sprite;
    }

    public static STAGE_ID:number = 1001;

    public stageId:number = 1001;
    
    public setParam( param:any ):void{
        if( param == null ){
            this.stageId = Stage2Mediator.STAGE_ID;
        }else{
            this.stageId = param;
            Stage2Mediator.STAGE_ID = this.stageId;
        }
    }

    public closeBtn:Laya.Button = null;
    
    public init():void {
        this.initSysArr( this.getSysArr() );
        this.setNowStage( this.battleSession.stageNum );    
        this.setRedTan( this.battleSession.noPlayerStage.arr );

        if( this.newerSession.isNew ){
            this.newerSession.last();
            NewerSession.getHand().visible = false;
            Laya.timer.once(500,this,this.handStage1);

            let closeBtn:Laya.Button = this.selectStageView.getChildByName("close");
            if( closeBtn ){
                this.closeBtn = closeBtn;
                closeBtn.name = "";
            }
        }else{
            if( this.closeBtn ){
                this.closeBtn.name = "close";
            }
        }
    }

    public handStage1():void{
        this.dataSession.log( LogType.NEWER_CLICK_STAGE);
        
        let v = NewerSession.getHand();
        let p = this.selectStageView["s1"].localToGlobal( new Laya.Point(0,0) );
        Laya.stage.addChild(v);
        v.visible = true;
        v.x = p.x + 70;
        v.y = p.y + 100;
        this.selectStageView["s1"].once( Laya.Event.MOUSE_DOWN,this,this.clickNext );
    }

    public clickNext():void{
        NewerSession.getHand().visible = false;
    }

    public getSysArr():Array<SysStageInfo> {
        let arr:Array<SysStageInfo> = App.getInstance().configManager.getDataArr( MyGameInit.sys_stageinfo );
        let sysArr:Array<SysStageInfo> = [];
        for( let v of arr ){
            if( v.starID == this.stageId ){
                sysArr.push( v );
            }
        }
        return sysArr;
    }

    /**
     * 设置当前过到第几关了
     * @param stageIndex 
     */
    public setNowStage( stageIndex:number ):void{
        let arr = this.getSysArr();
        for( let i:number = 0; i < this.stageArr.length; i++ ){
            let sys:SysStageInfo = arr[i];
            let box:Laya.Box = this.stageArr[i];
            box.disabled = !( sys.id <= stageIndex );
        }
        if( this.bossArr.length != 0 ){
            this.bossArr[0].box.disabled = !(stageIndex >= arr[4].id );
            this.bossArr[1].box.disabled = !(stageIndex >= arr[9].id );
        }
    }

    public redArr:Array<Laya.Sprite> = [];

    public initSysArr( arr:Array<SysStageInfo> ):void{
        this.stageArr.length = 0;
        this.bossArr.length = 0;
        this.redArr.length = 0;
        
        let stageValue:number = 1;
        for( let i of arr){
            let key =  "s" + i.id;
            let box = this.selectStageView[key];
            if( i.stageType == 1 ){
                let v = this.getView( box );
                v.img1.skin = "resselectstage/xiaoguan.png";
                v.t1.text = stageValue + "";//i.id + "";
                v.t1.visible = true;
                this.stageArr.push( box );
                v.on( Laya.Event.CLICK,this,this.clickStageFun,[i] );
                this.redArr.push( this.getRed(i.id + "") );
            }else{
                let bsv = <ui.scene.BossStageViewUI>box;
                this.bossArr.push( bsv );
                bsv.box.on( Laya.Event.CLICK,this,this.clickStageFun,[i] );
                this.redArr.push( this.getRed(i.id + "") );
            }
            stageValue++;
        }
    }

    public clickStageFun( sys:SysStageInfo ):void {
        //sys = App.getConfig( MyGameInit.sys_stageinfo , 21 );
        this.battleSession.setSysStageInfo( sys );
        //接收事件 传给session 避免传来传去
        this.battleSession.deleteNoPlayStage( sys.id );
        Laya.Dialog.manager.closeAll();
        App.getInstance().openScene( MyGameInit.BattleScene );
    }

    public getView( box:Laya.Box ):ui.scene.StageViewUI{
        return <ui.scene.StageViewUI>box.getChildByName("stageview");
    }

    public setRedTan( arr:Array<string> ):void{
        for ( let a of this.redArr ){
            a.visible = false;
        }
        for( let stageId of arr ) {
            if( stageId == "" ){
                continue;
            }
            let red = this.getRed( stageId );
            if( red == null ){
                continue;
            }
            red.visible = true;
            red.ani1.play(0,true);
        }
    }

    public getRed( stageId:string ):ui.scene.sanjiaoUI {
        let stageIndex = parseInt(stageId);
        let sys = this.getSysStageInfo(stageIndex);
        let sv = this.selectStageView["s" + stageId];
        if( sv == null ){
            return null;
        }
        if( sys.stageType == 1 ) {
            return this.getView( sv ).red;
        }else if( sys.stageType == 2 ){
            let b = <ui.scene.BossStageViewUI>sv;
            return b.red;
        }
    }

    public getSysStageInfo( stageIndex:number ): SysStageInfo {
        let a:Array<SysStageInfo> = App.getInstance().configManager.getDataArr(MyGameInit.sys_stageinfo);
        for( let i of a ){
            if( stageIndex == i.id ){
                return i;
            }
        }
    }

    public getLoaderUrl():Array<string>{
        return ["res/atlas/resselectstage.atlas"];
    }
}