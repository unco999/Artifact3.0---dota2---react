import { Timers } from "../lib/timers";
import { Card, CardParameter, professionalMagicCard } from "./Card";
import { ICAScene } from "./Scenes";

/**职业魔法卡实例 */
export class AbilityCard extends Card implements professionalMagicCard{

    constructor(CardParameter:CardParameter,Scene:ICAScene){
        super(CardParameter,Scene)
    }

    SPEEL_ABILITY(uuid: string) {
        this.GameEventToClientTograve()
    }
    SPEEL_TARGET(target_uuid: string) {
        this.GameEventToClientTograve()
    }
    SPEEL_SCNECE(scene_name: string) {
        this.GameEventToClientTograve()
    }

    GameEventToClientTograve(){
        GameRules.SceneManager.change_secens(this.UUID,"Ability")
        Timers.CreateTimer(3,()=>{
            GameRules.SceneManager.change_secens(this.UUID,"Grave")
        })
    }

}

export class TrickSkill extends AbilityCard{

    constructor(CardParameter:CardParameter,Scene:ICAScene){
        super(CardParameter,Scene)
        this.type = "TrickSkill"
    }
} 

export class SmallSkill extends AbilityCard{
    
    constructor(CardParameter:CardParameter,Scene:ICAScene){
        super(CardParameter,Scene)
        this.type = "SmallSkill"
    }
} 