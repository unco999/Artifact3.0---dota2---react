import { Hero } from "../instance/Hero";
import { CAModifiler, ca_register_modifiler, HOOK, modifilertype } from "../instance/Modifiler";

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
