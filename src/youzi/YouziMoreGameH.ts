import {ui} from  '../ui/layaMaxUI'

export default class YouziMoreGameH extends ui.youzi.Youzi_MoreGameHUI{

    private hotlistDatas = [];
    private mainItemExposure = {};
    private mainItemExposureCount = 0;
    private fisrtShow = false;
    private isCreate = false;

    constructor() {
        super();
        if(Laya.stage.width/Laya.stage.height >=1.9){
            this.MoreGameUI.scale(0.9, 0.9);
            var scaleW = this.MoreGameUI.width*0.9;
            var scaleH = this.MoreGameUI.height*0.9;
            this.MoreGameUI.pos(Laya.stage.width/2-scaleW/2,Laya.stage.height/2-scaleH/2);
        }else{
            this.centerX = 0;
            this.centerY = 0;
        }
        this.visible = false;
        this.MoreGameUI.visible = false;
    }

    setYouziPosition(x:number,y:number){
        this.centerX = NaN;
        this.centerY = NaN;
        this.MoreGameUI.pos(x,y);
    }

    onEnable(){
        var isMoreGameOk = Laya.Browser.window.YouziDataManager.isDataLoaded;
        if(isMoreGameOk){
            this.initShow();
        }else{
            Laya.Browser.window.YouziDataManager.loadedCallBacks.push(this.initShow.bind(this))
        }
    }

    public showMoreGameUI(){
        if(this.isCreate && !this.visible){
            this.visible = true
            this.moreGameList.mouseThrough = false;
            this.MoreGameUI.visible = true;
            if(window['onOpenCenter']){
                window['onOpenCenter']();
            }
            if(!this.fisrtShow){
                this.fisrtShow = true;
                this.checkExposure();
            }
        }  
    }

    private onBtnCloseClicked (){
        this.visible = false;
        this.moreGameList.mouseThrough = true;
        this.MoreGameUI.visible = false;
        if(window['onCloseCenter']){
            window['onCloseCenter']();
        }
    }

    initShow(){
        this.moreGameList.scrollBar.hide = true;
        this.moreGameCloseBtn.on(Laya.Event.CLICK,this,this.onBtnCloseClicked);
     
        if(Laya.Browser.window.YouziDataManager.hotListDatas.length > 0){
            this.hotlistDatas = Laya.Browser.window.YouziDataManager.hotListDatas; 
            this.moreGameList.renderHandler = new Laya.Handler(this,this.updataMainUiItem);
            var arr: Array<any> = [];
            for (var i: number = 0; i < this.hotlistDatas.length; i++) {
                var pRecord = this.hotlistDatas[i];
                arr.push({infoData: pRecord, namelab: pRecord.title});
            }
    
            this.moreGameList.mouseHandler = new Laya.Handler(this, this.moreGameListMouseEvent);
            this.moreGameList.dataSource = arr;
            this.isCreate = true;
        }
    }

    private updataMainUiItem(cell:Laya.Box,index:number){
        var icon : Laya.Image =  cell.getChildByName('icon') as Laya.Image;
        icon.loadImage(this.hotlistDatas[index].iconImg);
        if(this.MoreGameUI.visible && !this.mainItemExposure[this.hotlistDatas[index].appid]){
             this.mainItemExposureCount++;
             Laya.Browser.window.YouziDataManager.sendExposureLog(this.hotlistDatas[index], 5);
             this.mainItemExposure[this.hotlistDatas[index].appid] = 1;
         }
     }

     private moreGameListMouseEvent(e:Event, index: number): void{
        if(e.type == 'mousedown'){
     
        }else if(e.type == 'mouseup'){
             console.log("当前选择的hotlist索引：" + index);
             var tmpData = this.hotlistDatas[index];
             tmpData.locationIndex = index;
             tmpData.type = 3;
 
             if(tmpData.codeJump==1 && (tmpData.vopencode || tmpData.hopencode || tmpData.chopencode)){
                 Laya.Browser.window.YouziDataManager.previewImage(tmpData);    
             }else{
                 Laya.Browser.window.YouziDataManager.navigateToOtherGame(tmpData);
             }
             var curTime = Laya.Browser.window.YouziDataManager.YouziDateFtt("yyyyMMdd",new Date());
             localStorage.setItem(tmpData.appid, curTime);
           
        }else if(e.type == 'mouseover'){
            //  this.checkExposure();
           
        }
     }

     private checkExposure(){
        if(this.MoreGameUI.visible){
            for(var i=0; i<this.moreGameList.cells.length; i++){
                var tepItem = this.moreGameList.getCell(i);
                // console.log('mainList ' + k + ' : ' + tepItem.y + ' length ' + this.mainList.cells.length)
                if(tepItem && this.moreGameList.getItem(i)){
                    var infoData = this.moreGameList.getItem(i).infoData;
                    // console.log(infoData)
                    console.log(tepItem.y);
                    if(tepItem.y >= 10 && tepItem.y <= 768 && !this.mainItemExposure[this.moreGameList.getItem(i).infoData.appid]){
                        this.mainItemExposureCount++;
                        this.mainItemExposure[infoData.appid] = 1;
                        Laya.Browser.window.YouziDataManager.sendExposureLog(infoData, 5);
                    }
                }
            }
        }
    }

}