export interface Igetformer{
    GetFormer():PlayerID
}

export class TurntableBase implements Igetformer{
    oparetionData:Array<{PlayerID:PlayerID,isoparetion:boolean}> = []
    settlement:boolean = false // true表示结算完毕
    nextRound:PlayerID  // false表示不换手   true表示换手

    constructor(Playerid:PlayerID){
        this.nextRound = Playerid
    }

    /**获取这回合的先手 */
    GetFormer(): PlayerID {
        return this.nextRound
    }

    Add(PlayerID:PlayerID,isoparetion:boolean){
        if(this.settlement) return;
        print("添加了操作信息",PlayerID,isoparetion)
        this.oparetionData.push({PlayerID,isoparetion})
        if(this.oparetionData.length == 1) return; 
        this.isEnd()
    }

    isEnd(){
       const last1 = this.oparetionData[this.oparetionData.length - 1].isoparetion
       const last2 = this.oparetionData[this.oparetionData.length - 2].isoparetion
       if(last1 == false && last2 == false){
           if(this.oparetionData.length == 2){
               //不换手操作
               print("进行了不换手操作")
                this.settlement = true
           }
           if(this.oparetionData.length > 2 ){
            //换手操作
            print("当前操作数大于2")
            this.nextRound =  this.takeTheFirstValueOf1() == GameRules.Red.GetPlayerID() ? GameRules.Blue.GetPlayerID() : GameRules.Red.GetPlayerID()
            this.settlement = true
        }
       }
    }

    /**取到双0的第一个数值 */
     takeTheFirstValueOf1():PlayerID{
         for(let index = 0 ; index < this.oparetionData.length ; index++){
             print("遍历操作数",index)
             const table = this.oparetionData[this.oparetionData.length - index - 1]
             if(table.isoparetion == true){
                 print("上回合最后一个操作的玩家是",table.PlayerID == GameRules.Red.GetTeam() ? "红色" :"蓝色")
                 return table.PlayerID 
             }  
         }
     }

}