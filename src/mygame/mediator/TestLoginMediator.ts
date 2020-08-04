import Mediator from "../../game/Mediator";
import { ui } from "../../ui/layaMaxUI";
import DataSession from "../session/DataSession";

export default class TestLoginMediator extends Mediator{
    public dataSession:DataSession = null;

    constructor(){
        super();
    }

    public testLogin:ui.scene.TestLoginUI;

    setSprite(sp:Laya.Sprite):void{
        this.testLogin = <ui.scene.TestLoginUI>sp;
        if( Laya.LocalStorage.getItem( "name" ) == null ){
            //this.testLogin.input.text = "";
        }else{
            this.testLogin.input.text = Laya.LocalStorage.getItem( "name" );
        }
    }

    public btn_click():void{
        let key = parseInt(this.testLogin.input.text); 
        //this.dataSession.loginMyServer( { code:key } );
        this.dataSession.localLogin( { code:key } );
        Laya.LocalStorage.setItem( "name" , key + "" );
    }

    public getLoaderUrl():Array<string>{
        return ["res/atlas/sence.atlas"];
    }
}