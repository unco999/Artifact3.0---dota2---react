export class KV{

    CardData:any

    constructor(){
       this.CardData = LoadKeyValues('scripts/npc/ship.txt')
    }

    GetCardDataKV(CardOriginID:number){
       return this.CardData[CardOriginID]
    }
}