import Mediator from "../../game/Mediator";
import { ui } from "../../ui/layaMaxUI";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import BattleSession from "../session/BattleSession";
import DataSession from "../session/DataSession";

export default class NewerMediator extends Mediator{
    public battleSession:BattleSession = null;

    constructor(){
        super();
    }

    /**
     * 应该在这时候背景加载资源
     */
    public init():void{
        this.allvisible();
        this.arr.push(this.scene.img1 );
        this.arr.push(this.scene.img2 );
        //this.arr.push(this.scene.img3 );
        this.exeone();
        
        this.scene.tiaoguo.on( Laya.Event.CLICK,this,this.tiaoFun );
    }

    public tiaoFun():void{
        Laya.timer.clearAll(this);
        if( this.ttt ){
            this.ttt.clear();
        }
        this.e3();
    }

    public exeone():void{
        this.allvisible();
        if( this.arr.length == 0 ){
            this.e3();
            return;
        }
        let a = this.arr.shift();
        this.disOne(a);
    }

    public e3():void{
        this.battleSession.setNewer();
        DataSession.START_TIME = Laya.Browser.now();
        App.getInstance().openScene(MyGameInit.BattleScene);
    }

    public arr:Array<Laya.Image> = [];

    public disOne( a:Laya.Sprite ):void{
        a.visible = true;
        a.alpha = 0;
        let t = new Laya.Tween();
        this.ttt = t;
        t.to( a,{alpha:1} , 1000 , null,new Laya.Handler(this,this.comFun) );
    }

    public ttt:Laya.Tween = null;

    public comFun():void{
        Laya.timer.once( 2500,this,this.nextFun );
    }

    public nextFun():void {
        let s = this.getOne();
        let t = new Laya.Tween();
        t.to( s, {alpha:0},130,null,new Laya.Handler(this,this.exeone) );
    }

    public getOne():Laya.Sprite{
        for( let i:number = 0; i < this.scene.numChildren; i++ ){
            let s = <Laya.Sprite>this.scene.getChildAt(i);
            if( s.visible ){
                return s;
            }
        }
    }

    public allvisible():void{
        for( let i:number = 0; i < this.scene.numChildren; i++ ){
            let s = <Laya.Sprite>this.scene.getChildAt(i);
            s.visible = false;
        }
        this.scene.tiaoguo.visible = true;
    }

    public scene:ui.scene.NewerSceneUI;

    public setSprite(sp:Laya.Sprite):void{
        this.scene = <any>sp;
    }

    public getLoaderPreUrl():Array<string>{
        let arr:Array<string> = [];
        arr.push( "battlescene/bg0.jpg" );
        arr.push( "battlescene/shu1.png" );
        arr.push( "battlescene/shu2.png" );
        arr.push( "res/atlas/player/all.atlas" );
        return arr;
    }
}