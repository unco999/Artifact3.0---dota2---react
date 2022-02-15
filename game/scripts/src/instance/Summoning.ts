import { Timers } from "../lib/timers";
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
        this.max_heal = this.heal
    }

    ToData() {
        return {icon:this.icon}
    }

    override call_death(){  
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_DEATH_ANIMATION",{uuid:this.UUID})
        Timers.CreateTimer(1.5,()=>{
            this.Scene.CaSceneManager.change_secens(this.UUID,"REMOVE",-1)
        })
    }
}
