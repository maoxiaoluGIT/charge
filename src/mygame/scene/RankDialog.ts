import { ui } from "../../ui/layaMaxUI";
import DataSession from "../session/DataSession";
import App from "../../game/App";

export default class RankDialog extends ui.scene.RankDialogUI{
    public dataSession:DataSession = null;
    constructor(){
        super();
        
    }
}