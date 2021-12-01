import { LinkedList } from "../structure/Linkedlist";
import { Card, CardParameter, professionalMagicCard } from "./Card";
import { Equip } from "./Equip";
import { CAModifiler } from "./Modifiler";
import { GoUp, ICAScene } from "./Scenes";


export class Unit extends Card{

    constructor(CardParameter:CardParameter,Scene:ICAScene){
        super(CardParameter,Scene)
    }

    register_gameevent(){
        //只有单位有死亡事件  给单位注册死亡事件 执行call death
        super.register_gameevent()
        CustomGameEventManager.RegisterListener("TEST_C2S_DEATH",(_,event)=>{
            if(this.UUID == event.uuid){
                this.call_death()
            }
        })
    }

    call_death(){
        this.Scene.CaSceneManager.change_secens(this.UUID,"Grave",-1)
    }
    
}
export class Hero extends Unit{
    HasAbilities:string[] // 单位拥有的技能字符串
    HasModifiler:LinkedList<CAModifiler> = new LinkedList() //单位拥有的modiflier
    Equip:LinkedList<Equip> = new LinkedList()

    constructor(CardParameter:CardParameter,Scene:ICAScene){
        super(CardParameter,Scene);
        this.type = 'Hero'
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

export class Solider extends Unit{

    constructor(CardParameter:CardParameter,Scene:ICAScene){
        super(CardParameter,Scene);
        this.type = 'Solider';
        (this.Scene as GoUp).AutoAddCard(this,this.Index)
    }

    override call_death(){
        this.Scene.Remove(this.UUID)
        GameRules.SceneManager.remove(this.UUID)
        this.update("REMOVE")
    }

}