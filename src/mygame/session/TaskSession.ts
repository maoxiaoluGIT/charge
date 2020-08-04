import Session from "../../game/Session";
import IJsonData from "./IJsonData";
import DataSession from "./DataSession";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import { SysMission } from "../config/SysConfig";
import MyArray from "../../game/MyArray";
import Map2Array from "../../game/Map2Array";
import BagSession, { GOLD_TYPE } from "./BagSession";
import MyEvent from "../MyEvent";
import NewerSession from "./NewerSession";
import GameEvent from "../../game/GameEvent";

export default class TaskSession extends Session implements IJsonData{
    public dataSession:DataSession = null;
    public bagSession:BagSession = null;
    public newerSession:NewerSession = null;
    /**
     * 里面都是id 字符串
     */
    public overArr:MyArray = new MyArray();
    /**
     * 已激活任务
     * 完成任务的时候 从这里拿 所以新加的任务必须放这里
     */
    public nowMap:Map2Array = new Map2Array();
    
    public dayTaskArr:Array<SysMission> = [];
    public achievementArr:Array<SysMission> = [];

    /**
     * 任务data的map
     * id 2 taskdata
     * 所有的都在这里
     */
    public taskMap = {};

    constructor(){
        super();
        Laya.timer.callLater( this,this.nextFun );
    }

    public nextFun():void{
        this.dataSession.regAtt( this );
    }

    public onNEWER_OVER():void {
        this.setData(null);
    }

    public haveOver():boolean{
        for( let k in this.taskMap ){
            let td:TaskData = this.taskMap[k];
            if( td.isOver() ){
                return true;
            }
        }
        return false;
    }

    public onCONFIG_OVER():void{
        let arr:Array<SysMission> = App.getInstance().configManager.getDataArr( MyGameInit.sys_mission );
        for( let sys of arr ){
            if( sys.missionNamesign == 1 ){
                continue;
            }
            let td = new TaskData();
            this.taskMap[sys.id] = td;
            td.id = sys.id;
            td.now = 0;
            if( sys.missionType == 1 ){
                this.dayTaskArr.push( sys );
            }else{
                this.achievementArr.push( sys );
            }
        }
    }

    public getDayTask():Array<SysMission>{
        return this.dayTaskArr;
    }

    public getAchievementTask( value:boolean ):Array<SysMission>{
        if( value ){
            let aArr = [];
            for( let a of this.achievementArr ){
                let td = this.getTaskData( a.id );
                if( td.isReceived() == false ){
                    if( td.isOver() ){
                        aArr.unshift( a );
                    }else{
                        aArr.push( a );
                    }
                }
            }
            return aArr;
        }else{
            let arr:Array<SysMission> = [];
            for( let sys of this.achievementArr ){
                let td = this.getTaskData( sys.id );
                if( td.now == -1 ){
                    arr.push( sys );
                }
            }
            return arr;
        }
    }

    public getData(): string {
        let str:string = "";
        str = str + this.overArr.arr.join(",") + ".";
        for( let key in this.nowMap.map ){
            let arr = this.nowMap.map[key];
            for( let td of arr ){
                str += ( td.id + "," + td.now + "," );
            }
        }
        return str;
    }

    public getTaskData( id:number ):TaskData{
        return this.taskMap[id];
    }

    public setData( value:string ): void {
        if( value != null ){
            //初始化
            let arr = value.split(".");
            if( arr[0] != "" ){
                this.overArr.arr = arr[0].split(",");
                for( let a of this.overArr.arr ){
                    let overId = parseInt(a);
                    let td:TaskData = this.taskMap[overId];
                    td.now = -1;
                }
            }
            let arr2 = arr[1].split(",");
            if( arr2.length > 0 ){
                arr2.pop();
            }
            for( let i:number = 0; i < arr2.length; i+=2 ){
                let id = parseInt( arr2[i] );
                let now = parseInt( arr2[i+1] );
                let td:TaskData = this.taskMap[id];
                td.now = now;
            }
        }
        let sysArr:Array<SysMission> = App.getInstance().configManager.getDataArr( MyGameInit.sys_mission );
        //分类
        for( let sysMission of sysArr ){
            if( sysMission.missionNamesign == 1 ){
                continue;
            }
            if( this.overArr.contain(sysMission.id + "") == false ){
                this.nowMap.setData( sysMission.type , this.taskMap[sysMission.id] );
            }
        }
    }

    public one( type:number , subType:number = -1 ):void{
        let arr = this.nowMap.getData( type );
        for( let taskData of arr ){
            let sys:SysMission = App.getConfig( MyGameInit.sys_mission , taskData.id );
            if( sys.subType == subType ){
                taskData.now++;
            }
        }
    }

    public onPLAY_AD():void{
        this.one( TASK_TYPE.AD );
    }

    public onKILL_BOSS():void{
        this.one( TASK_TYPE.KILL_BOSS );
    }

    public onSTAGE( stageId:number ):void{
        this.one( TASK_TYPE.STAGE ,stageId );
    }

    public onMERGE():void{
        this.one( TASK_TYPE.MERGE );
    }

    public onEQUIP_LV_NUM( lv:number ):void{
        this.one( TASK_TYPE.EQUIP_LV_NUM , lv );
    }

    /**
     * 领取这个任务的奖励
     * @param id 
     */
    public overTask( id:number , bei:number = 1):void{
        let sys:SysMission = App.getConfig( MyGameInit.sys_mission , id );
        let td:TaskData = this.taskMap[id];
        if( td.now == -1 ){
            return;
        }
        td.now = -1;
        this.nowMap.deleteData( sys.type , td , 0 );
        this.overArr.push( id + "" );
        this.bagSession.changeGold( sys.gold * bei  , GOLD_TYPE.TASK );
        App.dialog( MyGameInit.NewGetItemDialog , false, sys.gold * bei );
        App.sendEvent( MyEvent.TASK_UPDATE );
    }

    public onNEW_DAY():void{
        for( let sys of this.dayTaskArr ){
            this.overArr.delete( sys.id + "" , 0 );
            //如果这个任务已经完成了 从这里去掉
            let td:TaskData = this.taskMap[sys.id];
            this.nowMap.setData2( sys.type , td );
            td.now = 0;
        }
        this.one( TASK_TYPE.LOGIN );
        if( this.newerSession.isNew ){
            return;
        }
        App.onEvent( GameEvent.ENTER_SCENE , this, this.enterSceneFun );
    }

    public enterSceneFun( url:string ):void{
        if( url == MyGameInit.MainScene ){
            App.getInstance().eventManager.off( GameEvent.ENTER_SCENE, this, this.enterSceneFun  );
            Laya.timer.once( 500 , this, this.timeFun );
        }
    }

    public timeFun():void{
        App.getInstance().openDialogManager.openOnyByOne( MyGameInit.TASK );
    }

}

export class TaskData{
    public id:number = 0;
    public now:number = 0;
    
    constructor(){
        
    }

    public setString(value:string):void{
        let arr = value.split(",");
        this.id = parseInt( arr[0] );
        this.now = parseInt( arr[1] );
    }

    public getString():string{
        return this.id + "," + this.now;
    }

    public isOver():boolean{
        let sys = <SysMission>App.getConfig(MyGameInit.sys_mission, this.id );
        return this.now >= sys.max;
    }

    /**
     * 已领取
     */
    public isReceived():boolean{
        return this.now == -1;
    }
}

export enum TASK_TYPE{
    AD = 1,
    STAGE = 2,
    EQUIP_LV_NUM = 3,
    MERGE = 4,
    KILL_BOSS = 5,
    LOGIN = 6
}