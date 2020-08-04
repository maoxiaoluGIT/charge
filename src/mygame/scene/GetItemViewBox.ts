import { ui } from "../../ui/layaMaxUI";
import RotationEffect from "./RotationEffect";
import { Equip, Res, SysItem } from "../config/SysConfig";

export default class GetItemViewBox extends ui.scene.GetItemViewUI{
    public map:any = {};
    
    constructor(){
        super();
        this.map["普通"] = "sence/putong.png";
        this.map["精致"] = "sence/jingying.png";
        this.map["强化"] = "sence/qianghua.png";
        this.map["史诗"] = "sence/shishi.png";
        this.map["罕见"] = "sence/hanjian.png";
        this.map["稀有"] = "sence/xiyou.png";
        this.anchorX = this.anchorY = 0.5;
        RotationEffect.play( this.light );
    }

    public setData( p ):void {
        this.equipTxtImg.visible = false;
        this.goldFc.visible = false;
        if( p instanceof Equip ){
            this.logo.skin = null;
            this.logo.skin = Res.getItemUrl( p.getSysItem().id );
            this.logo.scale(2.2,2.2);
            this.equipTxtImg.visible = true;
            this.equipTxtImg.skin = this.map[p.getSysItem().name];
        } else if ( p instanceof SysItem ){
            this.logo.skin = null;
            this.logo.skin = Res.getItemUrl( p.id );
            this.logo.scale(2.2,2.2);
            this.equipTxtImg.visible = true;
            this.equipTxtImg.skin = this.map[p.name];
        } else if ( p instanceof Object ){
            if( p.type == 0 ){
                this.logo.skin = null;
                this.logo.skin = p.logo;
                this.logo.scale(1.5,1.5);
                this.equipTxtImg.visible = true;
                this.equipTxtImg.skin = p.txtImg;
            }
        } else {
            this.logo.skin = null;
            this.logo.skin = "sence/jinbidai.png";
            this.logo.scale(1,1);
            this.goldFc.visible = true;
            this.goldFc.value = <number>p + "";
        }
    }
}