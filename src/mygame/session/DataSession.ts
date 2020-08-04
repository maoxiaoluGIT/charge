import Session from "../../game/Session";
import BagSession from "./BagSession";
import PetSession from "./PetSession";
import App from "../../game/App";
import MyEvent from "../MyEvent";
import MyGameInit from "../MyGameInit";
import BattleSession from "./BattleSession";
import TimeGoldSession from "./TimeGoldSession";
import NewerSession from "./NewerSession";
import SetSession from "./SetSession";
import LogType from "./LogType";
import SdkSession from "./SdkSession";
import TianFuSession from "./TianFuSession";
import IJsonData from "./IJsonData";
import Tips from "../scene/Tips";
import MyConfig from "../../MyConfig";

export default class DataSession extends Session{
    public bagSession:BagSession = null;
    public petSession:PetSession = null;
    public battleSession:BattleSession = null;
    public timeGoldSession:TimeGoldSession = null;
    public newerSession:NewerSession = null;
    public setSession:SetSession = null;
    public sdkSession:SdkSession = null;
    public tianFuSession:TianFuSession = null;

    public jsonObj:any = {};

    public static TEST:number = 0;
    public static WX:number = 1;
    public static QQ:number = 2;
    public static DOUYIN:number = 3;
    
    public static GAME_VER:string = "5.0.3";
    public static START_TIME:number = 0;
    
    public static ONLY_ID:number = Math.random();
    public static local_name = "test_0500";

    /**
     * 数据是否准备完毕 有可能还没准备完
     */
    public dataIsInit:boolean = false;

    constructor(){
        super();
        App.onEvent( MyEvent.LOGIN, this , this.loginFun );
        //Laya.loader.on(Laya.Event.ERROR,this,this.loadErrorFun);        
    }

    public loadErrorFun( url:string ):void{
        this.log( LogType.LOAD_ERROR , url );
    }

    public onWX_ON_HIDE():void{
        this.saveData();
        if( this.newerSession.isNew ){
            this.log( LogType.WX_HIDE );
        }
    }

    public onWX_ON_SHOW():void{
        if( this.newerSession.isNew ){
            this.log( LogType.WX_SHOW );
        }
    }

    public loginFun():void {
        //新的登录逻辑
        if( MyConfig.PLATFORM == 0 ){
            if(Laya.Browser.window.wx){
                Laya.Scene.showLoadingPage();            
                this.loginGame511Wx();
            }else{
                this.localLogin({});
            }
        } 
        else if( MyConfig.PLATFORM == DataSession.WX ){
            Laya.Scene.showLoadingPage();
			this.loginWXServer();
        }
        else{
			App.getInstance().openScene( MyGameInit.TestScene );
		}
    }

    public loginGame511Wx():void{
        console.log(" loginGame511Wx ");
        //this.sdkSession.
        var obj:any = {};
        obj.success = ( res:any )=>{
            //console.log(res);
            //{errMsg: "login:ok", code: "021Sm5IE00bm2i2yH5JE0SUUHE0Sm5Ib"}
            var http = new Laya.HttpRequest();
            //let url:string = MyConfig.IP + "gamex2/login";
            let url:string = "https://game.kuwan511.com/gamelogin/login"
            let httpdata:string = "scode=" + 1 + "&jscode=" + res.code;
            http.send( url + "?" + httpdata  , null  ,"GET" );
            //console.log( httpdata );
            http.once( Laya.Event.COMPLETE , this , this.loginWXFun ,[http] );
            http.once( Laya.Event.ERROR , this , this.loginErrorFun  ,[http] );
            http.once( Laya.Event.PROGRESS ,this, this.loginProFun  ,[http] );
            
        }
        Laya.Browser.window.wx.login( obj );  
    }

    public loginWXFun(http:Laya.HttpRequest , res:any ):void{
        //记录每个http登陆的状态
        //console.log("ccccccccccc" ,  saveKey );
        let j:any = JSON.parse(res);       
        this.openid= j.openid;
        console.log("openid = ", j.openid);
        //{session_key: "aexVNsXkq6CK+D0VUxyJtg==", openid: "oJjEa48zjMN9b8wBwYODXe29-_z4"}
        this.localLogin(res);
        //this.saveKey = j.userInfo.userId;
        // //console.log( this.saveKey );
        // this.startHeart();
        // this.requestData();
        // this.loginLogStatus( http.http.status );
    }

    public loginWXServer():void{
        var obj:any = {};
        obj.success = ( res:Object )=>{
            this.loginMyServer(res);
        }
        //if( Laya.Browser.onQGMiniGame ){
            Laya.Browser.window.qg.login( obj );   
        // }else{
        //     Laya.Browser.window.wx.login( obj );
        // }
    }

    public localLogin( res:any ):void{
        this.saveKey = DataSession.local_name;
        this.startHeart();
        
        this.dataIsInit = true;

        var str = Laya.LocalStorage.getItem(this.saveKey);
        if(!str || str == "0" || str == "" ){
            //新玩家
            this.log( LogType.NEW_PLAYER , this.saveKey );
            App.sendEvent( MyEvent.NEWER_INIT );
            App.getInstance().openScene( MyGameInit.NewerScene );
        }else if( str == "1" ){
            App.sendEvent( MyEvent.SECOND_NEW );
            App.getInstance().openScene(MyGameInit.MainScene);
        }else{
            console.log("本地数据是:");
            console.log( str );
            this.log( LogType.PLAYER_DATA , str );
            this.jsonObj = JSON.parse(str);
            this.setSessionData();
            App.sendEvent(MyEvent.DATA_FROM_SERVER);
            App.getInstance().openScene( MyGameInit.MainScene );
        }
    }

    public loginMyServer( res:any ):void{
        let j = JSON.stringify(res.data);
        
        if( res.token ){
            var http = new Laya.HttpRequest();
            //let url:string = MyConfig.IP + "gamex2/login";
            let url:string = "https://game.kuwan511.com/gamelogin/login"
            let httpdata:string = "scode=" + 3 + "&jscode=" + res.token;
            http.send( url + "?" + httpdata  , null  ,"GET" );
            //console.log( httpdata );
            http.once( Laya.Event.COMPLETE , this , this.loginMyServerFun ,[http] );
            http.once( Laya.Event.ERROR , this , this.loginErrorFun  ,[http] );
            http.once( Laya.Event.PROGRESS ,this, this.loginProFun  ,[http] );
        }else{
            console.log("登陆失败:",res);
        }
    }

    public loginProFun( http:Laya.HttpRequest ,e:Object):void{
        this.loginLogStatus( http.http.status );
    }

    public loginErrorFun( http:Laya.HttpRequest ,e:Object  ):void{
        this.loginLogStatus( http.http.status );
    }

    public saveKey:string;
    public openid:string = "";

    public loginMyServerFun(http:Laya.HttpRequest , saveKey:any ):void{
        //记录每个http登陆的状态
        //console.log("ccccccccccc" ,  saveKey );
        let j:any = JSON.parse(saveKey);
        //console.log( "dddd" , saveKey.userInfo.userId );
        console.log("eeee" , j );
        this.saveKey = j.userInfo.userId;
        //console.log( this.saveKey );
        this.startHeart();
        this.requestData();
        this.loginLogStatus( http.http.status );
    }

    public loginLogStatus( value:any ):void{
        this.log( LogType.LOGIN_STATUS , value );
    }

    /**
     * 请求服务器 得到最新数据 
     * 这个一般就登陆时请求一次
     */
    public requestData():void{
        App.http( MyConfig.IP + "gamex2/gamedata" ,"skey=" + this.saveKey  ,"post",this,this.requestDataFun  );
    }

    public requestDataFun( str:string ):void{
        this.dataIsInit = true;
        if( str == "0" || str == "" ){
            //新玩家
            this.log( LogType.NEW_PLAYER , this.saveKey );
            App.sendEvent( MyEvent.NEWER_INIT );
            App.getInstance().openScene( MyGameInit.NewerScene );
        }else if( str == "1" ){
            App.sendEvent( MyEvent.SECOND_NEW );
            App.getInstance().openScene(MyGameInit.MainScene);
        }else{
            console.log("服务器数据是:");
            console.log( str );
            this.log( LogType.PLAYER_DATA , str );
            this.jsonObj = JSON.parse(str);
            this.setSessionData();
            App.sendEvent(MyEvent.DATA_FROM_SERVER);
            App.getInstance().openScene( MyGameInit.MainScene );
        }
    }

    public requestSaveData( isImportant:boolean = false ){
        if(this.saveKey == DataSession.local_name){
            Laya.LocalStorage.setItem(this.saveKey,JSON.stringify(this.jsonObj));
            return;
        }
        //console.log("this.saveKey == " , this.saveKey);        
        if( isImportant ){
            App.http( MyConfig.IP + "gamex2/save2" ,"skey=" + this.saveKey + "&gamedata=" + JSON.stringify(this.jsonObj) + "&type=1&num=" + this.jsonObj.stageNum ,"post",this,this.requestSaveDataFun  );    
        }else{
            App.http( MyConfig.IP + "gamex2/save2" ,"skey=" + this.saveKey + "&gamedata=" + JSON.stringify(this.jsonObj) + "&type=0&num=0","post",this,this.requestSaveDataFun  );    
        }
    }

    /**
     * 记录到地图
     */
    public save1():void{
        if(this.saveKey == DataSession.local_name){
            Laya.LocalStorage.setItem(this.saveKey,"1");
            return;
        }
        App.http( MyConfig.IP + "gamex2/save2" ,"skey=" + this.saveKey + "&gamedata=1&type=0&num=0","post");
    }
    
    public requestSaveDataFun( str:string ):void{
        //无视这个方法
        console.log( "存储成功= " + str );
    }

    public saveData(isImportant:boolean = false ):void{
        if( this.dataIsInit == false ){
            return;
        }
        if( this.newerSession.isNew ){
            return;
        }
        this.resetJsonObj();
        if( this.jsonObj.item == "" ){
            this.log(LogType.ERROR_ITEM_NULL);
            console.log( "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" );
            return;
        }
        this.requestSaveData(isImportant);
    }

    public clearData():void {
        this.dataIsInit = false;
        if(this.saveKey == DataSession.local_name){
            Laya.LocalStorage.setItem(this.saveKey,"0");
            return;
        }
        App.http( MyConfig.IP + "gamex2/save2" ,"skey=" + this.saveKey + "&gamedata=0&type=0&num=0","post",this,this.clearFun);
    }

    public clearFun():void{
        Tips.show("已经清档，请您重启游戏");
    }

    /**
     * 自动注册属性
     * @param target 
     * @param pName 
     */
    public regAtt( a:IJsonData ):void{
        this.regArr.push( a );
    }

    public regArr:Array<IJsonData> = [];

    /**
     * 从json里得到需要的数据
     */
    public setSessionData():void {
        
        

        this.bagSession.gold = this.jsonObj.gold;
        if( this.jsonObj.gold == null ){
            this.bagSession.gold = 0;
        }
        this.petSession.eggNum = this.jsonObj.egg;
        this.battleSession.stageNum = this.jsonObj.stageNum;
        this.bagSession.setItemString( this.jsonObj.item );
        
        this.timeGoldSession.endTime = this.jsonObj.timeGoldEndTime;
        this.timeGoldSession.reward_min = this.jsonObj.timeGoldReward_min;
        this.timeGoldSession.gold = this.jsonObj.timeGoldGold;
        this.newerSession.isNew = this.jsonObj.isNew;
        this.setSession.setMusic( this.jsonObj.music );
        this.setSession.setSound( this.jsonObj.sound );
        

        this.battleSession.setNoPlayStage( this.jsonObj.noPlayStage );
        
        this.sdkSession.shareTime = this.jsonObj.shareTime?this.jsonObj.shareTime:0;
        this.sdkSession.shareTimes = this.jsonObj.shareTimes?this.jsonObj.shareTimes:0;

        this.tianFuSession.setLvString( this.getString( this.jsonObj.talentStr ) );
        this.tianFuSession.lvTimes = this.getNumber( this.jsonObj.talentLv );
        
        this.battleSession.setKillBoss( this.jsonObj.killBoss );

        this.bagSession.setBadString( this.jsonObj.bad );
        console.log( "分享的数据是:" , this.sdkSession.shareTime ,this.sdkSession.shareTimes  );
        
        for( let a of this.regArr ){
            let key = App.getInstance().getInjectionName( a );
            a.setData( this.jsonObj[ key ] );
        }

        if( this.jsonObj.loginTime == null ){
            App.sendEvent(MyEvent.NEW_DAY);
        }else{
            let last = new Date( this.jsonObj.loginTime );
            let now = new Date();
            if( now.getDate() != last.getDate() ){
                App.sendEvent(MyEvent.NEW_DAY);
            }
        }
        
        this.timeFun( 0 );

        this.jsonObj.loginTime = Date.now();
        //this.jsonObj.loginTime = Date.now() - 24 * 60 * 60 * 1000;
    }

    public timeFun( send:number ):void{
        if( send == 1){
            App.sendEvent(MyEvent.NEW_DAY);
        }
        let now = new Date();
        let h = 60 * 60 * 1000;
        let time:number = 24 * h - now.getHours() * h - now.getMinutes() * 60 * 1000 - now.getSeconds() * 1000;
        Laya.timer.once( time + 1000 ,this,this.timeFun , [1] );
    }

    public getNumber(value:any):number{
        if( value == null ){
            return 0;
        }
        return value;
    }

    public getString( value:any ):string{
        if( value == null ){
            return null;
        }
        if( value == "NaN" ){
            return null;
        }
        return value;
    }

    /**
     * 从各个模块 得到要存储的数据
     */
    public resetJsonObj():void {
        this.jsonObj.gold = this.bagSession.gold;
        if( this.bagSession.gold == null ){
            this.jsonObj.gold = 0;
        }
        this.jsonObj.egg = this.petSession.eggNum;
        this.jsonObj.stageNum = this.battleSession.stageNum;
        this.jsonObj.item = this.bagSession.getItemString();
        
        this.jsonObj.timeGoldEndTime = this.timeGoldSession.endTime;

        this.jsonObj.timeGoldReward_min = this.timeGoldSession.reward_min;
        this.jsonObj.timeGoldGold = this.timeGoldSession.gold;

        this.jsonObj.gamever = DataSession.GAME_VER;
        this.jsonObj.isNew = this.newerSession.isNew;

        this.jsonObj.music = this.setSession.music;
        this.jsonObj.sound = this.setSession.sound;
        this.jsonObj.platform = MyConfig.PLATFORM;

        this.jsonObj.noPlayStage = this.battleSession.getNoPlayStage();
        
        this.jsonObj.shareTime = this.sdkSession.shareTime;
        this.jsonObj.shareTimes = this.sdkSession.shareTimes;

        this.jsonObj.talentStr = this.tianFuSession.getLvString();
        this.jsonObj.talentLv = this.tianFuSession.lvTimes;

        this.jsonObj.killBoss = this.battleSession.getKillBoss();

        this.jsonObj.bad = this.bagSession.getBadString();

        for( let a of this.regArr ){
            let key = App.getInstance().getInjectionName( a );
            this.jsonObj[ key ] = a.getData();
        }
    }

    public startHeart():void{
        Laya.timer.loop( 60 * 1000 , this, this.heartFun );
    }

    public heartFun():void{
        //this.log( LogType.HEART );
    }

    public log( type:number , content:string = "" ):void {
        if( this.saveKey == DataSession.local_name ){
            console.log( "log " + this.saveKey )
            return;
        }
        console.log( "log" + type );
        var arr:Array<any> = [];
        arr.push( Laya.Browser.now() );
        arr.push( DataSession.GAME_VER );
        arr.push( this.saveKey );
        arr.push( MyConfig.PLATFORM );
        arr.push( DataSession.ONLY_ID );
        arr.push( type );
        arr.push( content );
        arr.push( this.sdkSession.wxName );
        let str = arr.join( "\t" );
        // var str:String = "";
        // for( var i:number = 0; i < arr.length; i++ ){
        //     str += ( arr[i] + "\t" );
        // }
        App.http( MyConfig.IP + "gamex2/gamelog" ,"log=" + str ,"post" );
    }

    public static staticLog( type:number , content:string = "" ):void{
        if( DataSession.GAME_VER == "5.0.3"){
            return;
        }
        if( Laya.Browser.onMiniGame == false ){
            return;
        }
        var arr:Array<any> = [];
        arr.push( Laya.Browser.now() );
        arr.push( DataSession.GAME_VER );
        arr.push( "have no savekey" );
        arr.push( 1 );
        arr.push( DataSession.ONLY_ID );
        arr.push( type );
        arr.push( content );
        var str:String = "";
        for( var i:number = 0; i < arr.length; i++ ){
            str+=( arr[i] + "\t" );
        }
        App.http( MyConfig.IP + "gamex2/gamelog" ,"log=" + str ,"post" );
    }

    public saveRank():void {
        if(this.saveKey == DataSession.local_name){
            return;
        }

        if( this.newerSession.isNew ){
            return;
        }
        if( Laya.Browser.onMiniGame == false ){
            let score:number = this.getScore();
            let item:string = this.getItem();
            App.http( MyConfig.IP + "gamex2/saveRank" , "skey=" + this.saveKey + "&name=骑马合成冲" + "&url=sence/action.png" + "&scorestr=" + score + "&items=" + item , "post" );
            return;
        }
        if( this.sdkSession.haveRight == false ){
            return;
        }
        let score:number = this.getScore();
        let item:string = this.getItem();
        console.log( "排行榜数据" , score ,item );
        App.http( MyConfig.IP + "gamex2/saveRank" , "skey=" + this.saveKey + "&name=" + this.sdkSession.wxName + "&url=" + this.sdkSession.wxHead + "&scorestr=" + score + "&items=" + item , "post" );
    }

    public getItem():string {
        let s:string = "";
        for( let a of this.bagSession.playerEquipArr ){
            if( a ){
                s += ( a.id + ",");
            }
        }
        return s;
    }

    public getRank( caller:any  , listener:Function  ):void{
        if(this.saveKey == DataSession.local_name){
            return;
        }
        App.http( MyConfig.IP + "gamex2/getRank" , "skey=" + this.saveKey + "&st=0&et=50", "GET",caller , listener );
    }

    public getScore():number {
        let v:number = 0;
        for( let a of this.bagSession.playerEquipArr ){
            if( a ){
                v += a.lv;
            }
        }
        console.log("playerarr:", this.bagSession.playerEquipArr );
        v+=this.battleSession.stageNum;
        let a1 = this.battleSession.killBossArr.arr;
        console.log("已过boss:",a1);
        for( let b of a1 ){
            v += parseInt(b);
        }
        console.log( "得到排行榜积分" , v );
        return v;
    }
}