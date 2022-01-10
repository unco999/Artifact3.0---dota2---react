export class KV{

    CardData:{[keys:string]:{id:number,name:string,attack:number,arrmor:number,health:number,ability1:string,ability2:string,remark:string}}
    AbilityData:{[keys:string]:{id:number,isbig:number,class_name:string,cost:number,heroid:number,type:string,remark:string}}

    constructor(){
      this.CardData = LoadKeyValues('scripts/npc/CardHero.txt') as any
      this.AbilityData = LoadKeyValues('scripts/npc/Ability.txt') as any
       print("打印键值对")
       DeepPrintTable(this.CardData)
       DeepPrintTable(this.AbilityData)
    }

    GetCardDataKV(CardOriginID:number){
       print("寻找英雄id为",CardOriginID)
       return this.CardData[CardOriginID.toString()]
    }

    GetAbilityDataKV(AbilityID:number){
       return this.AbilityData[AbilityID.toString()]
    }

    foreach(cb:(key,v)=>void){
       for(const key in this.AbilityData){
           cb(key,this.AbilityData[key])
       }
    }
}