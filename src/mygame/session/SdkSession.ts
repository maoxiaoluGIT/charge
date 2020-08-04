import Session from "../../game/Session";
import App from "../../game/App";
import MyEvent from "../MyEvent";
import GameEvent from "../../game/GameEvent";
import MyGameInit from "../MyGameInit";
import DataSession from "./DataSession";
import Tips from "../scene/Tips";
import LogType from "./LogType";

export default class SdkSession extends Session {
    public dataSession:DataSession = null;
    public haveRight:boolean = false;

    constructor(){
        super();
        if( Laya.Browser.onMiniGame == false ){
            return;
        }
        
        Laya.Browser.window.wx.updateShareMenu({});
        Laya.Browser.window.wx.showShareMenu({});
        Laya.Browser.window.wx.onShareAppMessage( ()=>{
            return this.getShareObject();
        } );
        
        Laya.Browser.window.wx.getSetting({
            success: res=>{
                if( res.authSetting["scope.userInfo"] == true ){
                    console.log( "已经有授权了" );
                    this.getUserInfo();
                }else{
                    this.haveRight = false;
                    console.log( "没有授权" );
                }
            }
        });
        
        Laya.Browser.window.wx.setKeepScreenOn({keepScreenOn:true});
        Laya.Browser.window.wx.onShow( (res)=>{
            App.sendEvent( MyEvent.WX_ON_SHOW );
        } );

        Laya.Browser.window.wx.onHide( (res)=>{
            App.sendEvent( MyEvent.WX_ON_HIDE );
        } );

        const updateManager = Laya.Browser.window.wx.getUpdateManager();

        updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调
            console.log("版本更新回调:" , res.hasUpdate );
        });

        updateManager.onUpdateReady( function () {
        
        Laya.Browser.window.wx.showModal( {
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: function (res) {
                if (res.confirm) {
                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                    updateManager.applyUpdate();
                }
            }
        } )
        })

        updateManager.onUpdateFailed(function () {
            // 新版本下载失败
        });

        let btn:any = {};
        btn.type = "image";
        let sty:any = {};
        sty.left = 0;
        sty.top = 300;
        sty.width = 44;
        sty.height = 44;
        //sty.backgroundColor = "#ffffff";
        //sty.borderWidth = 1;
        //sty.borderRadius = 1;
        sty.textAlign = "center";
        sty.fontSize = 28;
        sty.lineHeight = 30;
        btn.style = sty;
        btn.icon = "green";
        this.gameClubButton = Laya.Browser.window.wx.createGameClubButton(btn);
        App.getInstance().eventManager.on(GameEvent.OPEN_SCENE_START,this,this.openScene );
        Laya.timer.callLater( this,this.callLaterFun );
    }


    public wxName:string = null;
    public wxHead:string = null;

    public getUserInfo():void {
        Laya.Browser.window.wx.getUserInfo({
            success:(res)=>{
                var userInfo = res.userInfo;
                this.wxName = userInfo.nickName;
                this.wxHead = userInfo.avatarUrl;
                var gender = userInfo.gender; //性别 0：未知、1：男、2：女
                var province = userInfo.province;
                var city = userInfo.city;
                var country = userInfo.country;
                console.log( "已经授权了:" , this.wxName ,this.wxHead );
                this.haveRight = true;
            }
          });
    }

    public callLaterFun():void{
        this.initAd();
    }

    public gameClubButton:any;

    public openScene(url:string):void{
        if( url == MyGameInit.BattleScene ){
            this.gameClubButton.hide();
        }else{
            this.gameClubButton.show();
        }
    }
    
    public static FLY_BOX:number = 0;
    public static GAME_OVER:number = 1;
    public static GET_PET:number = 2;
    public static TIME_GOLD:number = 3;
    public static TREASURE:number = 4;
    public static ZHUAN:number = 5;
    public static AD_DIALOG:number = 7;
    public static TASK_REWARD:number = 8;

    public static NEXT_STAGE_CHAPING:number = 6;

    public adMap:any = {};
    
    private initAd():void {
        if( App.isSimulator() ){
            return;
        }

        if( Laya.Browser.onMiniGame ){
            // this.adMap[SdkSession.FLY_BOX] = "adunit-961fd03b6fac0683";
            // this.adMap[SdkSession.GAME_OVER] = "adunit-98b44cb96437ac93";
            // this.adMap[SdkSession.GET_PET] = "adunit-237729103790be65";
            // this.adMap[SdkSession.TIME_GOLD] = "adunit-7b46c29d0d9cf9b3";
            // this.adMap[SdkSession.TREASURE] = "adunit-d4c57c5c9ae67d48";
            // this.adMap[SdkSession.ZHUAN] = "adunit-61819bd988150e65";
            // this.adMap[SdkSession.NEXT_STAGE_CHAPING] = "adunit-8687ae6ea48ab104";
            // this.adMap[SdkSession.AD_DIALOG] = "adunit-ed6eb635c1d6b846";
            // this.adMap[SdkSession.TASK_REWARD] = "adunit-ad8e1d3e0117f62f";

            // this.adMap[SdkSession.FLY_BOX] = "146717";
            // this.adMap[SdkSession.GAME_OVER] = "146721";
            // this.adMap[SdkSession.GET_PET] = "146713";
            // this.adMap[SdkSession.TIME_GOLD] = "146710";
            // this.adMap[SdkSession.TREASURE] = "146715";
            // this.adMap[SdkSession.ZHUAN] = "146718";
            // this.adMap[SdkSession.NEXT_STAGE_CHAPING] = "146722";
            // this.adMap[SdkSession.AD_DIALOG] = "146714";
            // this.adMap[SdkSession.TASK_REWARD] = "146712";

            this.adMap[SdkSession.FLY_BOX] = "adunit-e54e9f66de1c0d3f";
            this.adMap[SdkSession.GAME_OVER] = "adunit-e54e9f66de1c0d3f";
            this.adMap[SdkSession.GET_PET] = "adunit-e54e9f66de1c0d3f";
            this.adMap[SdkSession.TIME_GOLD] = "adunit-e54e9f66de1c0d3f";
            this.adMap[SdkSession.TREASURE] = "adunit-e54e9f66de1c0d3f";
            this.adMap[SdkSession.ZHUAN] = "adunit-e54e9f66de1c0d3f";
            this.adMap[SdkSession.NEXT_STAGE_CHAPING] = "adunit-e54e9f66de1c0d3f";
            this.adMap[SdkSession.AD_DIALOG] = "adunit-e54e9f66de1c0d3f";
            this.adMap[SdkSession.TASK_REWARD] = "adunit-e54e9f66de1c0d3f";
        }

        //this.ad = Laya.Browser.window.wx.createRewardedVideoAd({adUnitId:this.adMap[SdkSession.FLY_BOX]});
        this.ad = Laya.Browser.window.wx.createRewardedVideoAd({adUnitId:"adunit-e54e9f66de1c0d3f"});
        this.ad.onClose( (res)=>{
            console.log("广告 观看结果返回");
            if ( res && res.isEnded || res===undefined ){
                this.lastAdSucTime = Laya.Browser.now();
                this.exeHandler();
                App.sendEvent( MyEvent.PLAY_AD );
                App.sendEvent( MyEvent.AD_EVENT , [ AD_STAT.VEDIO_SUC , this.currentAdType ] );
                App.sendEvent( MyEvent.AD_EVENT , [ AD_STAT.REWARD , this.currentAdType ] );
            
                this.dataSession.log( LogType.AD_SUC_OVER );
            }else{
                App.sendEvent( MyEvent.AD_EVENT , [ AD_STAT.VEDIO_FAIL , this.currentAdType ] );
            }
            App.sendEvent( MyEvent.AD_OVER );
        });
        this.ad.onError( err => {
            this.adStat = 2;
            this.errCode = err.errCode;
            App.sendEvent( MyEvent.AD_EVENT , [ AD_STAT.NO_HAVE , this.currentAdType ] );
            console.log("广告 加载错误:",err);
            if( this.errCode == 1004 ){
                console.log("加载视频失败,30秒后重试");
                Laya.timer.once( 30 * 1000 , this,this.retryAdFun );
            }
            this.dataSession.log( LogType.AD_FAIL , this.errCode + "" );
        });
        this.ad.onLoad( ()=>{
            this.adStat = 1;
            console.log("广告 加载成功");
        });
    }

    public retryAdFun():void{
        this.ad.load();
    }
    
    /**
     * 最后广告成功时间
     */
    public lastAdSucTime:number = 0;
    public currentAdType:number = 0;

    public ad:any;
    public adHandler:Laya.Handler = null;
    /**
     * 1就是加载成功了
     * 2就是加载错误了
     */
    public adStat:number = 0;
    public errCode:number = 0;

    public playAdVideo( code:number , h:Laya.Handler ):void{
        this.currentAdType = code;
        console.log("广告 开始播放");
        App.sendEvent( MyEvent.AD_EVENT , [ AD_STAT.VEDIO_CLICK , code] );
        if( Laya.Browser.onMiniGame == false ){
            h.runWith(1);
            App.sendEvent( MyEvent.PLAY_AD );
            return;
        }
        if( this.adStat == 2 ){
            //Tips.show("稍后回来");
            this.share2( h );
            return;
        }
        this.adHandler = h;
        let adid = this.adMap[code];
        this.ad = Laya.Browser.window.wx.createRewardedVideoAd({ adUnitId: adid });
        this.tryShowAD();
    }

    public initAdBtn(sp:Laya.UIComponent ,type:number ):void{
        sp.gray = (this.adStat == 2);
        App.sendEvent(MyEvent.AD_EVENT , [ AD_STAT.DIALOG_OPEN , type ] );
        sp.once( Laya.Event.UNDISPLAY , this, this.adUndisFun , [type] );
    }

    public adUndisFun(type:number):void{
        App.sendEvent(MyEvent.AD_EVENT , [ AD_STAT.DIALOG_CLOSE , type ] );
    }

    public tryShowAD():void {
        // this.ad.show().then( ()=>{
        //     this.dataSession.log( LogType.AD_SUC );
        // } );
        this.dataSession.log( LogType.AD_SUC );
        this.ad.show().catch(() => {
                this.ad.load().then( () => this.ad.show() ).catch(err => {
                    console.log('广告再加载失败');
                    console.log(err);
                    this.adStat = 2;
                    this.dataSession.log( LogType.AD_FAIL_2 );
                })
        })
    }

    public exeHandler():void{
        this.adHandler.runWith(1);
    }

    public exeHandler2():void{
        this.share( this.adHandler );
    }

    public share2(h:Laya.Handler):void{
        var obj:any = this.getShareObject();
        obj.query = "";
        obj.imageUrlId = "";
        Laya.Browser.window.wx.shareAppMessage(obj);
        this.shareStartTime = Laya.Browser.now();
        App.getInstance().eventManager.once( MyEvent.WX_ON_SHOW ,this,this.showFun,[h] );
    }

    public share( h:Laya.Handler , type:number = 0 ):void
    {
        this.checkShare();
        if( Laya.Browser.onMiniGame == false ){
            this.shareTimes++;
            h.runWith(1);
            return;
        }
        var obj:any = this.getShareObject();
        obj.query = "";
        obj.imageUrlId = "";
        Laya.Browser.window.wx.shareAppMessage(obj);
        App.sendEvent(MyEvent.SHARE_START , type );
        this.shareStartTime = Laya.Browser.now();

        let chao:boolean = this.shareTimes >= SdkSession.SHARE_MAX_TIMES;
        App.getInstance().eventManager.once( MyEvent.WX_ON_SHOW ,this,this.showFun,[chao?null:h] );
    }

    public showFun(h:Laya.Handler):void{
        if( h == null ){
            Tips.show("分享成功");
            return;
        }
        if( (Laya.Browser.now() - this.shareStartTime) > 2000 ){
            this.shareTimes++;
            h.runWith(1);
        }else{
            Tips.show( "请分享到不同群获得奖励" );
        }
    }

    public shareStartTime:number = 0;

    public checkShare():void {
        let now = new Date();
        let last = new Date( this.shareTime );
        if( now.getDate() != last.getDate() ){
            this.shareTimes = 0;
        }
        this.shareTime = Date.now();
    }

   

    public getShareObject():any
    {
        var arr:Array<string> = ["亲手打造更多的神兵利器，来与恶龙们抗争到底。","只有我一个，我是独一份、我是限量款、我是天选之子。","今年只玩骑马合成冲，对抗恶龙，拯救你的大陆。"];
        var obj:any = {};
        obj.title = App.RandomByArray(arr);
        obj.imageUrl = "https://img.kuwan511.com/rideGame/f.jpg";
        return obj;
    }

    /**
     * 今天分享了几次
     */
    public shareTimes:number = 0;

    /**
     * 最大分享次数
     */
    public static SHARE_MAX_TIMES:number = 6;

    /**
     * 分享的时间
     */
    public shareTime:number = 0;

    /**
     * 存数据到排行榜服务器
     * @param stageNum 
     */
    public savePlayerData( stageNum:number ):void{
        if( Laya.Browser.onMiniGame == false ){
            return;
        }
        var obj:any = {};
        var o1:any = {};
        o1.key = "stageNum";
        o1.value = stageNum + "";
        obj["KVDataList"] = [o1];
        obj.success = (res)=>{
            console.log("存储数据成功" ,res);
        }
        obj.fail = (res)=>{
            console.log("失败",res);
        }
        Laya.Browser.window.wx.setUserCloudStorage(obj);
    }

    /**
     * 显示banner
     */
    public showBanner( code:string ):void{
        let obj:any = {};
        obj.adUnitId = code;
        let l = (Laya.Browser.clientWidth - 300)/2;
        obj.style = {left:l,top:0,width:300,height:125};
        obj.adIntervals = 30;
        if( this.banner == null || (Laya.Browser.now() - this.bannerTime) > 30 * 1000 ){
            if( this.banner ){
                this.banner.hide();
                this.banner.destroy();
            }
            this.banner = Laya.Browser.window.wx.createBannerAd( obj );
            this.bannerTime = Laya.Browser.now();
        }

        this.banner.onResize( res=>{
            this.banner.style.top = Laya.Browser.clientHeight - res.height - 20;
        } );
        this.banner.show();
    }
    
    public bannerTime:number = 0;
    public banner:any = null;

    /**
     * 隐藏
     */
    public hideBanner():void{
        if( this.banner ){
            this.banner.hide();
        }
    }

    public userInfoButton:any;
    /**
     * 添加授权按钮
     */
    public addUserInfoBtn( sp:Laya.Sprite , h:Laya.Handler ):void
    {
        var s:number = Laya.Browser.clientWidth / Laya.stage.width;
        var p:Laya.Point = sp.localToGlobal( new Laya.Point(0,0) );
        var btnX:number = p.x * s;
        var btnY:number = p.y * s;
        var btnwid:number = sp.width * s;
        var btnhei:number = sp.height  * s;
        this.userInfoButton = Laya.Browser.window.wx.createUserInfoButton({
            type: 'text',
            text: '',
            style: {
                left: btnX,
                top: btnY,
                width: btnwid,
                height: btnhei,
                lineHeight: 40,
                backgroundColor: '#ffffff00',
                color: '',
                textAlign: 'center',
                fontSize: 16,
                borderRadius: 0,
                borderColor:"#ffffff"
                }
            });
            this.userInfoButton.onTap( (res)=>{
                if( res.errMsg == "getUserInfo:ok" ){
                    this.wxName = res.userInfo.nickName;
                    this.wxHead = res.userInfo.avatarUrl;
                    this.haveRight = true;
                    h.run();
                    this.undisFun();
                }
            });
            sp.once( Laya.Event.UNDISPLAY , this, this.undisFun );
    }

    public undisFun():void {
        if( this.userInfoButton ){
            this.userInfoButton.destroy();
            this.userInfoButton = null;
        }
    }

    /**
     * 
     * @param code 插屏广告
     * @param handler 
     */
    public chaPingAd( type:number , handler:Laya.Handler ):void
    {
        
        if( Laya.Browser.window.wx.createInterstitialAd == null ){
            handler.run();
            return;
        }
        if( ( Laya.Browser.now() - this.lastAdSucTime ) < 3 * 60 * 1000 ){
            handler.run();
            return;
        }
        if( this.canUse("2.6.0") == false ){
            handler.run();
            return;
        }
        let code = this.adMap[type];
        if( code == null ){
            handler.run();
            return;
        }
        let obj:any = {};
        obj.adUnitId = code;
        let ad = Laya.Browser.window.wx.createInterstitialAd( obj );
        ad.show().catch((err) => {
            console.error("插屏广告:",err);
        });
        ad.onClose( ()=>{
            handler.run();
        } );
    }

    public canUse(str:string):boolean {
        return this.compareVersion(str) >= 0;
    }

    public compareVersion(v:string):number
    {
        let now:string = Laya.Browser.window.wx.getSystemInfoSync().SDKVersion;
        let v1:Array<string> = v.split('.');
        let v2:Array<string> = now.split('.');

        const len = Math.max(v1.length, v2.length);
        
        while ( v1.length < len ) {
            v1.push('0');
        }
        while ( v2.length < len ) {
            v2.push('0');
        }
        
        for (let i = 0; i < len; i++) {
          const num1 = parseInt(v1[i]);
          const num2 = parseInt(v2[i]);
          if (num1 > num2) {
            return 1;
          } else if (num1 < num2) {
            return -1;
          }
        }
        return 0;
    }
}

enum AD_STAT {
    DIALOG_OPEN = 0,
    DIALOG_CLOSE = 1,
    VEDIO_CLICK = 2,
    VEDIO_FAIL = 3,
    VEDIO_SUC = 4,
    REWARD = 5,
    NO_HAVE = 6
}