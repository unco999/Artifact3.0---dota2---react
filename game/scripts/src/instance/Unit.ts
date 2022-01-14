import { Timers } from "../lib/timers";
import { add_cuurent_glod } from "../Manager/nettablefuc";
import { LinkedList } from "../structure/Linkedlist";
import { Card, CardParameter, CARD_TYPE, professionalMagicCard } from "./Card";
import { CAModifiler, HOOK } from "./Modifiler";
import { BattleArea, GoUp, Hand, ICAScene, Scenes } from "./Scenes";


export class Unit extends Card{

    Modifilers:LinkedList<CAModifiler> = new LinkedList() //单位拥有的modiflier
    attack:number = 10
    arrmor:number = 10
    heal:number = 10
    max_heal:number = 10
    private faulty:number = 1  //技能伤害层数
 
    constructor(CardParameter:CardParameter,Scene:ICAScene,type:CARD_TYPE){
        super(CardParameter,Scene,type)
        if(type == "Hero"){
            const data = GameRules.KV.GetCardDataKV(Number(CardParameter.Id))
            this.attack = data.attack
            this.arrmor = data.arrmor
            this.heal = data.health
            this.max_heal = this.heal
        }
    }

    roundCalculation(){
        for(const modifiler of this.Modifilers){
            modifiler.roundCalculation()
        }
    }

    /**是否受伤 */
    isinjuried(){
        return this.max_heal != this.GETheal
    }

    isAttackPreHook(){
        for(const modifiler of this.Modifilers){
            print("当前检查modifiler",modifiler.name)
           if(bit.bor(modifiler.hook,HOOK.攻击前) === modifiler.hook){
               print("该单位有攻击前动画")
               return true
           }
        }
        return false
    }

    hook(hook:HOOK){
        const list = []
        for(const modifiler of this.Modifilers){
            list.push(...modifiler.call_hook(hook))
        }
        return list
    }

    /**攻击结算 */
    attack_settlement(){
        const opposeScnese = this.Scene.find_oppose()
        opposeScnese.IndexGet(this.Index)
    }

    register_gameevent(){
        //只有单位有死亡事件  给单位注册死亡事件 执行call death
        super.register_gameevent()
        CustomGameEventManager.RegisterListener("C2S_GET_ATTRIBUTE",(_,event)=>{
            if(this.UUID == event.uuid){
                CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTRIBUTE",this.attribute)
            }
        })
    }

    addmodifiler(modifiler:CAModifiler){
        modifiler.thisHero = this
        this.Modifilers.prepend(modifiler)
        modifiler.call_hook(HOOK.创造时)
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTRIBUTE",this.attribute)
    }

    removeModifiler(name:string){
        for(const modifiler of this.Modifilers){
            if(modifiler.name == name){
                modifiler.call_hook(HOOK.销毁时)
                if(this.Modifilers.length == 1){
                    this.Modifilers = new LinkedList()
                }else{
                    this.Modifilers.remove(modifiler)
                }
            }
        }
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTRIBUTE",this.attribute)
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

    get Getfaulty(){
        let faulty = this.faulty
        for(const modifier of this.Modifilers){
            faulty += modifier.faulty
        }
        return faulty
    }


    get GETheal(){
        return this.heal
    }

    call_death(Source:Card){
            const scene = this.Scene
            if(scene instanceof BattleArea){
                if(Source instanceof Unit){
                    Source.hook(HOOK.杀死目标时)
                    add_cuurent_glod(2,Source.PlayerID) 
                }
                const PreDeath = this.hook(HOOK.死亡前)
                let deathbool:boolean = true
                PreDeath.forEach(hook=>{
                   deathbool = hook(this,Source)
                   print(this.UUID,"成功去了墓地")
                })
                deathbool && GameRules.SceneManager.change_secens(this.UUID,"Grave",-1)
                const PostDeath = this.hook(HOOK.死亡后)
                PostDeath.forEach(hook=>{
                    hook(this,Source)
                    print("当前this的指向场景",this.UUID,this.Scene.SceneName)
                })
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

        hurt(count:number,damageSourece:Card){
            this.heal -= count
            if(this.GETheal < 1){
                this.call_death(damageSourece)
            }
            print(this.UUID,"收到了伤害,当前剩余生命值为",this.GETheal)
            CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTRIBUTE",this.attribute)
            return count
        }

        cure(count:number,Source:Card){
            if(this.GETheal + count > this.max_heal){
                this.heal = this.max_heal
                return count
            }
            this.heal+=count
            print(this.UUID,"收到了回复,当前剩余生命值为",this.GETheal)
        }

        ToData() {
            return ""
        }
    
}


export class Solider extends Unit{

    constructor(CardParameter:CardParameter,Scene:ICAScene){
        super(CardParameter,Scene,'Solider');
        (this.Scene as GoUp).AutoAddCard(this,this.Index)
        this.attack = 3
        this.arrmor = 0
        this.heal = 6
    }

    override call_death(){  
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_DEATH_ANIMATION",{uuid:this.UUID})
        Timers.CreateTimer(2,()=>{
            this.Scene.CaSceneManager.change_secens(this.UUID,"REMOVE",-1)
        })
    }

    ToData() {
        return ""
    }

}