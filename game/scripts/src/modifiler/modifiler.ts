import { Hero } from "../instance/Hero";
import { CAModifiler, ca_register_modifiler, HOOK, modifilertype } from "../instance/Modifiler";
import { BattleArea } from "../instance/Scenes";
import { Unit } from "../instance/Unit";
import { Timers } from "../lib/timers";

@ca_register_modifiler()
export class item_bfury_modifiler extends CAModifiler{
    name: string = "item_bfury_modifiler";
    modifilertype: modifilertype = modifilertype.无;
    duration: number = -1;
    debuff: boolean = false;

    constructor(){
        super("item_bfury_modifiler")
        print("创造了装备的modifiler")
    }

    constructorinstance = item_bfury_modifiler

    register_hook_event() {
        this.setHookEvent(HOOK.创造时,()=>{
            this.thisHero.max_heal += this.influenceMaxheal
            this.thisHero.heal = this.thisHero.max_heal
            return false})
        this.setHookEvent(HOOK.销毁时,()=>{
            this.thisHero.max_heal -= this.influenceMaxheal
            if(this.thisHero.heal > this.thisHero.max_heal){
                this.thisHero.heal = this.thisHero.max_heal
            }
            return false
        })
        this.setHookEvent(HOOK.攻击前,()=>{
            print("狂战斧生效了")
            const {left,center,right} =  GameRules.SceneManager.enemyneighbor(this.thisHero)
            if(typeof(center) != "number"){
                center.hurt(this.thisHero.attack,this.thisHero)
                CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT",{uuid:center.UUID,lookAt:"0 0 0",paticle:"particles/econ/items/ursa/ursa_swift_claw/ursa_swift_claw_right.vpcf",cameraOrigin:"0 500 0"})
            }
            if(typeof(left) != "number"){
                center.hurt(3,this.thisHero)
                CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT",{uuid:left.UUID,lookAt:"0 0 0",paticle:"particles/econ/items/ursa/ursa_swift_claw/ursa_swift_claw_right.vpcf",cameraOrigin:"0 500 0"})
            }
            if(typeof(right) != "number"){
                center.hurt(3,this.thisHero)
                CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT",{uuid:right.UUID,lookAt:"0 0 0",paticle:"particles/econ/items/ursa/ursa_swift_claw/ursa_swift_claw_right.vpcf",cameraOrigin:"0 500 0"})
            }
            return true
        })
    }


    get influenceMaxheal(): any {
        return 0
    }

    get influenceAttack(): any {
        return 3
    }

    get influenceArrmor(): any {
        return 0
    }
    
    get influenceheal(): any {
        return 0
    }

}


@ca_register_modifiler()
export class item_aegis_modifiler extends CAModifiler{
    name: string = "item_aegis_modifiler";
    modifilertype: modifilertype = modifilertype.无;
    duration: number = -1;
    debuff: boolean = false;

    constructor(){
        super("item_aegis_modifiler")
        print("创造了装备的modifiler")
    }

    constructorinstance = item_aegis_modifiler

    register_hook_event() {
        this.setHookEvent(HOOK.死亡前,(thishero:Hero,source:Unit)=>{
            print("触动了免死金牌")
            if(thishero){
                thishero.heal = 1
            }
            CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT",{uuid:thishero.UUID,paticle:"particles/units/heroes/hero_fairy/fairy_revive.vpcf",cameraOrigin:'0 300 0',lookAt:'0 0 0'})
            thishero.removeModifiler(this.name)
            print("返回了false")
            return false
        })
    }


    get influenceMaxheal(): any {
        return 0
    }

    get influenceAttack(): any {
        return 3
    }

    get influenceArrmor(): any {
        return 1
    }
    
    get influenceheal(): any {
        return 0
    }

}

@ca_register_modifiler()
export class item_force_field_modifiler extends CAModifiler{
    name: string = "item_force_field_modifiler";
    modifilertype: modifilertype = modifilertype.无;
    duration: number = -1;
    debuff: boolean = false;
    preDeathIndex:number //死亡前的序号
    preDeathBrach:string //死亡前的场景名字

    constructor(){
        super("item_force_field_modifiler")
        print("创造了装备的modifiler")
    }

    constructorinstance = item_force_field_modifiler

    register_hook_event() {
        this.setHookEvent(HOOK.死亡前,(thishero:Hero,source:Unit)=>{
            print("记录了单位死亡的数据")
            let index = thishero.Index
            let SceneName = thishero.Scene.SceneName
            this.preDeathIndex = index
            this.preDeathBrach = SceneName
            return true
        })
        this.setHookEvent(HOOK.死亡后,(thishero:Hero,source:Unit)=>{
            print("触发了死亡后特效")
            Timers.CreateTimer(3,()=>{
                print("单位回到场上了")
                GameRules.SceneManager.change_secens(thishero.UUID,this.preDeathBrach,this.preDeathIndex)
            })
            return true
        })
    }


    get influenceMaxheal(): any {
        return 0
    }

    get influenceAttack(): any {
        return 3
    }

    get influenceArrmor(): any {
        return 1
    }
    
    get influenceheal(): any {
        return 0
    }

}