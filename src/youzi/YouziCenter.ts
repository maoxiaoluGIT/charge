import YouziMoreGame from "./YouziMoreGame";
import YouziMoreGameH from "./YouziMoreGameH";
import YouziSlideWindow from "./YouziSlideWindow";
import YouziSlideWindowH from "./YouziSlideWindowH";
import YouziBottomBanner from "./YouziBottomBanner";
import YouziGuessLike from "./YouziGuessLike";
import YouziGuessLikeH from "./YouziGuessLikeH";
import YouziMainPush from "./YouziMainPush";
import YouziOffLine from "./YouziOffLine";
import YouziOffLineH from "./YouziOffLineH";

export default class YouziCenter {
    public static instance:YouziCenter = null;

    private tempMoreGameUI:YouziMoreGame = null;
    private tempMoreGameUIH:YouziMoreGameH = null;

    private tempSlideUI:YouziSlideWindow = null;
    private tempSlideUIH:YouziSlideWindowH = null;

    public static getInstance(){
        if(this.instance == null){
            this.instance = new YouziCenter();
        }
        return this.instance

    }

    public initYouzi(wxappId:string,wxBannerAdId:string,sdkVersion:string){
        Laya.Browser.window.YouziDataManager.appid = wxappId;
        Laya.Browser.window.YouziDataManager.adUnitId = wxBannerAdId;
        Laya.Browser.window.YouziDataManager.sdkVersion = sdkVersion;
        Laya.Browser.window.YouziDataManager.wxLaunch();
        if(Laya.Browser.window.wx){
            Laya.Browser.window.wx.onShow(function(res){
                Laya.Browser.window.YouziDataManager.wxOnShow(res);
            });
        }
        Laya.Browser.window.YouziDataManager.loadData(null);
    }

    /**
     * 创建更多游戏按钮
     * @param parentNode 更多游戏按钮父节点
     * @param params json{x:0,y:0,width:0,height:0}
     * @param isAutoClick 是否有sdk自动完成点击注册,true交给sdk注册，false则开发者自行注册
     */
    public createMoreGameButton(parentNode,params,isAutoClick){
        var moreGameBtn:Laya.Button = new Laya.Button('comp/btn-entrance-nogift.png');
        moreGameBtn.mouseEnabled = true;
        moreGameBtn.stateNum = 1;
        moreGameBtn.width = params.width;
        moreGameBtn.height = params.height;
        moreGameBtn.pos(params.x,params.y);
        parentNode.addChild(moreGameBtn);
        if(isAutoClick){
            moreGameBtn.on(Laya.Event.CLICK,this,this.showMoreGameUI);
        }
        return moreGameBtn;
    }

    private showMoreGameUI(){
        if(Laya.stage.width>Laya.stage.height){
            if(this.tempMoreGameUIH)
                this.tempMoreGameUIH.showMoreGameUI();
        }else{
            if(this.tempMoreGameUI)
                this.tempMoreGameUI.showMoreGameUI();
        }
    }

    /**
     * 竖屏更多游戏UI
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0},默认请传null
     */
    public createMoreGameUI(parentNode,params){
        var moreGameUI:YouziMoreGame = new YouziMoreGame();
        if(params){
            moreGameUI.setYouziPosition(params.x,params.y);
        }
        this.tempMoreGameUI = moreGameUI;
        parentNode.addChild(moreGameUI);
        return moreGameUI;
    }

    /**
     * 横屏更多游戏UI
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0},默认请传null
     */
    public createMoreGameUIH(parentNode,params){
        var moreGameUIH:YouziMoreGameH = new YouziMoreGameH();
        if(params){
            moreGameUIH.setYouziPosition(params.x,params.y);
        }
        this.tempMoreGameUIH = moreGameUIH;
        parentNode.addChild(moreGameUIH);
        return moreGameUIH;
    }

    /**
     * 创建抽屉按钮
     * @param parentNode 抽屉按钮父节点
     * @param params json{x:0,y:0,width:0,height:0
     * @param leftOrRight true按钮在左边，false在右边
     * @param isAutoClick 是否有sdk自动完成点击注册,true交给sdk注册，false则开发者自行注册
     */
    public createSlideButton(parentNode,params,leftOrRight,isAutoClick){
        var slideBtn:Laya.Button = new Laya.Button('comp/btn_slide.png');
        slideBtn.mouseEnabled = true;
        slideBtn.stateNum = 1;
        if(leftOrRight){
            slideBtn.scaleX = -1;
        }           
        slideBtn.width = params.width;
        slideBtn.height = params.height;
        slideBtn.pos(params.x,params.y);
        parentNode.addChild(slideBtn);
        if(isAutoClick)
            slideBtn.on(Laya.Event.CLICK,this,this.showSlideWindowUI);
        return slideBtn;
    }

    private showSlideWindowUI(){
        console.log('1111111');
        if(Laya.stage.width > Laya.stage.height){
            if(this.tempSlideUIH)
                this.tempSlideUIH.showSlideWindow();
        }else{
            if(this.tempSlideUI)
                this.tempSlideUI.showSlideWindow();
        }
    }

    /**
     * 竖屏抽屉UI
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0},默认请传null
     * @param leftOrRight true 左边，false 右边
     */
    public createSlideWindowUI(parentNode,params,leftOrRight){
        var slideWindowUI:YouziSlideWindow = new YouziSlideWindow(leftOrRight);
        if(params){
            slideWindowUI.setYouziPosition(params.y);
        }
        this.tempSlideUI = slideWindowUI;
        parentNode.addChild(slideWindowUI);
        return slideWindowUI;
    }

    /**
     * 横屏屏抽屉UI
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0},默认请传null
     * @param leftOrRight true 左边，false 右边
     */
    public createSlideWindowUIH(parentNode,params,leftOrRight){
        var slideWindowUIH:YouziSlideWindowH = new YouziSlideWindowH(leftOrRight);
        if(params){
            slideWindowUIH.setYouziPosition(params.y);
        }
        this.tempSlideUIH = slideWindowUIH;
        parentNode.addChild(slideWindowUIH);
        return slideWindowUIH;
    }

    /**
     * 底部推荐UI
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0},默认请传null
     */
    public createBottomBanner(parentNode,params){
        var bottomBanner:YouziBottomBanner = new YouziBottomBanner();
        if(params){
            bottomBanner.setYouziPosition(params.x,params.y);
        }
        parentNode.addChild(bottomBanner);
        return bottomBanner;
    }

    /**
     * 横向猜你喜欢UI
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0},默认请传null
     */
    public createGuessLike(parentNode,params){
        var guessLike:YouziGuessLike = new YouziGuessLike();
        if(params){
            guessLike.setYouziPosition(params.x,params.y);
        }
        parentNode.addChild(guessLike);
        return parentNode;
    }

    /**
     * 竖向猜你喜欢UI
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0},默认请传null
     */
    public createGuessLikeH(parentNode,params){
        var guessLikeH:YouziGuessLikeH = new YouziGuessLikeH();
        if(params){
            guessLikeH.setYouziPosition(params.x,params.y)
        }
        parentNode.addChild(guessLikeH);
        return guessLikeH;
    }

    /**
     * 主推
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0},默认请传null
     */
    public createMainPush(parentNode,params){
        var mainPush:YouziMainPush = new YouziMainPush();
        if(params){
            mainPush.setYouziPosition(params.x,params.y);
        }
        parentNode.addChild(mainPush);
        return mainPush;
    }

    public createOffline(parentNode,params){
        var offlineUI:YouziOffLine = new YouziOffLine();
        if(params){
            offlineUI.setYouziPosition(params.x,params.y);
        }
        parentNode.addChild(offlineUI);
        return offlineUI;
    }

    public createOfflineH(parentNode,params){
        var offlineUIH:YouziOffLineH = new YouziOffLineH();
        if(params){
            offlineUIH.setYouziPosition(params.x,params.y);
        }
        parentNode.addChild(offlineUIH);
        return offlineUIH;
    }


}