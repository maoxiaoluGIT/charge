export default class MyProgressBar{
    constructor(){
        
    }
    
    private maxWid:number = 0;
    private maxHei:number = 0;
    private sp:Laya.Sprite;
    
    public setScrollRectSprite(sp:Laya.Sprite):void{
        this.sp = sp;
        this.maxWid = sp.width;
        this.maxHei = sp.height;
    }

    public setValue( now:number , max:number ):void{
        if( now == 0 ){
            this.sp.visible = false;
        }else{
            this.sp.visible = true;
        }
        let a = now / max;
        this.sp.scrollRect = new Laya.Rectangle( 0, 0 , this.maxWid * a , this.maxHei );
    }
}