import App from "./App";

export default class Mediator{
    constructor(){

    }

    public setSprite(sprite:Laya.Sprite):void{
        
    }

    public param:any;

    /**
     * 这个会调用多次 因为实例只有一个 方便设置参数
     * @param param 
     */
    public setParam(param:any):void{
        this.param = param;
    }

    /**
     * 每次显示的时候 激活
     */
    public init():void{
        
    }

     /**
     * 自动加载 这个可以是scene可以是任何东西 都会自动加入到队列里
     */
    public getUrl():Array<any>{
        return null;
    }

    public getPreUrl():Array<any>{
        return null;
    }

    public getLoaderUrl():Array<string>{
        return null;
    }

    public getLoaderPreUrl():Array<string>{
        return null;
    }
}