import Session from "../../game/Session";
import IJsonData from "./IJsonData";
import DataSession from "./DataSession";

export default class TreasureSession extends Session implements IJsonData{
    public dataSession:DataSession = null;
    public time:number = 0;

    constructor(){
        super();
        Laya.timer.callLater( this,this.nextFun );
    }

    public nextFun():void{
        this.dataSession.regAtt( this );
    }

    public getData():string{
        return this.time + "";
    }

    public setData(value:string):void{
        if( value == null ){
            
        }else{
            this.time = parseInt( value );
        }
    }

    public openBox():void{
        this.time = Laya.Browser.now() + 3 * 60 * 60 * 1000;
    }

    public canOpen():boolean{
        return this.time < Laya.Browser.now();
    }
}