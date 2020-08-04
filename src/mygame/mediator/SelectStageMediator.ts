import Mediator from "../../game/Mediator";
import SelectStageScene from "../scene/SelectStageScene";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import { SysStageMap, SysStageInfo } from "../config/SysConfig";
import BattleSession from "../session/BattleSession";
import NewerSession from "../session/NewerSession";
import MyEvent from "../MyEvent";

export default class SelectStageMediator extends Mediator{
    public battleSession:BattleSession = null;
    public newerSession:NewerSession = null;
    
    constructor(){
        super();
    }
    
    public s:SelectStageScene;
    public setSprite(sprite:Laya.Sprite):void{
        this.s = <SelectStageScene>sprite;
        this.s.on( SelectStageScene.SELECT_STAGE,this,this.sFun );
    }

    public sFun( sys:SysStageInfo ):void{
        this.battleSession.setSysStageInfo(sys);
        //接收事件 传给session 避免传来传去
        this.battleSession.deleteNoPlayStage( sys.id-1 );
    }

    public stageId:number = 1001;
    public setParam(param:any):void{
        //this.stageId = param;
    }

    public init():void{
        let sys = <SysStageMap>App.getInstance().configManager.getConfig( MyGameInit.sys_stagemap, this.stageId );
        let arr:Array<SysStageInfo> = App.getInstance().configManager.getDataArr( MyGameInit.sys_stageinfo );
        let sysArr:Array<SysStageInfo> = [];
        for( let v of arr ){
            if( v.starID == this.stageId ){
                sysArr.push( v );
            }
        }
        this.s.setSysArr( sysArr );
        this.s.setNowStage( this.battleSession.stageNum );
        
        if( this.newerSession.isNew ){
            this.newerSession.last();
            NewerSession.getHand().visible = false;
            Laya.timer.once(500,this,this.handStage1);
        }
        this.s.setRedTan( this.battleSession.noPlayerStage.arr );
    }

    public handStage1():void{
        let v = NewerSession.getHand();
        //let p = this.s.s0.localToGlobal( new Laya.Point(0,0) );
        Laya.stage.addChild(v);
        v.visible = true;
        //v.x = p.x + 80;
       // v.y = p.y + 100;
        
        //App.getInstance().eventManager.once( MyEvent.ENTER_BATTLE_SCENE , this,this.clickNext );
        this.s.once( Laya.Event.MOUSE_DOWN,this,this.clickNext );
    }

    public clickNext():void{
        NewerSession.getHand().visible = false;
        //this.newerSession.clearNew();
    }
}