import Session from "../../game/Session";
import App from "../../game/App";

export default class SetSession extends Session{
    constructor(){
        super();
    }

    public music:boolean = true;
    public sound:boolean = true;
    
    /**
     * true是有音乐
     * @param value 
     */
    public setMusic( value:boolean ):void{
        this.music = value;
        Laya.SoundManager.musicMuted = !this.music;
        App.getInstance().gameSoundManager.setBgmMuted( !value );
    }

    public setSound( value:boolean ):void{
        this.sound = value;
        Laya.SoundManager.soundMuted = !this.sound;
        App.getInstance().gameSoundManager.setEffMuted( !value );
    }
}