export default class MyAnimation extends Laya.Animation{
    public static loadMap:any = {};
    public static ed:Laya.EventDispatcher = new Laya.EventDispatcher();
    
    public aniname:string;
    
    constructor(){
        super();
    }

    public load( url:string,atlas:string = null ):void {
         this.aniname = url;
         //this.source = this.aniname;
        // return;
        // if( Laya.loader.getRes( atlas ) ){
        //     //都加载完了
        //     this.disFun();
        // }else{
        //     if( MyAnimation.loadMap[url] == null ){
        //         //现在没有人在加载
        //         this.loadAnimation(url , new Laya.Handler(this,this.loadOverFun) , atlas);
        //         MyAnimation.loadMap[url] = 1;
        //     }else{
        //         //如果有人在加载
        //         MyAnimation.ed.once(url,this,this.disFun);
        //     }
        // }
        Laya.loader.load( atlas, new Laya.Handler(this,this.comFun) );
    }

    public comFun():void{
        this.source = this.aniname;
    }

    public loadOverFun():void{
        MyAnimation.ed.event(this.aniname);
    }

    public disFun():void{
        this.source = this.aniname;
    }
}