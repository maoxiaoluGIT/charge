export default class MyClip extends Laya.Clip{
    constructor(){
        super();  
    }

    public clip:Laya.Clip = null;
    /**
     * 自定义移除对象
     * 因为clip可能是view里做好的 需要移除view
     */
    public removeSp:Laya.Sprite = null;
        
    public setClip(clip:Laya.Clip):void{
        this.clip = clip;
    }

    public overStat:number = 0;
    
    /**
     * 播放一遍 并且移除自己
     * overStat 0是移除
     * 1是隐藏
     */
    public playOnceAndRemove( overStat:number = 0 ):void{
        this.overStat = overStat;
        this.clip = this.getClip();
        if( Laya.loader.getRes( this.clip.skin ) == null ) {
            this.clip.on(Laya.Event.LOADED ,this,this.loadedFun);
        }else{
            this.p();
        }
    }

    public loadedFun():void{
        this.p();
    }

    public p():void{
        this.clip.play( 0,this.clip.total-1 );
        this.clip.on(Laya.Event.COMPLETE , this, this.comFun);
    }

    public comFun():void{
        if( this.removeSp != null ){
            if( this.overStat == 0 ){
                this.removeSp.removeSelf();    
            }else if( this.overStat == 1 ){
                this.removeSp.visible = false;
            }
            return;
        }
        if( this.overStat == 0 ){
            this.clip.removeSelf();    
        }else if( this.overStat == 1 ){
            this.clip.visible = false;
        }
    }

    public getClip():Laya.Clip{
        if( this.clip == null ){
            return this;
        }
        return this.clip;
    }
}