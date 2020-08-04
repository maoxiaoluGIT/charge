import App from "./App";
import GameEvent from "./GameEvent";

export default class OpenDialogManager{
    constructor(){

    }
    
    private arr:Array<any> = [];

    public openOnyByOne( url: string, closeOther: boolean = true, param: any = null  ):void{
        this.arr.push( url,closeOther , param );
        Laya.timer.callLater(this,this.callFun);
    }
    
    private callFun():void{
        if( Laya.Dialog.manager.numChildren != 0 ){
            //有窗口已经显示了
            return;
        }
        this.one();
    }

    private nowUrl:string = null;

    private one():void{
        let u = this.arr.shift();
        let c = this.arr.shift();
        let p = this.arr.shift();
        this.nowUrl = u;
        App.dialog(u,c,p);
        App.onEvent( GameEvent.CLOSE_DIALOG , this, this.cdFun );
    }

    private cdFun( url:string ):void{
        
        //现在有一个问题 我不知道 他加载多长时间
        Laya.timer.once( 100 , this, this.tFun );
        // if( url == this.nowUrl ){
        //     App.getInstance().eventManager.off( GameEvent.CLOSE_DIALOG , this, this.cdFun );
        //     Laya.timer.callLater( this,this.clFun );
        // }
    }

    private tFun():void{
        if( Laya.Dialog.manager.numChildren != 0 ){
            //有窗口已经显示了
            return;
        }
        App.getInstance().eventManager.off( GameEvent.CLOSE_DIALOG , this, this.cdFun );
        Laya.timer.callLater( this,this.clFun );
    }

    /**
     * 关闭的时候检测一下 还有没有其他界面准备打开
     */
    private clFun():void {
        if( Laya.Dialog.manager.numChildren == 0 ){
            if( this.arr.length != 0 ){
                this.one();
            }
        }
    }

}