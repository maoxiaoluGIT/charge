export default class CurveMove{
    private speedX:number;
	private speedY:number;
	private g:number;
	private allTime:number;
	private startTime:number;
	private updateHandler:Laya.Handler;
	private sX:number;
	private sY:number;

    constructor(){
        
    }

    public start( updateHandler:Laya.Handler,overHandler:Laya.Handler, speedX:number,g:number,sX:number,sY:number,eX:number,eY:number ):void{
        this.eY = eY;
        this.eX = eX;
        this.overHandler = overHandler;
        this.sY = sY;
        this.sX = sX;
        this.updateHandler = updateHandler;
        this.g = g;
        this.speedX = speedX;
        if( eX < sX ){
            this.speedX = -this.speedX;
        }
		let xDistance:number = Math.abs( eX - sX );
		this.allTime = Math.abs( xDistance/speedX );
		this.speedY = ( sY - eY  + g * this.allTime * this.allTime / 2)/this.allTime;
		this.startTime = Laya.Browser.now();
		Laya.timer.frameLoop(1,this,this.efFun);
		this.tempPoint.setTo(sX,sY);
		this.updateHandler.runWith(this.tempPoint);
    }

    private efFun():void {
        var time:number = (Laya.Browser.now() - this.startTime)/1000;
        if( time >= this.allTime ){
            Laya.timer.clear(this,this.efFun);
            //tempPoint.setTo(sX,sY);
            this.tempPoint.setTo(this.eX,this.eY);
            this.updateHandler.runWith(this.tempPoint);
            this.overHandler.run();
            return;
        }
        this.getPoByTime(time);
        this.updateHandler.runWith(this.tempPoint);
    }

    private tempPoint:Laya.Point = new Laya.Point();
	private overHandler:Laya.Handler;
	private eX:number;
	private eY:number;
		
    private getPoByTime(time:number):Laya.Point{
        this.tempPoint.x = this.sX + time * this.speedX;
        this.tempPoint.y = this.sY - ( this.speedY * time - this.g * time * time / 2 );
        return this.tempPoint;
    }
    
    public nextPoint():Laya.Point{
        let rate:number = 60;
        let t:number = (Laya.Browser.now() + 1000 / rate - this.startTime )/1000;
        return this.getPoByTime(t);
    }
}