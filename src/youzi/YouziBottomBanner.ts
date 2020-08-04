import {ui} from  '../ui/layaMaxUI'

export default class YouziBottomBanner extends ui.youzi.Youzi_BottomBannerUI{
    private hotListDatas = [];
    private gameBannerDatas = [];
    private bannerBottomItemExposure = {};
    private bannerSwithCount = 0;

    constructor(){
        super();
        this.pos(Laya.stage.width/2-this.BannerBottomUI.width/2,Laya.stage.height-this.BannerBottomUI.height);
        this.visible = false;
        this.BannerBottomUI.visible = false;    
    }

    setYouziPosition(x:number,y:number){
        this.centerX = NaN;
        this.centerY = NaN;
        this.pos(x,y);
    }

    onEnable(){
        var isBottomDataOk = Laya.Browser.window.YouziDataManager.isDataLoaded;
        if(isBottomDataOk){
            this.initShow();
        }else{
            Laya.Browser.window.YouziDataManager.loadedCallBacks.push(this.initShow.bind(this));
        }
    }

    initShow(){
        this.hotListDatas = Laya.Browser.window.YouziDataManager.hotListDatas;
        if(this.hotListDatas.length <= 0){
            return;
        }
        this.gameBannerDatas = Laya.Browser.window.YouziDataManager.gameBannerDatas;
        this.visible = true;
        if(Laya.Browser.window.YouziDataManager.currentBannerType == Laya.Browser.window.YouziDataManager.BANNERTYPE.BANNER_JUZHEN || 
            Laya.Browser.window.YouziDataManager.BANNERTYPE.BANNER_SWITH == Laya.Browser.window.YouziDataManager.currentBannerType){
            this.BannerBottomUI.visible = true;
            this.gameBannerList.scaleY = 0
            this.loadBottomList()
            if(Laya.Browser.window.YouziDataManager.BANNERTYPE.BANNER_SWITH == Laya.Browser.window.YouziDataManager.currentBannerType){
                Laya.Browser.window.YouziDataManager.createWXBanner()
            }
        }else if(Laya.Browser.window.YouziDataManager.currentBannerType == Laya.Browser.window.YouziDataManager.BANNERTYPE.BANNER_GAME){
            this.BannerBottomUI.visible = true
            this.bannerBottomBg.visible = false
            this.bottomList.scaleY = 0
            this.loadGameBannerList();
        }else if(Laya.Browser.window.YouziDataManager.currentBannerType == Laya.Browser.window.YouziDataManager.BANNERTYPE.BANNER_WX){
            Laya.Browser.window.YouziDataManager.showWXBanner(true)
        }
    }

    loadBottomList(){
        this.bottomList.repeatX = this.hotListDatas.length;

        this.bottomList.scrollBar.hide = true
        var arr: Array<any> = [];
		for (var i: number = 0; i < this.hotListDatas.length; i++) {
            var pRecord = this.hotListDatas[i];
			arr.push({infoData: pRecord, namelab: pRecord.title });
		}

        this.bottomList.mouseHandler = new Laya.Handler(this, this.onBannerItemMouseEvent);
        this.bottomList.dataSource = arr

        for(var j=0; j<this.hotListDatas.length; j++){
            var icon : Laya.Image = this.bottomList.getCell(j).getChildByName('icon') as Laya.Image
            icon.loadImage(this.hotListDatas[j].iconImg)


            if(j<6){
                Laya.Browser.window.YouziDataManager.sendExposureLog(this.hotListDatas[j], 3)
                this.bannerBottomItemExposure[this.hotListDatas[j].appid] = 1
            }
        }

        Laya.timer.frameLoop(2, this, this.bannerSwitchUpdate);
        this.bottomlistAutoScroll()
    }

    private onBannerItemMouseEvent(e:Event, index: number): void{
        if(e.type == 'mousedown'){
         // if(type == 1 || type ==2){
         //     this.mouseClickChange = true;
         // }
        }else if(e.type == 'mouseup'){
             console.log("当前选择的hotlist索引：" + index);
             var tmpData = this.hotListDatas[index]
             tmpData.locationIndex = index
             tmpData.type = 3
 
             if(tmpData.codeJump==1 && (tmpData.vopencode || tmpData.hopencode || tmpData.chopencode)){
                 Laya.Browser.window.YouziDataManager.previewImage(tmpData);    
             }else{
                 Laya.Browser.window.YouziDataManager.navigateToOtherGame(tmpData);    
             }
             var curTime = Laya.Browser.window.YouziDataManager.YouziDateFtt("yyyyMMdd",new Date());
             localStorage.setItem(tmpData.appid, curTime)
             // this.resetAllMark()
             // if(type == 1 || type ==2){
             //     this.mouseClickChange = false;
             //     this.mousedownTimes(type);
             // }
        }else if(e.type == 'mouseover'){
             this.checkExposure()
        }
     }

    private bannerSwitchUpdate(){
        if(Laya.Browser.window.YouziDataManager.BANNERTYPE.BANNER_SWITH != Laya.Browser.window.YouziDataManager.currentBannerType){
            return
        }

        this.bannerSwithCount+=2
        if( !Laya.Browser.window.YouziDataManager.isWxBannerErr &&
            Laya.Browser.window.YouziDataManager.bannerAutoChangeInterval!=0){

            if(this.bannerSwithCount%(Laya.Browser.window.YouziDataManager.bannerAutoChangeInterval*60)==0){
                if(this.bannerSwithCount%(Laya.Browser.window.YouziDataManager.bannerAutoChangeInterval*120)==0){
                    Laya.Browser.window.YouziDataManager.hideWXBanner();
                    this.BannerBottomUI.visible = true
                }
                else{
                    this.BannerBottomUI.visible = false
                    if(this.bannerSwithCount%(Laya.Browser.window.YouziDataManager.bannerWXRefreshInterval*60)==0){
                        Laya.Browser.window.YouziDataManager.showWXBanner(true)
                    }else{
                        Laya.Browser.window.YouziDataManager.showWXBanner(false)
                    }
                }
            }
            
        }

    }

    private bottomlistAutoScroll(){

        if(this.hotListDatas.length<=5){
            return
        }
        var self = this
        var endIndex = self.hotListDatas.length-5
        var dur = endIndex*5000
        // console.log('self.bottomList.startIndex:' + self.bottomList.startIndex + ' endIndex:' + endIndex)
        if(self.bottomList.startIndex <= endIndex-1){
            this.bottomList.tweenTo(endIndex, dur, new Laya.Handler(this, this.bottomlistAutoScroll))
        }else{
            this.bottomList.tweenTo(0, dur, new Laya.Handler(this, this.bottomlistAutoScroll))
        }
    }

    private checkExposure(){
        if(this.BannerBottomUI.visible){
            for(var i=0; i<this.bottomList.length; i++){
                var temItem = this.bottomList.getItem(i)
                // console.log('bottomList ' + i + ' : ' + temItem.x)
                if(temItem && this.bottomList.getItem(i)){
                    var infoData = this.bottomList.getItem(i).infoData
                    // console.log(infoData)
                    if(temItem.x < 640 && !this.bannerBottomItemExposure[infoData.appid]){
                        this.bannerBottomItemExposure[infoData.appid] = 1
                        Laya.Browser.window.YouziDataManager.sendExposureLog(infoData, 3)
                    }
                }
            }
        }  
    }

    loadGameBannerList(){
        //banner
        var self = this
        self.gameBannerList.repeatX = this.gameBannerDatas.length; 
        // self.gameBannerList.repeatY = 1; 
        this.gameBannerList.scrollBar.hide = true

        var arr: Array<any> = [];
        for (var i: number = 0; i < self.gameBannerDatas.length; i++) {
            var pRecord = this.gameBannerDatas[i];
            arr.push({infoData: pRecord });
        }

        self.gameBannerList.selectEnable = true;
        self.gameBannerList.mouseHandler = new Laya.Handler(this, this.ongameBannerItemMouseEvent);
        self.gameBannerList.dataSource = arr

        for(var j=0; j<self.gameBannerDatas.length; j++){
            var icon : Laya.Image = this.gameBannerList.getCell(j).getChildByName('icon') as Laya.Image
            icon.loadImage(this.gameBannerDatas[j].bannerImg)
        }

        Laya.timer.frameLoop(400, this, this.updateGameBanner);
    }

    private updateGameBanner(e: Event): void{
        if(this.hotListDatas.length<1){
            return
        }

        var startIdx = this.gameBannerList.startIndex+1;
        this.gameBannerList.scrollTo(startIdx>=this.hotListDatas.length?0:startIdx)
    }

    private ongameBannerItemMouseEvent(e:Event, index: number): void{
        if(e.type == 'mousedown'){
 
        }else if(e.type == 'mouseup'){
             console.log("当前选择的gamebannerlist索引：" + index);
             var tmpData = this.gameBannerDatas[index]
             tmpData.locationIndex = index
             tmpData.type = 5
 
             if(tmpData.codeJump==1 && (tmpData.vopencode || tmpData.hopencode || tmpData.chopencode)){
                 Laya.Browser.window.YouziDataManager.previewImage(tmpData);    
             }else{
                 Laya.Browser.window.YouziDataManager.navigateToOtherGame(tmpData);    
             }
        
        }else if(e.type == 'mouseover'){
             // this.checkExposure()
        }
    }

}