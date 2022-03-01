import { Timers } from "../lib/timers";
import { add_cuurent_glod, get_current_operate_brach, get_cuurent_glod } from "../Manager/nettablefuc";
import { get_oparaotr_current } from "../Manager/statusSwitcher";
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
    death_state:boolean = false
 
    constructor(CardParameter:CardParameter,Scene:ICAScene,type:CARD_TYPE){
        super(CardParameter,Scene,type)
        if(type == "Hero"){
            const data = GameRules.KV.GetCardDataKV(Number(CardParameter.Id))
            this.attack = Number(data.attack)
            this.arrmor = Number(data.arrmor)
            this.heal = Number(data.health)
            this.max_heal = Number(this.heal)
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
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_MODIFILER",table)
    }

    /**是否处于无法攻击状态 */
    isunableToAttack(){
        for(const modifiler of this.Modifilers){
           return bit.bor(modifiler.modifilertype,modifilertype.晕眩) == modifiler.modifilertype ||
                  bit.bor(modifiler.modifilertype,modifilertype.虚无) == modifiler.modifilertype ||
                  bit.bor(modifiler.modifilertype,modifilertype.缴械) == modifiler.modifilertype
        }
        return false
    }

    /**是否处于无法释放技能状态 */
    isunableToReleaseSkills(){
        for(const modifiler of this.Modifilers){
            return bit.bor(modifiler.modifilertype,modifilertype.晕眩) == modifiler.modifilertype
            || bit.bor(modifiler.modifilertype,modifilertype.沉默) == modifiler.modifilertype
            || bit.bor(modifiler.modifilertype,modifilertype.冻结) == modifiler.modifilertype
         }
         return false
    }


    roundCalculation(){
        print("该单位的modifiler减少了",this.UUID)
        const modiflers = []
        for(const modifiler of this.Modifilers){
            if(modifiler.duration == -1){
                continue
            }
            modifiler.duration--
            if(modifiler.duration <= 0){
                    const fuc = modifiler.call_hook(HOOK.销毁时)
                    fuc.forEach(_fuc=>{
                        _fuc()
                    })
                    modiflers.push(modifiler)
                } 
            }
            modiflers.forEach(modifiler=>{
                if(this.Modifilers.length == 1){
                    this.Modifilers = new LinkedList()
                    return
                }
                this.Modifilers.remove(modifiler)
            })
            this.update_modifiler_to_client()
            CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTRIBUTE",this.attribute)
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
        const calls = modifiler.call_hook(HOOK.创造时)
        calls.forEach(card=>{
            card()
        })
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTRIBUTE",this.attribute)
        this.update_modifiler_to_client()
    }

    hasMoidifler(modifierName:string){
        for(const modifier of this.Modifilers){
            if(modifier.name == modifierName){
                return true
            }
        }
        return false
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
    
    changeTeam(playerID){
        this.PlayerID = playerID
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


    Find_left_Card(){
       if(!this.isBattle()) return null
       const unit = (GameRules.SceneManager.GetScenes(this.Scene.SceneName,this.PlayerID) as BattleArea ).CardList[this.Index - 1 - 1]
       if(unit && typeof(unit) != 'number' ){
           return unit as Unit
       }
       return null
    }

    Find_right_Card(){
        if(!this.isBattle()) return null
        const unit = (GameRules.SceneManager.GetScenes(this.Scene.SceneName,this.PlayerID) as BattleArea ).CardList[this.Index - 1 + 1]
        if(unit && typeof(unit) != 'number' ){
            return unit as Unit
        }
        return null
    }
    

    call_death(Source:Card){
            if(this.death_state == true) return;
            const scene = this.Scene
            if(scene instanceof BattleArea){
                if(Source instanceof Unit){
                    const call = Source.hook(HOOK.杀死目标时)
                    call.forEach(_call=>{
                        _call(this)
                    })
                    add_cuurent_glod(2,Source.PlayerID)
                    print("增加了两枚金币,当前金币数")
                    print(get_cuurent_glod(Source.PlayerID)) 
                }
                const PreDeath = this.hook(HOOK.死亡前)
                let deathbool:boolean = false
                PreDeath.forEach(hook=>{
                   deathbool = hook(this,Source)
                   print(this.UUID,"成功去了墓地")
                })
                !deathbool && GameRules.SceneManager.change_secens(this.UUID,"Grave",-1)
                !deathbool && this.deleteLimitedModifier()
                !deathbool && (this.death_state = true)
                const PostDeath = this.hook(HOOK.死亡后)
                PostDeath.forEach(hook=>{
                    hook(this,Source)
                    print("当前this的指向场景",this.UUID,this.Scene.SceneName)
                })
                this.cure(99999,this)
                Timers.CreateTimer(1,()=>{
                    this.death_state = false
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


        Prehurt(damageSourece:Card,attack_type:"ability"|"default"|"purely",damage_count:number){
            if(attack_type != 'default') return false;
            let bool = false
               const callbacks = this.hook(HOOK.被攻击前)
               callbacks.forEach(callback=>{
                   bool = callback(attack_type,this,damageSourece)
               })
            return bool
        }
    
        
        abilityPrehurt(damageSourece:Card,attack_type:"ability"|"default"|"purely",damage_count:number){
            if(attack_type != 'ability') return false;
            let bool = false
               const callbacks = this.hook(HOOK.被技能击中前)
               callbacks.forEach(callback=>{
                   bool = callback(damage_count,damageSourece,this)
               })
            return bool
        }

        lastAbilityPrehurt(damageSourece:Card,attack_type:"ability"|"default"|"purely",damage_count:number){
            if(attack_type != 'ability') return false;
            let bool = false
               const callbacks = this.hook(HOOK.被技能击中后)
               callbacks.forEach(callback=>{
                   bool = callback(damage_count,damageSourece,this)
               })
            return bool
        }
    

        hurt(count:number,damageSourece:Card,attack_type:"ability"|"default"|"purely",cb?:Function){
            if(this.death_state == true) return
            if(this.Prehurt(damageSourece,attack_type,count)){
                return
            }
            if(this.abilityPrehurt(damageSourece,attack_type,count)){
                return
            }
            if(cb){
                cb()
            }else{
                if(attack_type == 'purely'){
                    this.heal = this.GETheal - count
                }else{
                    this.heal = this.GETheal - (count - this.Getarrmor)
                }
            }
            this.lastAbilityPrehurt(damageSourece,attack_type,count)
            print(damageSourece.UUID,"攻击了",this.UUID,"攻击值为",this.GETheal - (count - this.Getarrmor))
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
                print(this.heal,"溢出治疗查询table")
                print(this.max_heal,"溢出治疗查询table")
                return count
            }
            this.heal += count
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
        this.max_heal = 6
    }

    override call_death(){  
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_DEATH_ANIMATION",{uuid:this.UUID})
        Timers.CreateTimer(1.5,()=>{
            this.Scene.CaSceneManager.change_secens(this.UUID,"REMOVE",-1)
        })
    }

    ToData():any {
        return ""
    }

}