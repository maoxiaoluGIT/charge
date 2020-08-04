import {ui} from  '../ui/layaMaxUI'

export default class YouziGuessLikeH extends ui.youzi.Youzi_GuessLikeHUI{

    private hotlistDatas = [];
    private guessAnyItemExposure = {};
    private firstShow = false;

    constructor(){
        super();
        this.visible = false;
        this.guessUI.visible = false;
    }

    setYouziPosition(x:number,y:number){
        this.pos(x,y);
    }

    onEnable(){
        var guessLikeDataOk = Laya.Browser.window.YouziDataManager.isDataLoaded;
        if(guessLikeDataOk){
            this.initShow();
        }else{
            Laya.Browser.window.YouziDataManager.loadedCallBacks.push(this.initShow.bind(this));
        }
    }

    // showGuessLikeView(){
    //     if(!this.firstShow){
    //         this.firstShow = true;
    //         this.checkExposure();
    //     }
    //     this.visible = true;
    //     this.guessUI.visible = true;
    //     this.guessAnylistAutoScroll();
    // }

    // hideGuessLikeView(){
    //     this.visible = false;
    //     this.guessUI.visible = false; 
    // }

    initShow(){
        this.hotlistDatas = Laya.Browser.window.YouziDataManager.hotListDatas;
        this.guesslist.scrollBar.hide = true
        this.guesslist.repeatY = this.hotlistDatas.length
        var arr: Array<any> = [];
		for (var i: number = 0; i < this.hotlistDatas.length; i++) {
            var pRecord = this.hotlistDatas[i];
			arr.push({infoData: pRecord});
		}

        // self.list.selectEnable = true;
        // self.list.selectHandler = new Handler(this, this.onhotlistItemClicked);
        this.guesslist.mouseHandler = new Laya.Handler(this, this.onGuessLikeItemMouseEvent);

        this.guesslist.dataSource = arr

        for(var j=0; j<this.hotlistDatas.length; j++){
            var icon : Laya.Image = this.guesslist.getCell(j).getChildByName('icon') as Laya.Image
            icon.loadImage(this.hotlistDatas[j].iconImg)

            if(j<4){
                Laya.Browser.window.YouziDataManager.sendExposureLog(this.hotlistDatas[j], 4)
                this.guessAnyItemExposure[this.hotlistDatas[j].appid] = 1
            }
        }
        this.visible = true;
        this.guessUI.visible = true;
        this.guessAnylistAutoScroll()
    }

    private guessAnylistAutoScroll(){
        if(!this.guessUI.visible)
            return;

        if(this.hotlistDatas.length<=4){
            return
        }
        var self = this
        var endIndex = self.hotlistDatas.length-4
        var dur = endIndex*5000
        // console.log('self.guesslist.startIndex:' + self.guesslist.startIndex + ' endIndex:' + endIndex)
        if(self.guesslist.startIndex < endIndex-1){
            this.guesslist.tweenTo(endIndex, dur, new Laya.Handler(this, this.guessAnylistAutoScroll))
        }else{
            this.guesslist.tweenTo(0, dur, new Laya.Handler(this, this.guessAnylistAutoScroll))
        }
    }

    private onGuessLikeItemMouseEvent(e:Event, index: number): void{
        if(e.type == 'mousedown'){

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
          
        }else if(e.type == 'mouseover'){
             this.checkExposure()
          
        }
     }

     private checkExposure(){
        if(this.guessUI.visible){
            for(var i=0; i<this.guesslist.length; i++){
                var temItem = this.guesslist.getItem(i)
                // console.log('bottomList ' + i + ' : ' + temItem.x)
                if(temItem && this.guesslist.getItem(i)){
                    var infoData = this.guesslist.getItem(i).infoData
                    // console.log(infoData)
                    if(temItem.y < 464 && !this.guessAnyItemExposure[infoData.appid]){
                        this.guessAnyItemExposure[infoData.appid] = 1
                        Laya.Browser.window.YouziDataManager.sendExposureLog(infoData, 4)
                    }
                }
            }
        }  
    }

}