import { Timers } from "../lib/timers";
import { add_cuurent_glod } from "../Manager/nettablefuc";
import { LinkedList } from "../structure/Linkedlist";
import { Card, CardParameter, CARD_TYPE, professionalMagicCard } from "./Card";
import { CAModifiler, HOOK, modifilertype } from "./Modifiler";
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

    update_modifiler_to_client(){
        const list = []
        for(const modifiler of this.Modifilers){
            list.push({name:modifiler.name,duration:modifiler.duration,texture:modifiler.texture,id:modifiler.id})
        }
        const table = {}
        table["uuid"] = this.UUID
        table["data"] = list
        if(list.length > 0){
            CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_MODIFILER",table)
        }
    }

    /**是否处于无法攻击状态 */
    isunableToAttack(){
        for(const modifiler of this.Modifilers){
           return bit.bor(modifiler.modifilertype,modifilertype.晕眩) == modifiler.modifilertype
        }
        return false
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
        CustomGameEventManager.RegisterListener("C2S_GET_MODIFILER",(_,event)=>{
            if(event.uuid == this.UUID){
                this.update_modifiler_to_client()
            }
        })
    }

    addmodifiler(modifiler:CAModifiler){
        for(const _modifiler of this.Modifilers){
            if(_modifiler.id == modifiler.id){
                _modifiler.duration = modifiler.duration
                this.update_modifiler_to_client()
                return;
            }
        }
        modifiler.thisHero = this
        this.Modifilers.prepend(modifiler)
        modifiler.call_hook(HOOK.创造时)
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTRIBUTE",this.attribute)
        this.update_modifiler_to_client()
    }

    removeModifiler(name:string){
        const modiflers = []
        for(const modifiler of this.Modifilers){
            if(modifiler.name == name){
                const fuc = modifiler.call_hook(HOOK.销毁时)
                fuc.forEach(_fuc=>{
                    _fuc()
                })
                if(this.Modifilers.length == 1){
                    this.Modifilers = new LinkedList()
                }else{
                    modiflers.push(modifiler)
                }
            }
        }
        modiflers.forEach(modifiler=>{
            this.Modifilers.remove(modifiler)
        })
        this.update_modifiler_to_client()
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

    /**删除不是永久的modifiler */
    deleteLimitedModifier(){
        const list:Array<string> = []
        for(const modifiler of this.Modifilers){
            if(modifiler.duration != -1){
                list.push(modifiler.name)
            }
        }
        list.forEach(name=>{
            print("名为:",name,"的modifiler被删除")
            this.removeModifiler(name)
        })
    }

    call_death(Source:Card){
            const scene = this.Scene
            if(scene instanceof BattleArea){
                if(Source instanceof Unit){
                    Source.hook(HOOK.杀死目标时)
                    add_cuurent_glod(2,Source.PlayerID) 
                }
                const PreDeath = this.hook(HOOK.死亡前)
                let deathbool:boolean = false
                PreDeath.forEach(hook=>{
                   deathbool = hook(this,Source)
                   print(this.UUID,"成功去了墓地")
                })
                !deathbool && GameRules.SceneManager.change_secens(this.UUID,"Grave",-1)
                !deathbool && this.deleteLimitedModifier()
                this.cure(this.max_heal,this)
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


        Prehurt(damageSourece:Card,attack_type:"defualt"|"ability"|"purely"){
            let bool = false
               const callbacks = this.hook(HOOK.被攻击前)
               callbacks.forEach(callback=>{
                   bool = callback(attack_type,this,damageSourece)
               })
            return bool
        }
    

        hurt(count:number,damageSourece:Card,attack_type:"defualt"|"ability"|"purely"){
            if(this.Prehurt(damageSourece,attack_type)){
                return
            }
            this.heal -= count
            if(this.GETheal < 1){
                this.call_death(damageSourece)
            }
            print(this.UUID,"收到了伤害,当前剩余生命值为",this.GETheal)
            this.updateAttribute()
            return count
        }

        updateAttribute(){
            CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTRIBUTE",this.attribute)
        }

        cure(count:number,Source:Card){
            if(this.GETheal + count > this.max_heal){
                this.heal = this.max_heal
                return count
            }
            this.heal+=count
            print(this.UUID,"收到了回复,当前剩余生命值为",this.GETheal)
            CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTRIBUTE",this.attribute)
        }

        ToData() {
            return 
        }
    
}


export class Solider extends Unit{

    constructor(CardParameter:CardParameter,Scene:ICAScene){
        super(CardParameter,Scene,'Solider');
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

    ToData():any {
        return ""
    }

}