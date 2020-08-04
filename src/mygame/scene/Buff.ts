import { ui } from "../../ui/layaMaxUI";

export default class Buff extends Laya.Sprite{
    constructor(){
        super();
        this.init();
    }

    private init():void{
        let a = new ui.scene.jiabaojiUI();
        this.addChild(a);
    }
}