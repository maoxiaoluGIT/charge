import Mediator from "../../game/Mediator";
import { ui } from "../../ui/layaMaxUI";
import BagSession from "../session/BagSession";
import { Res, SysItem } from "../config/SysConfig";
import { EQUIP_TYPE } from "../session/BattleSession";
import MyGameInit from "../MyGameInit";
import App from "../../game/App";

export default class RankInfoMediator extends Mediator{
    constructor(){
        super();
    }

    public dialog:ui.scene.RankInfoDialogUI = null;

    public setSprite(sp:Laya.Sprite):void{
        this.dialog = <any>sp;
    }

    public init():void {
        this.dialog.playerMv.wait.play(0,true);
        let obj = this.param;
        this.dialog.nameText.text = obj.name;
        let s:string = obj.items;
        let arr = s.split(",");
        BagSession.setEquip( this.dialog.playerMv , arr );
        this.dialog.petImg.skin = "player/all/" + arr[4] + ".png"; //Res.getItemUrl( parseInt(arr[4]) );
        this.setEquipmentByPart( this.dialog.e0 , arr[ EQUIP_TYPE.WEAPON -2] );
        this.setEquipmentByPart( this.dialog.e1 , arr[ EQUIP_TYPE.HEAD -2] );
        this.setEquipmentByPart( this.dialog.e2 , arr[ EQUIP_TYPE.BODY -2] );
        this.setEquipmentByPart( this.dialog.e3 , arr[ EQUIP_TYPE.HORSE-2 ] );
    }

    private setEquipmentByPart( img:Laya.Image , id:string ):void{
        let sys = <SysItem>App.getConfig( MyGameInit.sys_item , parseInt(id) );
        let image:Laya.Image = <Laya.Image>img.getChildAt(0);
        img.skin = Res.getItemBorder( sys.itemQuality );
        image.skin = Res.getItemUrl( sys.id );
    }
}