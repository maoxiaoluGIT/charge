import {ui} from  '../ui/layaMaxUI'

export default class YouziSlideWindow extends ui.youzi.Youzi_SlideWindowUI{

    private hotlistDatas = [];
    private slideItemExposure = {}
    private slideItemExposureCount = 0;
    private showFirst = false;
    private isLeft = false;

    constructor(leftOrRight){
        super();
        this.isLeft = leftOrRight;
        this.centerY = 0;
        this.visible = false;
        this.SlideWindowUI.visible = false;
        
        if(!leftOrRight){
            this.right = -this.width
            this.slideBg.scaleX = -1;
            this.slideBg.pos(this.slideBg.width, this.slideBg.y);
            this.slideList.pos(2*this.slideList.x,this.slideList.y);
        }else{
            this.left = -this.width;
            // this.left = 0;
        }
    }

    setYouziPosition(y:number){
        this.centerX = NaN;
        this.centerY = NaN;
        this.SlideWindowUI.pos(this.SlideWindowUI.x,y);
    }

    onEnable(){
        var isSlideDataOk = Laya.Browser.window.YouziDataManager.isDataLoaded;
        if(isSlideDataOk){
            this.initShow();
        }else{
            Laya.Browser.window.YouziDataManager.loadedCallBacks.push(this.initShow.bind(this))
        }
    }

    showSlideWindow(){
        if(!this.SlideWindowUI.visible){
            this.visible = true;
            this.SlideWindowUI.visible = true;
            var self = this;
            this.slideWindowActionShow(function(){
                if(!self.showFirst){
                    self.showFirst = true;
                    self.checkExposure();
                }
            });
        }
    }

    slideWindowActionShow(actionFinishCall){
        if(!this.isLeft){
            Laya.Tween.to(this, {
                right:0
            }, this.ttt, Laya.Ease.quadInOut, Laya.Handler.create(this,actionFinishCall))
        }else{
            Laya.Tween.to(this, {
                left:0
            }, this.ttt , Laya.Ease.quadInOut, Laya.Handler.create(this,actionFinishCall))
        }
    }

    closeSlideWindow(){
        var self = this;
        this.slideWindowActionClose(function(){
            self.visible = false;
            self.SlideWindowUI.visible = false;
            self.btnSLideClose.visible = true;
        });
        //点击隐藏按钮，防止动画过程中继续点击造成过多偏移
        self.btnSLideClose.visible = false;
    }


    public ttt:number = 400;

    slideWindowActionClose(actionFinishCall){
        if(!this.isLeft){
            Laya.Tween.to(this, {
                right:-this.width
            }, this.ttt , Laya.Ease.quadInOut, Laya.Handler.create(this,actionFinishCall))
        }else{
            Laya.Tween.to(this, {
                left:-this.width
            }, this.ttt , Laya.Ease.quadInOut, Laya.Handler.create(this,actionFinishCall))
        }
    }

    initShow(){
        this.hotlistDatas = Laya.Browser.window.YouziDataManager.hotListDatas;  
        this.slideList.scrollBar.hide = true
        this.slideList.renderHandler = new Laya.Handler(this,this.updataSlideListItem);
        var arr: Array<any> = [];
		for (var i: number = 0; i < this.hotlistDatas.length; i++) {
            var pRecord = this.hotlistDatas[i];
			arr.push({infoData: pRecord, namelab: pRecord.title });
		}
        this.btnSLideClose.on(Laya.Event.CLICK, this, this.closeSlideWindow);
        this.slideList.mouseHandler = new Laya.Handler(this, this.onslideListItemMouseEvent);
        this.slideList.dataSource = arr
    }

    private updataSlideListItem(cell:Laya.Box,index:number){
        var icon : Laya.Image =  cell.getChildByName('icon') as Laya.Image;
        icon.loadImage(this.hotlistDatas[index].iconImg);
        if(this.SlideWindowUI.visible && !this.slideItemExposure[this.hotlistDatas[index].appid]){
            this.slideItemExposureCount++;
            Laya.Browser.window.YouziDataManager.sendExposureLog(this.hotlistDatas[index], 2)
            this.slideItemExposure[this.hotlistDatas[index].appid] = 1
        }
     } 

     private onslideListItemMouseEvent(e:Event, index: number): void{
        if(e.type == 'mousedown'){
         // if(type == 1 || type ==2){
         //     this.mouseClickChange = true;
         // }
        }else if(e.type == 'mouseup'){
             console.log("当前选择的hotlist索引：" + index);
             var tmpData = this.hotlistDatas[index]
             tmpData.locationIndex = index
             tmpData.type = 3
 
             if(tmpData.codeJump==1 && (tmpData.vopencode || tmpData.hopencode || tmpData.chopencode)){
                 Laya.Browser.window.YouziDataManager.previewImage(tmpData);    
             }else{
                 Laya.Browser.window.YouziDataManager.navigateToOtherGame(tmpData);    
             }
             if(tmpData.hotred == 1){
                var tmpSlideHit:Laya.Image = this.slideList.getCell(index).getChildByName('icon').getChildByName('markImg') as Laya.Image;
                tmpSlideHit.visible = false;
             }
             // if(type == 1 || type ==2){
             //     this.mouseClickChange = false;
             //     this.mousedownTimes(type);
             // }
        }else if(e.type == 'mouseover'){
            //  this.checkExposure()
             // if(type == 1 || type ==2){
             //     this.mouseClickChange = false;
             //     this.mousedownTimes(type);
             // }
        }
     }

     private checkExposure(){

        if(this.SlideWindowUI.visible){
            if(this.slideItemExposureCount >= this.hotlistDatas.length)
                return;
            for(var i=0; i<this.slideList.cells.length; i++){
                var tepItem = this.slideList.getCell(i)
                // console.log('slideList ' + i + ' : ' + tepItem.y)
                if(tepItem && this.slideList.getItem(i)){
                    var infoData = this.slideList.getItem(i).infoData
                    // console.log(infoData)

                    if(tepItem.y >= 10 && tepItem.y <= 720 && !this.slideItemExposure[infoData.appid]){
                        this.slideItemExposureCount++;
                        this.slideItemExposure[infoData.appid] = 1
                        Laya.Browser.window.YouziDataManager.sendExposureLog(infoData, 2)
                    }
                }
            }
        }
    }


}