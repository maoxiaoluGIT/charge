import {ui} from  '../ui/layaMaxUI'

export default class YouziMainPush extends ui.youzi.Youzi_MainPushUI{
    private mainRecDatas = [];
    private mainRecItemExposure = {};
    private angel = 0;
    private curMainRecIdx = 0;
    
    constructor(){
        super();
        this.visible = false;
        this.btnMainRecBg.visible = false;
    }

    setYouziPosition(x:number,y:number){
        this.centerX = NaN;
        this.centerY = NaN;
        this.pos(x,y);
    }

    onEnable(){
        var isMainDataOk = Laya.Browser.window.YouziDataManager.isDataLoaded;
        if(isMainDataOk){
            this.initShow();
        }else{
            Laya.Browser.window.YouziDataManager.loadedCallBacks.push(this.initShow.bind(this));
        }
    }

    initShow(){
        this.mainRecDatas = Laya.Browser.window.YouziDataManager.mainRecDatas;
        if(this.mainRecDatas.length>0){
            this.btnMainRec.on(Laya.Event.CLICK, this, this.onBtnMainRecClicked);
            this.visible = true;
            this.btnMainRecBg.visible = true
            this.btnMainRec.loadImage(this.mainRecDatas[0].iconImg);
            Laya.timer.frameLoop(1, this, this.updateMainRec);
            var txt : Laya.Text = this.btnMainRec.getChildByName('slogan') as Laya.Text
            if(this.mainRecDatas[0].slogan){
                txt.text = this.mainRecDatas[0].slogan
               
            }

            Laya.Browser.window.YouziDataManager.sendExposureLog(this.mainRecDatas[0], 1)
            this.mainRecItemExposure[this.mainRecDatas[0].appid] = 1
        }
    }

    private updateMainRec(e: Event): void {
        this.angel += 0.03
        if(this.angel%15 < 0.03){
            this.mainRecChange()
        }
        this.btnMainRecBg.rotation = Math.sin(this.angel)*10;
    }

    private mainRecChange(){
        this.curMainRecIdx = this.curMainRecIdx+1>=this.mainRecDatas.length?0:this.curMainRecIdx+1
        this.btnMainRec.loadImage(this.mainRecDatas[this.curMainRecIdx].iconImg);
        var txt : Laya.Text = this.btnMainRec.getChildByName('slogan') as Laya.Text
        if(this.mainRecDatas[this.curMainRecIdx].slogan){
            txt.text = this.mainRecDatas[this.curMainRecIdx].slogan
            
        }

        if(!this.mainRecItemExposure[this.mainRecDatas[this.curMainRecIdx].appid]){
            Laya.Browser.window.YouziDataManager.sendExposureLog(this.mainRecDatas[this.curMainRecIdx], 1)
            this.mainRecItemExposure[this.mainRecDatas[this.curMainRecIdx].appid] = 1
        }
    }

    private onBtnMainRecClicked(){   
        var tmpData = this.mainRecDatas[this.curMainRecIdx]
        tmpData.locationIndex = this.curMainRecIdx
        tmpData.type = 4
        if(tmpData.codeJump==1 && (tmpData.vopencode || tmpData.hopencode || tmpData.chopencode)){
            Laya.Browser.window.YouziDataManager.previewImage(tmpData);    
        }else{
            Laya.Browser.window.YouziDataManager.navigateToOtherGame(tmpData);
        }
        this.mainRecChange()
    }

}