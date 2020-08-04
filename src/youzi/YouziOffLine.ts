import {ui} from  '../ui/layaMaxUI'

export default class YouziOffLine extends ui.youzi.Youzi_OffLineUI{
    private offLineGameShow = [];
    private offLineGameDatas = [];
    private offLineCreateComplete = false;
    //获取毫秒
    private hideOffLineGameTimes = 0;

    constructor(){
        super();
        if(Laya.stage.height/Laya.stage.width >= 1.9){
            this.OffLineUI.pos(Laya.stage.width/2 - this.OffLineUI.width/2,Laya.stage.height/2 - this.OffLineUI.height/2);
        }else{
            this.centerX = 0;
            this.centerY = 0;
        }

        this.visible = false;
        this.OffLineUI.visible = false;
       
    }

    setYouziPosition(x:number,y:number){
        this.centerX = NaN;
        this.centerY = NaN;
        this.OffLineUI.pos(x,y);
    }

    onEnable(){
        var offLineDataOk = Laya.Browser.window.YouziDataManager.isDataLoaded;
        if(offLineDataOk){
            this.initShow();
        }else{
            Laya.Browser.window.YouziDataManager.loadedCallBacks.push(this.initShow.bind(this));
        }
    }

    initShow(){
        this.offLineGameDatas = Laya.Browser.window.YouziDataManager.offlineBannerDatas;
        this.wxOnShow();
        this.wxOnHide();

        // this.createOffLineDialog();
        // this.visible = true;
        // this.OffLineUI.visible = true;
    }

    private wxOnShow(){
        var self = this;
        if(Laya.Browser.window.wx){
            Laya.Browser.window.wx.onShow(function(res){
              
                    var showOffLineTimes = Math.floor(new Date().getTime() - self.hideOffLineGameTimes);
                    var showOffLineTimeSecond = Math.floor(showOffLineTimes/1000);
                    if(showOffLineTimeSecond >= 8){
                        if(self.offLineCreateComplete){
                            self.visible = true;
                            self.OffLineUI.visible = true;
                            for(var i=0;i<self.offLineGameShow.length;i++){
                                Laya.Browser.window.YouziDataManager.sendExposureLog(self.offLineGameShow[i], 6)
                            }
                        }
                    }       
               
            });
        }
        
    }

    private wxOnHide(){
        var self = this;
        if(Laya.Browser.window.wx){
            Laya.Browser.window.wx.onHide(function(){
                self.hideOffLineGameTimes = new Date().getTime();
                if(self.offLineGameDatas.length > 0 && !self.offLineCreateComplete)
                {
                    self.createOffLineDialog();
                }
            });
        }
    }

    private createOffLineDialog(){
            this.OffLineCloseButton.on(Laya.Event.CLICK, this, this.onBtnOffLineClose);
            
            var offLineArr : Array<any> = [];
            for(var i:number = 0;i<this.offLineGameDatas.length;i++){
                if(i >= 3){
                    break;
                }else{
                    var tempOffLine = this.offLineGameDatas[i];
                    offLineArr.push({infoData: tempOffLine, namelab: tempOffLine.title});
                }
            }

             //设定list 位置，以这种方式解决list中item的居中问题
             switch(offLineArr.length){
                case 1:
                    this.OffLineList.width = 140
                    this.OffLineList.x = 194
                break;
                case 2:
                    this.OffLineList.width = 305
                    this.OffLineList.x = 111.5
                    break;
                default:
                break;
            }

            this.OffLineList.mouseHandler = new Laya.Handler(this,this.onOffLinelistItemMouseEvent);
            this.OffLineList.dataSource = offLineArr;

            for(var j:number = 0; j < this.offLineGameDatas.length;j++){
               
                var offLineIcon : Laya.Image = this.OffLineList.getCell(j).getChildByName('icon') as Laya.Image
                offLineIcon.loadImage(this.offLineGameDatas[j].iconImg);
                var offLineIconRedHit: Laya.Image = offLineIcon.getChildByName('redhit') as Laya.Image
                offLineIconRedHit.visible = false;
                if(this.offLineGameDatas[j].hotred == 1)
                {
                    offLineIconRedHit.visible = true;
                }
                this.offLineGameShow.push(this.offLineGameDatas[j]);
                if(++j >= offLineArr.length){
                    // console.log('offlinecreat finish');
                    this.offLineCreateComplete = true;
                    break; 
                }
            }
    }

    private onBtnOffLineClose(){
        this.visible = false;
        this.OffLineUI.visible = false;
    }

    private onOffLinelistItemMouseEvent(e:Event, index: number): void{
        if(e.type == 'mousedown'){
        
        }else if(e.type == 'mouseup'){
             console.log("当前选择的hotlist索引：" + index);
             var tmpData = this.offLineGameDatas[index]
             tmpData.locationIndex = index
             tmpData.type = 3
             if(tmpData.hotred == 1){
                var hideOffLineHit:Laya.Image = this.OffLineList.getCell(index).getChildByName('icon').getChildByName('redhit') as Laya.Image;
                hideOffLineHit.visible = false;
             }
             if(tmpData.codeJump==1 && (tmpData.vopencode || tmpData.hopencode || tmpData.chopencode)){
                 Laya.Browser.window.YouziDataManager.previewImage(tmpData);    
             }else{
                 Laya.Browser.window.YouziDataManager.navigateToOtherGame(tmpData);    
             }
            
        }else if(e.type == 'mouseover'){
        
            
        }else if(e.type == 'mouseout'){
           
        }
     }

}