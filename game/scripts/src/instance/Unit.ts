import { Linkedlist } from "../structure/Linkedlist";
import { Card, CardParameter, professionalMagicCard } from "./Card";
import { CAModifiler } from "./Modifiler";
import { ICAScene } from "./Scenes";

class Unit extends Card{
    HasAbilities:string[] // 单位拥有的技能字符串
    HasModifiler:Linkedlist<CAModifiler> //单位拥有的modiflier

    constructor(CardParameter:CardParameter,Scene:ICAScene){
        super(CardParameter,Scene);
    }

    isHasAbility(abilityname:string){
       return this.HasAbilities.includes(abilityname)
    }

    isDebuff(){
        return this.HasModifiler.len > 0
    }

    /**获得所有buff的叠加状态 1 3 得4 偶数为多种状态叠加效果*/
    get getAllmodiflerDebuffsymbol(){
        let origin = 0
        for(let key = 0 ; key < this.HasModifiler.length ; key ++){
            if(this.HasModifiler[key].duration !== 0){
                 origin += this.HasModifiler[key].modifilertype
            }
         }
         return origin
    }

    /**删除到期的修饰符 */
    Romoverendering(){
        this.HasModifiler = this.HasModifiler.map(modifiler=> modifiler.duration !== 0 ? modifiler : )
    }


}