import Mediator from "../../game/Mediator";
import { ui } from "../../ui/layaMaxUI";
import GetItemViewBox from "../scene/GetItemViewBox";
import App from "../../game/App";
import MyEvent from "../MyEvent";

export default class NewGetItemMediator extends Mediator{
    constructor(){
        super();
    }

    public dialog:ui.scene.GetItemDialogUI = null;

    setSprite( sp ):void{
        this.dialog = sp;
        this.dialog.on( Laya.Event.UNDISPLAY ,this ,this.undisFun );
    }

    public undisFun():void{
        App.sendEvent( MyEvent.GET_GOLD_CLOSE );
    }

    public now:number = 0;
    public dArr:Array<any> = [];

    setParam( p ):void{
        this.dialog.box.removeChildren();
        if( p instanceof Array ){
            this.dArr = p;    
        }else{
            this.dArr = [p];
        }
        
        //this.dArr = [1,1,1,1,1,1,1,1,1,1,1,1];

        this.now = 0;
        
        let len = this.dArr.length;
        this.dialog.box.width = ( (len >= this.col) ? 3 : len) * 700;
        this.dialog.box.height = Math.ceil( len / this.col ) * 700;
        
        let sw = 750 / this.dialog.box.width;
        this.dialog.box.scale( sw,sw );
        
        let wid = this.dialog.box.width * this.dialog.box.scaleX;
        
        this.dialog.btn.y = this.dialog.box.height * sw + 100;

        if( this.dialog.btn.y > ( Laya.stage.height - 80 ) ){
            this.dialog.btn.y = Laya.stage.height - 80;
        }

        this.dialog.box.x = (750 - wid)/2;
        
        Laya.timer.once( 400 ,this,this.effect );

        this.dialog.height = this.dialog.box.height * sw + 200;

        //this.dialog.graphics.drawRect( 0,0, this.dialog.width ,this.dialog.height,"#000000" );
    }

    public col:number = 3;

    public effect():void{
        let v = new GetItemViewBox();
        v.x = this.now % this.col * 700 + 350;
        v.y = Math.floor(this.now / this.col) * 600 + 350;
        v.setData( this.dArr[this.now] );
        this.dialog.box.addChild( v );
        this.now++;
        let t = new Laya.Tween();
        t.from( v , {scaleX:3 , scaleY:3 , alpha:0 } , 300 );
        if( this.now < this.dArr.length ){
            Laya.timer.once( 100 , this,this.effect );
        }else{
            this.dialog.btn.visible = true;
        }
    }

    init():void{
        this.dialog.btn.visible = false;
    }
}