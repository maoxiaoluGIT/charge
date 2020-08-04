export default class MyEffect{
    constructor(){

    }

    public static clickEffect(sp:Laya.Sprite):void{
        let t = new Laya.Tween();
        t.from( sp,{scaleX:0.9,scaleY:0.9},80);
    }

    public static init():void{
        Laya.stage.on(Laya.Event.CLICK,null,MyEffect.clickFun);
    }

    public static clickFun(e:Laya.Event):void
    {
        if( e.target instanceof Laya.Button ){
            if( e.target.anchorX == 0.5 &&  e.target.anchorY == 0.5){
                MyEffect.clickEffect( e.target );
            }
        }
    }

    public static delayTweenBtn( btn:Laya.Button , delay:number ):void{
        btn.visible = false;
        Laya.timer.once( delay , MyEffect, MyEffect.eff,[btn] , false  );
    }

    public static eff( btn:Laya.Button ):void{
        btn.visible = true;
        let t = new Laya.Tween();
        t.from( btn,{ scaleX:0,scaleY:0 } , 200 ,Laya.Ease.backOut );
    }

    public static alhpa( s:Laya.Sprite , target:number , time:number = 100 ):void{
        if( target == 1 ){
            s.alpha = 0;
        }else{
            s.alpha = 1;
        }
        let t = new Laya.Tween();   
        t.to( s, { alpha:target } , time );
    }

    public static BigSmallEffect( s:Laya.Image ):void{
        s.anchorX = s.anchorY = 0.5;
        let t = new Laya.Tween();
        s.scaleX = s.scaleY = 0.5;
        t.to( s,{ scaleX:0.8,scaleY:0.8,alpha:1,rotation:90 } , 600 , Laya.Ease.backInOut ,null,Math.random() * 100 );
    }

    private static p00Array:Array<Laya.Point> = [];
    private static p00Index:number = 0;
    /**
     * 请确保你的方法内回调其他函数的时候 不会再次调用
     * 因为laya会给他重新赋值 
     * 这个里面有20个
     * 也就是说回调里 连续调用20次 会把第一个重新赋值
     */
    public static getP00():Laya.Point{
        if( MyEffect.p00Array.length == 0 ){
            for( let i:number = 0; i < 20; i++ ){
                let p = new Laya.Point(0,0);
                MyEffect.p00Array.push(p);
            }
        }
        if( MyEffect.p00Index > 19 ){
            MyEffect.p00Index = 0;
        }
        return MyEffect.p00Array[MyEffect.p00Index++].setTo(0,0);
    }

    public static flyToTarget( a:Laya.Sprite , b:Laya.Sprite  ):void{
        let ap = a.localToGlobal(  MyEffect.getP00() );
        a.x = ap.x;
        a.y = ap.y;
        Laya.stage.addChild( a );
        let p = b.localToGlobal( MyEffect.getP00() );
        let t = new Laya.Tween();
        t.to( a,{x:p.x,y:p.y}, 600 , Laya.Ease.backIn ,new Laya.Handler(null,MyEffect.flyCom,[a,b] ) );
    }

    public static flyCom( a:Laya.Sprite , b:Laya.Sprite ){
        a.visible = false;
        MyEffect.smallToBigEffect( <any>b );
    }

    public static smallToBigEffect( a:Laya.Image ):void{
        a.scale( 0.7 , 0.7 );
        let t = new Laya.Tween();
        t.to( a,{ scaleX:1,scaleY:1 },100, Laya.Ease.backOut );
    }

    public static t2( a:Laya.UIComponent , sx:string , value:number ,time:number ,delay:number ):void{
        let t = new Laya.Tween();
        var obj:any = {};
        obj[sx] = value;
        t.from( a ,  obj ,time, null ,null,delay );
    }

    public static t3():void{
        let t = new Laya.Tween();
    }
}