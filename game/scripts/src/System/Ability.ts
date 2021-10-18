import { AbilityManager } from "../Ability/test";
import { Card } from "./card";

export abstract class Ability{
    AfCard:Card // 所属卡牌实例

    constructor(){

    }
}

export class AbilityFactory{
    BUILD(ABILITYNAME:number){
       return new AbilityManager[ABILITYNAME]
    }
}