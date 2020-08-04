import Session from "../../game/Session";
import BagSession, { GOLD_TYPE } from "./BagSession";
import App from "../../game/App";
import BattleSession from "./BattleSession";
import MyEvent from "../MyEvent";
import DataSession from "./DataSession";
import GameEvent from "../../game/GameEvent";
import NewerSession from "./NewerSession";
import MyGameInit from "../MyGameInit";
import TianFuSession from "./TianFuSession";

export default class TimeGoldSession extends Session
{
    public bagSession:BagSession = null;
    public battleSession:BattleSession = null;
    public dataSession:DataSession = null;
    public newerSession:NewerSession = null;
    public tianFuSession:TianFuSession = null;

    /**
     * 当前存储的金币数
     */
    public gold:number = 0;
    public reward_min:number = 0;//已经发金币到第几分钟
    public endTime:number = 0;
    public startTime:number = 0;
    
    public static ONE_DAY:number = 24 * 60 * 60 * 1000;
    
    constructor(){
        super();
        App.onEvent( MyEvent.NEWER_INIT ,this, this.initFun );
        App.onEvent( MyEvent.DATA_FROM_SERVER,this, this.dataServerFun );
        App.onEvent( GameEvent.ENTER_SCENE , this, this.enterSceneFun );
    }

    public enterSceneFun( url:string ):void{
        if( this.newerSession.isNew ){
            App.getInstance().eventManager.off( GameEvent.ENTER_SCENE, this, this.enterSceneFun  );
            return;
        }
        if( url == MyGameInit.MainScene ){
            App.getInstance().eventManager.off( GameEvent.ENTER_SCENE, this, this.enterSceneFun  );
            Laya.timer.once( 100 , this, this.timeFun );
        }
    }

    public timeFun():void{
        App.getInstance().openDialogManager.openOnyByOne( MyGameInit.TimeGoldDialog  );
    }

    /**
     * 初始化数据
     */
    public initFun():void{
        this.startNewDay();
        this.goldTimeStart();
    }

    public loopFun():void{
        let ctime = Math.min( Laya.Browser.now() , this.endTime );
        let now_min_time = this.getMinByTime( ctime );
        if( this.reward_min != now_min_time ){
            this.addGoldOnce();
            this.reward_min = now_min_time;
        }
    }

    /**
     * 游戏开始 开始计算钱
     */
    public dataServerFun():void{
        
        this.startTime = this.endTime - TimeGoldSession.ONE_DAY;
        let nowMin:number = 0;
        if( this.endTime < Laya.Browser.now() ){
            nowMin = this.getMinByTime( this.endTime );
        }else{
            nowMin = this.getMinByTime( Laya.Browser.now() );
        }
        let rgold = ( nowMin - this.reward_min ) * this.getOneGold();
        this.reward_min = nowMin;
        this.setGold( this.gold + rgold );
        this.goldTimeStart();
    }

    public goldTimeStart():void{
        Laya.timer.frameLoop( 1,this,this.loopFun );
    }

    

    /**
     * 得到所有金币
     */
    public rewardGold( useAd:boolean ):void{
        let agold:number = this.gold;
        if( useAd ){
            agold = this.gold * 3;
        }
        this.bagSession.changeGold( agold , GOLD_TYPE.TIME_GOLD );
        this.setGold( 0 );
        if( this.endTime <= Laya.Browser.now()  ){
            this.startNewDay();    
        }
        this.dataSession.saveData();
    }

    public startNewDay():void{
        this.endTime = Laya.Browser.now() + TimeGoldSession.ONE_DAY;
        this.startTime = this.endTime - TimeGoldSession.ONE_DAY;
        this.reward_min = 0;
    }

    /**
     * 精确当前时间 是一天中的第几分钟
     */
    public getMinByTime( time:number ):number{
        let t = time - this.startTime;
        return Math.floor( t / ( 60 * 1000 ) );
    }
    
    public getNowTime():Array<number>{
        if( this.endTime < Laya.Browser.now() ){
            return [0,0,0,0];
        }
        // let now_min_time = this.getMinByTime( Laya.Browser.now() );
        // if( this.reward_min != now_min_time ){
        //     this.addGoldOnce();
        //     this.reward_min = now_min_time;
        // }
        let t = this.endTime - Laya.Browser.now();
        let arr = this.getLeft( t , 3600 * 1000 );
        let hour = arr[0];
        arr = this.getLeft( arr[1] , 60 * 1000 ); 
        let min = arr[0];
        arr = this.getLeft( arr[1] , 1000 );
        let second = arr[0];
        arr = this.getLeft( arr[1] , 1 );
        let ms = arr[0];
        return [hour,min,second,ms];
    }
    
    /**
     * 时间到 加一次金币
     */
    public addGoldOnce():void{
        this.setGold( this.gold + this.getOneGold() );
        this.reward_min = this.getMinByTime( Laya.Browser.now() );
        this.dataSession.saveData();
    }

    public getOneGold():number{
        let max = this.battleSession.getMaxStageNumber();
        let addGold = Math.ceil( max / 2 + 1 );
        addGold = addGold * ( 100 + this.tianFuSession.offLineGold )/100;
        addGold = parseInt( addGold + "" );
        return addGold;
    }

    public setGold( value:number ):void{
        this.gold = value;
        App.sendEvent( MyEvent.TIME_GOLD_UPDATE );
    }

    private getLeft( t:number , v:number ):Array<number>{
        let a = parseInt( (t / v) + "" );
        let b = t - a * v;
        return [a,b];
    }
}