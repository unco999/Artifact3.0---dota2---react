export class KV{

    CardData:{[keys:string]:{id:number,name:string,attack:number,arrmor:number,health:number,ability1:string,ability2:string,remark:string}}
    AbilityData:{[keys:string]:{id:number,isbig:number,class_name:string,cost:number,heroid:number,type:string,remark:string}}
    Summoned:{[keys:string]:{attack:number,arrmor:number,heal:number,icon:string,name:string}}

    constructor(){
      this.CardData = LoadKeyValues('scripts/npc/CardHero.txt') as any
      this.AbilityData = LoadKeyValues('scripts/npc/Ability.txt') as any
      this.Summoned = LoadKeyValues('scripts/npc/summoned.txt') as any
    }

    GetSummoned(id:string){
       return this.Summoned[id]
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