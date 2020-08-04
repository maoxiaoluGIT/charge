export default class MyDeBug{
    constructor(){

    }

    public static trace( txt:string ):void{
        return;
        let a:Laya.Text = <any>Laya.stage.getChildByName("ttt");
        if( a == null ){
            a = new Laya.Text();
            Laya.stage.addChild(a);
            a.width = Laya.stage.width;
            a.height = Laya.stage.height;
            a.fontSize = 50;
            a.color = "#ffffff";
            a.zOrder = 1000001;
            a.name = "ttt";
        }
        a.text += ("\n" + txt);
    }
}