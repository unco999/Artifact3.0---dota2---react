export class KV{

    CardData:any

    constructor(){
       this.CardData = LoadKeyValues('scripts/npc/CardHero.txt')
       print("打印键值对")
       DeepPrintTable(this.CardData)
    }

    GetCardDataKV(CardOriginID:number){
       return this.CardData[CardOriginID]
    }
}