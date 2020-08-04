import App from "./App";
import GameEvent from "./GameEvent";
import MyEvent from "../mygame/MyEvent";

export default class GameSoundManager{
    constructor(){
        Laya.timer.callLater(this,this.initEvent);
    }

    public onWX_ON_SHOW():void{
        //this.playBgm( this.bgmUrl );
        if( Laya.Browser.onMiniGame && this.currentWxSound ){
            this.currentWxSound.play();
        }
    }

    public onWX_ON_HIDE():void{
        //Laya.SoundManager.stopAll();
        if( Laya.Browser.onMiniGame && this.currentWxSound ){
            this.currentWxSound.pause();
        }
    }

    private initEvent():void{
        App.onEvent( GameEvent.OPEN_SCENE ,this, this.openSceneFun );
        App.onEvent( MyEvent.WX_ON_SHOW ,this,this.onWX_ON_SHOW );
        App.onEvent( MyEvent.WX_ON_HIDE ,this,this.onWX_ON_HIDE );
        App.onEvent( MyEvent.AD_OVER ,this,this.onWX_ON_SHOW );
    }

    private openSceneFun( url:string ):void{
        if( this.bgmMap[url] ){
            this.playBgm( this.bgmMap[url] );
        }
    }

    public static BTN:string = "BTN";
    
    public bgmMap:any = {};
    public reg(url:string,bgm:string):void{
        this.bgmMap[url] = bgm;
        if( url == GameSoundManager.BTN ){
            Laya.stage.on(Laya.Event.CLICK,this,this.clickFun);
        }
    }

    public clickFun(e:Laya.Event):void{
        if( e.target instanceof Laya.Button ){
            this.playEffect( this.bgmMap[GameSoundManager.BTN] );
        }
    }

    public currentWxSound = null;
    public bgmUrl:string = null;

    public playBgm(url:string):void{
        this.bgmUrl = url;
        console.log( "播放背景音乐" );
        if( Laya.Browser.onMiniGame ){
            if( this.currentWxSound ){
                this.currentWxSound.stop();
                this.currentWxSound.destroy();
                this.currentWxSound = null;
                console.log("音频已经销毁");
            }
            let wxSound = Laya.Browser.window.wx.createInnerAudioContext();
            wxSound.autoplay = true;
            wxSound.loop = true;
            //console.log( "aaaaaaaaaaaaa" , url  , Laya.ResourceVersion.manifest[url]  );
            if( Laya.ResourceVersion.manifest[url] == null ){
                wxSound.src = Laya.URL.basePath + url;
            }else{
                wxSound.src = Laya.URL.basePath + Laya.ResourceVersion.manifest[url];
            }
            //console.log( "aaaaaaaaaaaaa" , wxSound.src );
            this.currentWxSound = wxSound;
            this.setBgmMuted( this.noBgm );
        }else{
            Laya.SoundManager.playMusic( url );
        }
    }

    public noBgm:boolean = false;
    public noEff:boolean = false;

    public setBgmMuted( v:boolean ):void{
        this.noBgm = v;
        if( Laya.Browser.onMiniGame && this.currentWxSound ){
            if( v ){
                this.currentWxSound.volume = 0;
            }else{
                this.currentWxSound.volume = 0.5;
            }
        }
    }

    public setEffMuted(  v:boolean ):void{
        this.noEff = v;
    }

    public stopBgm():void{
        if( Laya.Browser.onMiniGame ){
            if( this.currentWxSound ){
                this.currentWxSound.stop();
                this.currentWxSound.destroy();
                this.currentWxSound = null;
                console.log("音频已经销毁");
            }
        }else{
            Laya.SoundManager.stopMusic();
        }
    }
 
    public playEffect(url:string):void {
        if( this.noEff ){
            return;
        }
        if( Laya.Browser.onMiniGame ){
            let b = Laya.Pool.getItem( url );
            if( b == null ){
                new WXSound( url );
            }else{
                b.play();
            }
        }else{
            Laya.SoundManager.playSound( url );
        }
    }
}

export class WXSound{
    public url:string;
    public wxSound:any;

    constructor( url ){
        this.url = url;
        this.wxSound = Laya.Browser.window.wx.createInnerAudioContext();
        this.wxSound.autoplay = true;
        this.wxSound.loop = false;
        //this.wxSound.src = Laya.URL.basePath + Laya.ResourceVersion.manifest[url];
        if( Laya.ResourceVersion.manifest[url] == null ){
            this.wxSound.src = Laya.URL.basePath + url;
        }else{
            this.wxSound.src = Laya.URL.basePath + Laya.ResourceVersion.manifest[url];
        }

        this.wxSound.onEnded( ()=>{
            Laya.Pool.recover( this.url , this.wxSound );
        } );
    }
}