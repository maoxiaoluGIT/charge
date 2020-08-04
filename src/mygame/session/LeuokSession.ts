import Session from "../../game/Session";
import App from "../../game/App";
import GameEvent from "../../game/GameEvent";
import SdkSession from "./SdkSession";
import MyGameInit from "../MyGameInit";
import YouziCenter from "../../youzi/YouziCenter";
import { ui } from "../../ui/layaMaxUI";
import MyArray from "../../game/MyArray";
import BattleSession from "./BattleSession";
import NewerSession from "./NewerSession";
import DataSession from "./DataSession";
import MyEvent from "../MyEvent";

export default class LeuokSession extends Session{
    
    private newerSession:NewerSession = null;
    private sdkSession:SdkSession = null;
    private box:ui.youzi.YouZiBoxUI = null;
    private dataSession:DataSession = null;

    constructor(){
        super();
        //return;
        App.onceEvent( GameEvent.ENTER_SCENE , this, this.enterFun );
        App.onEvent( MyEvent.GOLD_UPDATE , this,this.goldFun );
    }

    public goldFun(oldGold:number,newGold:number,type:number):void{
        let o:any = {};
        o.reason = type;
        o.moneyType = 2;
        o.oldMoney = oldGold;
        o.newMoney = newGold;
        this.getRoot().money( o );
    }

    public enterFun( url:string ):void{
        this.getRoot().adLogin( {"nickName":this.sdkSession.wxName} );
        this.loadFun();
    }

    private loadFun():void {
        this.initAll();
        App.onEvent( GameEvent.OPEN_DIALOG ,this,this.openDialogFun2 );
        App.onEvent( GameEvent.CLOSE_DIALOG ,this,this.closeDialogFun2 );
    }

    private openDialogFun2(url:string):void{
        this.setNowUrl( url , 1 );
    }
    
    private closeDialogFun2(url:string):void{
        if( this.closeBanner.contain(url) ){
            this.sdkSession.hideBanner();
            this.closeBanner.clear();
        }
        Laya.timer.callLater( this,this.nextFun );
    }

    public win;

    public initAll():void{
        this.box = new ui.youzi.YouZiBoxUI();
        this.box.height = Laya.stage.height;
        this.box.mouseThrough = true;
        Laya.stage.addChild( this.box );
        
        YouziCenter.getInstance().initYouzi( "wxb45b791f8e76153d" , "", "1.00.00");
        YouziCenter.getInstance().createMainPush( this.box.zhuTui , {x:0,y:0 } );
        YouziCenter.getInstance().createSlideButton( this.box.chouTi  , {x:80,y:0,width:80,height:74} , true , true );
        this.win = YouziCenter.getInstance().createSlideWindowUI( this.box , {x:0,y:250} , true);//150 {x:0,y:628}
        this.win.btnSLideClose.zOrder = 10000;
        YouziCenter.getInstance().createBottomBanner( this.box.bottomBox , {x:( Laya.stage.width - 640 ) / 2  ,y:0} );
        
        //let xx = (750 - 530) / 2;
        //let yy = ( Laya.stage.height - 680 ) / 2;
        //this.wall = YouziCenter.getInstance().createMoreGameUI(this.box , {x:xx,y:yy} );
        //App.onEvent( GameEvent.OPEN_DIALOG ,this,this.openDialogFun );
        App.onEvent( GameEvent.ENTER_SCENE ,this,this.enterSceneFun );
        //App.onEvent( GameEvent.CLOSE_DIALOG ,this,this.closeDialogFun );
        //App.onEvent( GameEvent.OPEN_SCENE_START, this,this.openSceneStartFun );
        if( this.newerSession.isNew ){
            this.setNowUrl("",0);
        }
    }

    public showWall:boolean = false;
    public openSceneStartFun( url:string ):void{
        if( url == MyGameInit.MainScene && App.getInstance().nowSceneUrl == MyGameInit.BattleScene ){
            this.showWall = true;
        }
    }

    public wall:any;

    private closeDialogFun(url:string):void{
        console.log( "关闭窗口:" , url );
        if( this.closeBanner.contain(url) ){
            this.sdkSession.hideBanner();
            this.closeBanner.clear();
        }
        Laya.timer.callLater( this,this.nextFun );
        if( url == MyGameInit.RankDialog ){
            Laya.timer.callLater( this,this.nextCloseFun );
        }else if( url == MyGameInit.TimeGoldDialog ){
            Laya.timer.callLater( this,this.nextCloseFun );
        }
    }

    public wallTimes:number = 0;

    public nextCloseFun():void{
        if( this.wallTimes >= 2 ){
            return;
        }
        let ddd = this.wall.getChildByName("maskButton");
        ddd.scale( 2,2 );
        this.wall.showMoreGameUI();
        this.wallTimes++;
        this.wall.visible = true;
    }

    private nextFun():void{
        if( Laya.Dialog.manager.numChildren == 0 ){
            this.setNowUrl( App.getInstance().nowSceneUrl , 3 );
        }else{
            for( let i:number = 0; i < Laya.Dialog.manager.numChildren; i++ ){
                let max = Laya.Dialog.manager.numChildren - 1;
                let sp = Laya.Dialog.manager.getChildAt( max - i );
                if( sp instanceof Laya.Dialog )  {
                    this.setNowUrl( sp.url , 3 );
                    return;
                }
            }
        }
    }

    private enterSceneFun(url:string):void{
        this.setNowUrl( url , 2 );
    }

    private openDialogFun( url:string ):void{
        this.setNowUrl( url , 1 );
    }

    public heziFun():void{
        //this.setNowUrl();
    }

    public setNowUrl( url:string , type:number = 0 ):void 
    {
        Laya.stage.addChild( this.box );
        this.box.zOrder = 1000;
        for ( let a:number = 0; a < this.box.numChildren; a++ ){
            let sp:Laya.Sprite = <any>this.box.getChildAt(a);
            sp.visible = false;
        }
        // this.box.bottomBox.bottom = 0;
        // if( this.newerSession.isNew ){
        //     return;
        // }
        if( url == MyGameInit.MainScene ){
            this.setShow( [LeuokSession.ZHUTUI,LeuokSession.CHOUTI] );
            // if( this.showWall ){
            //     this.showWall = false;
            //     Laya.timer.once( 100, this,this.nextCloseFun );
            // }
        }else if( url == MyGameInit.RoleDialog ){
            //this.setShow( [LeuokSession.BOTTOMBOX ] );
            //this.showBanner( url , "adunit-cab23e26170cff18" );
        }else if( url == MyGameInit.TimeGoldDialog ){
            //this.setShow( [LeuokSession.BOTTOMBOX] );
            this.showBanner( url , "146702" );
        }else if( url == MyGameInit.TreasureDialog ){
            //this.setShow( [LeuokSession.BOTTOMBOX] );
            this.showBanner( url , "146703" );
        }else if( url == MyGameInit.RankDialog ){
            this.showBanner( url , "146704" );
        }else if( url == MyGameInit.GetGoldDialog ){
            this.showBanner( url , "146705" );
            //this.setShow([LeuokSession.BOTTOMBOX]);
            //this.box.bottomBox.bottom = 300;
        }else if( url == MyGameInit.SettingDialog ){
            this.showBanner( url , "146706" );
            //this.setShow([LeuokSession.BOTTOMBOX]);
            //this.box.bottomBox.bottom = 300;
        }else if( url == MyGameInit.SelectStage || url == MyGameInit.SelectStage2 ){
            this.setShow([LeuokSession.ZHUTUI , LeuokSession.BOTTOMBOX]);
            this.box.bottomBox.bottom = 0;
            this.showBanner( url , "146706" );
        }else if( url == MyGameInit.BattleScene ){
            //this.setShow([LeuokSession.BOTTOMBOX]);//,LeuokSession.ZHUTUI
        }else if( url == MyGameInit.GameOverDialog ){
            //this.setShow([LeuokSession.BOTTOMBOX]);
            this.setShow( [LeuokSession.ZHUTUI , LeuokSession.BOTTOMBOX ] );
            this.box.bottomBox.bottom = null;
            this.box.bottomBox.y = 450;
            this.showBanner( url , "146706" );
        }else if( url == MyGameInit.TASK ){
            this.showBanner( url , "146706" );
        }else if( url == MyGameInit.ZHUAN ){
            this.showBanner( url , "146706" );
        }else if( url == MyGameInit.FlyBoxDialog ){
            //this.setShow([]);
            this.showBanner( url , "146706" );
        }else if( url == MyGameInit.SHARE_MERGE_DIALOG ){
            this.showBanner( url , "146706" );
        }else if( url == MyGameInit.AD_MERGE_DIALOG ){
            this.showBanner( url , "146706" );
        }else if( url == MyGameInit.TIANFU ){
            this.showBanner( url , "146706" );
        }else if( url == MyGameInit.TASK_REWARD ){
            this.showBanner( url , "146706" );
        }
    }

    public closeBanner:MyArray = new MyArray();

    public showBanner( url:string, code:string ):void{

        var adBanner = "adunit-e55a848698e3d507";
        this.sdkSession.showBanner( adBanner );
        this.closeBanner.push( url );
    }

    public static ZHUTUI:string = "zhuTui";
    public static CHOUTI:string = "chouTi";
    public static BOTTOMBOX:string = "bottomBox";

    public clickFun():void{
        var k = 1;
        if(k==1)
        return;
        this.win.visible = true;
        this.win.showSlideWindow();
        this.box.mouseThrough = false;

        Laya.timer.callLater( this,this.nFun );
        
    }

    public nFun():void{
        Laya.stage.once(Laya.Event.CLICK,this,this.sClickFun);
    }

    public sClickFun():void{
        this.win.closeSlideWindow();
    }

    public setShow( arr:Array<string> ):void{
        for( let a of arr ){
            let c:Laya.Sprite = <any>this.box.getChildByName(a);
            c.visible = true;
            c.on( Laya.Event.CLICK,this,this.clickFun );
        }

        this.win.visible = false;
        this.win.closeSlideWindow();

        // for ( let a:number = 0; a < this.box.numChildren; a++ ){
        //     let sp:Laya.Sprite = <any>this.box.getChildAt(a);
        //     sp.visible = true;
        // }
       

        // let s = new Laya.Sprite();
        // s.zOrder = -100;
        // s.graphics.drawRect( 0 , 0, Laya.stage.width ,Laya.stage.height , "#000000" );
        // s.alpha = 0.6;
        // this.box.addChild(s);
        //this.box.graphics.drawRect( 0 , 0 , Laya.stage.width ,Laya.stage.height );

        //this.box.mouseThrough = false;
    }

    public getRoot():any{
        return Laya.Browser.window.wx.leuok;
    }

    public onSHARE_START( type:number ):void{
        this.getRoot().sharedOut( {"type":type} );
    }

    /**
     * 
     * @param type 视频出发点 是飞天宝箱还是什么别的
     * @param subType 是视频的哪个阶段
     */
    public onAD_EVENT( subType:number , type:number ):void{
        let obj:any = {};
        obj.type = type;
        obj.subType = subType;
        this.getRoot().adVideo( obj );
        //this.dataSession.log( type * 100000 + subType );
    }
}