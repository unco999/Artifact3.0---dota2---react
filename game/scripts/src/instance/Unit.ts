import { Timers } from "../lib/timers";
import { LinkedList } from "../structure/Linkedlist";
import { Card, CardParameter, CARD_TYPE, professionalMagicCard } from "./Card";
import { CAModifiler } from "./Modifiler";
import { BattleArea, GoUp, Hand, ICAScene, Scenes } from "./Scenes";


export class Unit extends Card{

    Modifilers:LinkedList<CAModifiler> = new LinkedList() //单位拥有的modiflier
    attack:number = 10
    arrmor:number = 10
    heal:number = 10

    constructor(CardParameter:CardParameter,Scene:ICAScene,type:CARD_TYPE){
        super(CardParameter,Scene,type)
    }



    /**攻击结算 */
    attack_settlement(){
        const opposeScnese = this.Scene.find_oppose()
        opposeScnese.IndexGet(this.Index)
    }

    register_gameevent(){
        //只有单位有死亡事件  给单位注册死亡事件 执行call death
        super.register_gameevent()
        CustomGameEventManager.RegisterListener("TEST_C2S_DEATH",(_,event)=>{
            if(this.UUID == event.uuid){
                this.call_death()
            }
        })
        CustomGameEventManager.RegisterListener("C2S_GET_ATTRIBUTE",(_,event)=>{
            if(this.UUID == event.uuid){
                CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTRIBUTE",this.attribute)
            }
        })
    }

    addmodifiler(modifiler:CAModifiler){
        this.Modifilers.prepend(modifiler)
        CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(this.PlayerID),"S2C_SEND_ATTRIBUTE",this.attribute)
    }

    get attribute(){
        return {uuid:this.UUID,attack:this.Getattack,arrmor:this.Getarrmor,heal:this.GETheal}
    }

    get Getattack(){
        let attack = this.attack
        for(const modifier of this.Modifilers){
            attack += modifier.influenceAttack
        }
        return attack
    }

    get Getarrmor(){
        let arrmor = this.arrmor
        for(const modifier of this.Modifilers){
            arrmor += modifier.influenceArrmor
        }
        return arrmor
    }

    get GETheal(){
        let heal = this.heal
        for(const modifier of this.Modifilers){
            heal += modifier.influenceheal
        }
        if(heal < 1){
            return 0
        }
        return heal
    }

    call_death(){
            const scene = this.Scene
            if(scene instanceof BattleArea){
                print("有牌死亡了")
                this.Scene.CaSceneManager.change_secens(this.UUID,"Grave",-1)
            }else{
                print("你当前不在战斗区域")
            }
    }

        /**获得所有buff的叠加状态 1 3 得4 偶数为多种状态叠加效果*/
        get getAllmodiflerDebuffsymbol(){
            let origin = 0
            for(const modifiler of this.Modifilers){
                origin += modifiler.modifilertype
            }
            return origin
        }
    
        /**删除到期的修饰符 */
        Romoverendering(){
            const removelist:CAModifiler[] = []
            for(const modifiler of this.Modifilers){
                modifiler.duration == 0 && removelist.push(modifiler)
            }
            removelist.forEach((modifiler)=>{
                print(modifiler.name,"modifiler已经到达期限")
                this.Modifilers.remove(modifiler)
            })
        }

        isbuff(){
            return this.Modifilers.length > 0
        }

        hurt(count:number){
            this.heal -= count
            if(this.GETheal < 1){
                this.call_death()
            }
            print(this.UUID,"收到了伤害,当前剩余生命值为",this.GETheal)
            CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTRIBUTE",this.attribute)
            return count
        }

        ToData() {
            return ""
        }
    
}


export class Solider extends Unit{
    HasModifiler:LinkedList<CAModifiler> = new LinkedList() //单位拥有的modiflier

    constructor(CardParameter:CardParameter,Scene:ICAScene){
        super(CardParameter,Scene,'Solider');
        (this.Scene as GoUp).AutoAddCard(this,this.Index)
    }

    override call_death(){  
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_DEATH_ANIMATION",{uuid:this.UUID})
        Timers.CreateTimer(1.5,()=>{
            this.Scene.CaSceneManager.change_secens(this.UUID,"Grave",-1)
        })
    }

    ToData() {
        return ""
    }

}