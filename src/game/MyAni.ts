export default class MyAni extends Laya.Image{
    constructor(){
        super();
        this.once( Laya.Event.UNDISPLAY , this,this.undisFun );
    }

    public undisFun():void{
        this.stop();
    }

    public time:number = 0;
    public arr:Array<string> = null;
    public isLoad:boolean = false;

    public setUrl( url:string , arr:Array<string> ):void{
        this.isLoad = true;
        this.arr = arr;
        Laya.loader.load( url , new Laya.Handler(this,this.loadFun)  );
    }

    public loadFun():void{
        this.isLoad = false;
        if( this.isPlay ){
            this.play();
        }
    }

    public isPlay:boolean = false;

    public play():void{
        this.isPlay = true;
        this.now = 0;
        if( this.isLoad ){
            return;
        }
        this.loopFun();
        Laya.timer.loop( this.time , this,this.loopFun );
    }

    public stop():void{
        Laya.timer.clear( this,this.loopFun );
        this.isPlay = false;
    }

    public now:number = 0;

    public loopFun():void{
        this.skin = this.arr[this.now];
        this.now++;
        if( this.now >= this.arr.length ){
            this.now = 0;
            this.event( Laya.Event.COMPLETE );
        }
    }
}