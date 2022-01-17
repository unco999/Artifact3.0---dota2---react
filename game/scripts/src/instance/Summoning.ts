import { CardParameter } from "./Card";
import { ICAScene } from "./Scenes";
import { Unit } from "./Unit";

/**
 * 召唤物实体
 */
export class Summoning extends Unit{
    icon:string

    constructor(CardParameter:CardParameter, Scene: ICAScene){
        super(CardParameter,Scene,"Summoned")
        const data = GameRules.KV.GetSummoned(CardParameter.Id)
        this.attack = data.attack
        this.heal = data.heal
        this.arrmor = data.arrmor
        this.icon = data.icon
    }

    ToData() {
        return {icon:this.icon}
    }
}
