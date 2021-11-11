import { LinkedList } from "../structure/Linkedlist";
import { Card, CardParameter, professionalMagicCard } from "./Card";
import { Equip } from "./Equip";
import { CAModifiler } from "./Modifiler";
import { ICAScene } from "./Scenes";



export class Unit extends Card{
    HasAbilities:string[] // 单位拥有的技能字符串
    HasModifiler:LinkedList<CAModifiler> = new LinkedList() //单位拥有的modiflier
    Equip:LinkedList<Equip> = new LinkedList()


    constructor(CardParameter:CardParameter,Scene:ICAScene){
        super(CardParameter,Scene);
    }

    isHasAbility(abilityname:string){
       return this.HasAbilities.includes(abilityname)
    }

    isbuff(){
        return this.HasModifiler.length > 0
    }

    /**获得所有buff的叠加状态 1 3 得4 偶数为多种状态叠加效果*/
    get getAllmodiflerDebuffsymbol(){
        let origin = 0
        for(const modifiler of this.HasModifiler){
            origin += modifiler.modifilertype
        }
        return origin
    }

    /**删除到期的修饰符 */
    Romoverendering(){
        const removelist:CAModifiler[] = []
        for(const modifiler of this.HasModifiler){
            modifiler.duration == 0 && removelist.push(modifiler)
        }
        removelist.forEach((modifiler)=>{
            print(modifiler.name,"modifiler已经到达期限")
            this.HasModifiler.remove(modifiler)
        })
    }


}