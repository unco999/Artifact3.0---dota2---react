import { Card } from "../instance/Card";
import { Tower } from "../instance/Tower";
import {Unit} from "../instance/Unit"
import { Hero } from "../instance/Hero";
import { Timers } from "../lib/timers";
import { HOOK, hook_parameter } from "../instance/Modifiler";

export class damage{
    damageA:Unit
    damageB:Unit
    delay:number
    unidirectional:boolean
    private A_B_D:number //本次A对B造成的伤害
    private B_A_D:number //本次B对A造成的伤害

    constructor(damageA:Unit,damageB?:Unit,unidirectional?:boolean,delay?:number){
        this.damageA = damageA
        this.damageB = damageB
        this.unidirectional = unidirectional
        this.delay = delay
    }

    SetthisdamageCount(target:"A"|"B",count:number){
        target == 'A' ? this.Set_A_B_D_damage(count) : this.Set_B_A_D_damage(count)
    }

    Set_A_B_D_damage(count:number,tower?:Tower){
        this.B_A_D = count
        this.postTheAttackhookHero({my:this.damageA,damage_target:this.damageB??tower,causeSomeDamages:count})
    }

    Set_B_A_D_damage(count:number,tower?:Tower){
        this.A_B_D = count
        this.postTheAttackhookHero({my:this.damageB,damage_target:this.damageA??tower,causeSomeDamages:count})
    }

    /**返回值为真的时候不进行正常结算 */
    beforeTheAttackhookHero(props:hook_parameter[HOOK.攻击前]){
        let bool = false
        if(props?.my?.type && props.my.type == 'Hero'){
           const callbacks =(props.my as Hero).hook(HOOK.攻击前)
           callbacks.forEach(callback=>{
               bool = callback(props)
           })
        }
        return bool
    }

    postTheAttackhookHero(props:hook_parameter[HOOK.攻击后]){
        let bool = false
        if(props.my.type && props.my.type == 'Hero'){
           const callbacks = (props.my as Hero).hook(HOOK.攻击后)
           callbacks.forEach(callback=>{
               bool = callback(props)
           })
        }
        return bool
    }


    unilateralAttack(){
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTACK",{uuid:this.damageA.UUID})
        if(!this.damageA || !this.damageB) return 
        Timers.CreateTimer(1.5,()=>{
            !this.beforeTheAttackhookHero({my:this.damageA,target:this.damageB}) && this.Set_A_B_D_damage(this.damageB.hurt(this.damageA.attack,this.damageA,"default"))
        })
    }
 
    settlement(){
        Timers.CreateTimer(this.delay ?? 0 ,()=>{
            this.damageA && !this.damageA?.isunableToAttack() && CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTACK",{uuid:this.damageA.UUID})
            this.damageB && !this.damageB?.isunableToAttack() && CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTACK",{uuid:this.damageB.UUID})
            Timers.CreateTimer(1.5,()=>{
                this.damageA && this.damageB && !this.damageB.isunableToAttack() && !this.beforeTheAttackhookHero({my:this.damageB,target:this.damageA}) && this.Set_B_A_D_damage(this.damageA.hurt(this.damageB.Getattack,this.damageB,"default"))
                this.damageB && this.damageA && !this.damageA.isunableToAttack()&& !this.beforeTheAttackhookHero({my:this.damageA,target:this.damageB}) && this.Set_A_B_D_damage(this.damageB.hurt(this.damageA.Getattack,this.damageA,"default"))
            })
        })
    }

    /** 当damageB target为空时将以塔为目标  */
    attacklement(){
        if(!this.damageA  && !this.damageB) return;
        if( !this.damageB  && !this.damageA?.isunableToAttack() &&this.unidirectional){
            const iscover = this.beforeTheAttackhookHero({my:this.damageA,target:GameRules.TowerGeneralControl.getCardScenceTower(PlayerResource.GetPlayer(this.damageA.PlayerID),this.damageA)})
            !iscover && CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTACK",{uuid:this.damageA.UUID})
            !iscover && Timers.CreateTimer(1.3,()=>{
               const tower = GameRules.TowerGeneralControl.getCardScenceTower(PlayerResource.GetPlayer(this.damageA.PlayerID),this.damageA) as Tower
               tower.hurt(this.damageA.Getattack)
               this.Set_A_B_D_damage(this.damageA.Getattack,tower)
            })
        }else{
            this.settlement()
        }
    }

    spell_skill_settlement(damage_count:number,source:Card,attack_type:"ability"|"default"|"purely" = 'ability',particle?:string){       
        CustomGameEventManager.Send_ServerToAllClients("S2C_HURT_DAMAGE",{particle: particle ?? "particles/econ/items/shadow_fiend/sf_desolation/sf_rze_dso_scratch.vpcf",uuid:this.damageB.UUID})
        Timers.CreateTimer(1.5,()=>{
            if(this.damageB){
               this.damageB.hurt(damage_count,source,attack_type)
            }
        })
    }
}