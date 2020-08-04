import Session from "../../game/Session";
import { SysStageInfo, SysEnemy, SysItem, Equip } from "../config/SysConfig";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import GameEvent from "../../game/GameEvent";
import MyEvent from "../MyEvent";
import NewerSession from "./NewerSession";
import SdkSession from "./SdkSession";
import MyArray from "../../game/MyArray";
import DataSession from "./DataSession";

export default class BattleSession extends Session
{
    public newerSession:NewerSession = null;
    public sdkSession:SdkSession = null;
    public dataSession:DataSession = null;
    /**
     * 过到第几关了 配置表里的id
     */
    public stageNum:number = 1;
    public noPlayerStage:MyArray = new MyArray();
    /**
     * 过了几个boss 里面记录着他们的id
     */
    public killBossArr:MyArray = new MyArray();

    public killBoss():void{
        this.killBossArr.push(this.sys.id);
        this.dataSession.saveRank();
        App.sendEvent( MyEvent.KILL_BOSS );
    }

    public getKillBoss():string{
        return this.killBossArr.arr.join(",");
    }

    public setKillBoss( v:string ):void{
        if( v == null || v == "" || v == "NaN"){
            return;
        }
        let a1 = v.split(",");
        for( let a of a1 ){
            this.killBossArr.push( parseInt(a) );
        }
    }

    public gameOver():void {
        App.sendEvent( MyEvent.STAGE , this.sys.id );
        if( this.sys.stageType == 2 ){
            return;
        }
        if( this.stageNum != this.sys.id ){
            return;
        }
        if( this.sys.nextId == 0 ){
            return;
        }
        this.stageNum = this.sys.nextId;
        this.sdkSession.savePlayerData(this.stageNum);
        this.addNoPlayStage( this.stageNum );
        
        let arr = SysStageInfo.getStageInfo( this.sys.starID );
        
        if( this.stageNum == arr[4].id ){
            this.addNoPlayStage( arr[arr.length-2].id );
        }
        if( this.stageNum == arr[9].id ){
            this.addNoPlayStage( arr[arr.length-1].id );
        }

        this.dataSession.saveRank();
    }

    public onNEWER_INIT():void{
        this.addNoPlayStage( 1 );
    }

    public addNoPlayStage( stageIndex:number ):void {
        this.noPlayerStage.push( stageIndex + "" );
    }

    public deleteNoPlayStage( stageIndex:number ):void{
        this.noPlayerStage.delete( stageIndex + "", 0 );
    }

    public getNoPlayStage():string{
        return this.noPlayerStage.arr.join(",");
    }

    public setNoPlayStage(str:string ):void{
        if( str == null ){
            this.noPlayerStage.arr = [];
            return;
        }
        this.noPlayerStage.arr = str.split(",");
    }

    constructor(){
        super();
    }

    public setNewer():void{
        let s = new SysStageInfo();
        s.bossGold = 1000;
        s.stageType = 1;
        s.starID = 1001;
        s.id = 1;
        s.monsterGroups = "20001,20005";
        s.monsterBoss = 20071;
        s.dropGold = "10,37";
        s.dropbuff = "4";
        s.collect = "1,3";
        s.collectDrop = 0;
        this.sys = s;
    }

    public sys:SysStageInfo;
    public setSysStageInfo(sys:SysStageInfo):void{
        this.sys = sys;
    }

    public setMaxStage():void {
        let sys = App.getConfig( MyGameInit.sys_stageinfo , this.sys.nextId  );
        this.setSysStageInfo( sys );
    }

    public getMaxStageNumber():number{
        return this.stageNum;
    }

    /**
     * 得到随机一个怪物
     */
    public getNewMonster():SysEnemy{
        let monsterId = App.RandomByArray( this.sys.monsterArr );
        return App.getConfig( MyGameInit.sys_enemy , monsterId );
    }
    
    /**
     * 得到boss的配置
     */
    public getBossSys():SysEnemy{
        return App.getConfig( MyGameInit.sys_enemy , this.sys.monsterBoss );
    }

    public isBossStage():boolean{
        return this.sys.stageType == 2;
    }

    /**
     * 
     * @param havePet 根据当前战场配置文件掉落装备
     */
    public getEquip( havePet:boolean = true  ):SysItem {
        let elv = App.getRandom2( this.sys.lvMin , this.sys.lvMax );
        let typeArr:Array<number> = [ EQUIP_TYPE.BODY , EQUIP_TYPE.WEAPON ,EQUIP_TYPE.HEAD ,EQUIP_TYPE.HORSE ];
        if( havePet ){
            typeArr.push( EQUIP_TYPE.PET );
        }
        let etype = App.RandomByArray( typeArr );  
        let sysi = SysItem.ItemMap[ etype + "_" + elv ];
        return sysi;
    }

    /**
     * 战场里掉的 可能是buff
     */
    public getNewItem():any{
        if( this.newerSession.isNew ){
            return SysItem.ItemMap[ EQUIP_TYPE.WEAPON + "_" + 9 ];
        }
        
        //19 pet 5
        
        let typeArr:Array<number> = [ EQUIP_TYPE.BODY , EQUIP_TYPE.WEAPON ,EQUIP_TYPE.HEAD ,EQUIP_TYPE.HORSE , EQUIP_TYPE.PET ,EQUIP_TYPE.BUFF_ATT ];
        let weightArr:Array<number> = [19,19,19,19,5,19];
        let etype = App.RandomWeight( typeArr ,weightArr );//App.RandomByArray( typeArr );
        if( etype == EQUIP_TYPE.BUFF_ATT ){
            //就是掉的buff
            let buffArr:Array<number> = [EQUIP_TYPE.BUFF_ATT,EQUIP_TYPE.BUFF_CRIT,EQUIP_TYPE.BUFF_DEF,EQUIP_TYPE.BUFF_SPEED];
            etype = App.RandomByArray( buffArr );
        }
        if( etype >= 10 ){
            return etype;
        }
        return this.getEquip();
    }

    /**
     * 只有boss关用这个
     * 其他关是由时间控制的 不需要这样
     */
    public getEquipArr():Array<SysItem>{
        let a:Array<SysItem> = [];
        for( let i:number = 0; i < this.sys.collectDrop; i++ ){
            a.push( this.getEquip(false) );
        }
        return a;
    }

    public openSelectStageDialog( stageId:number ):void{
        if( stageId == 1001 ){
            App.dialog(MyGameInit.SelectStage,true,stageId);
        }else if( stageId == 2001 ){
            App.dialog(MyGameInit.SelectStage2,true,stageId);
        }else if( stageId == 3001 ){
            App.dialog(MyGameInit.SelectStage3 ,true,stageId);
        }
    }
}

export enum EQUIP_TYPE{
    WEAPON = 2,
    HEAD = 3,
    BODY = 4,
    HORSE = 5,
    PET = 6,
    CRIT = 7,
    BUFF_CRIT = 10,
    BUFF_DEF = 11,
    BUFF_ATT = 12,
    BUFF_SPEED = 13
}