import { damage } from "../feature/damage";
import { Timers } from "../lib/timers";
import { reloadable } from "../lib/tstl-utils";
import { Card, CardParameter, professionalMagicCard } from "./Card";
import { ICAScene } from "./Scenes";
import { Unit } from "./Unit";

export function ca_register_ability() {
    return function(constructor:any){
        const ability = new constructor() as ability_templater
        AbiliyContainer.instance.register(ability)
    }
}
/**技能容器 */
export class AbiliyContainer{
    Container:Record<string,ability_templater> = {}
    private static _instance:AbiliyContainer
    static get instance(){
        if(!this._instance){
            this._instance = new AbiliyContainer()
            return this._instance
        }
        return this._instance
    }

    register(AbilityCard:ability_templater){
        print(AbilityCard.id,"注册装饰器成功")
        this.Container[AbilityCard.id] = AbilityCard 
    }

    GetAbility(id:string){
        return this.Container[id]
    }

}


/**职业魔法卡实例 */
export class AbilityCard extends Card {

    constructor(CardParameter:CardParameter,Scene:ICAScene){
        super(CardParameter,Scene)
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



export class ability_templater{
    id:string
    consumption:number //消耗水晶
    heorid:string = "15"

    spell_skill(table:(Unit|number)[]){

    }

    constructor(id:string){
        this.id = id
    }
}

@ca_register_ability()
export class jaw extends ability_templater{
    constructor(){
        super("1")
    }

    spell_skill(table:(Unit|number)[]){
        // const hero = GameRules.SceneManager.get_hero(this.heorid) as Unit
        const hero = GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID()).IndexGet(3) as Unit
        super.spell_skill(table)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    const _damage = new damage(hero,target)
                    _damage.spell_skill_settlement(this.damage_calculate(math.abs(hero.Index - target.Index)))
                }   
            }
        })
    }

    /**伤害结算方法 */
    damage_calculate(distance:number){
        return 3 - distance
    }
}