import { Card } from "../instance/Card";
import { HOOK, hook_parameter } from "../instance/Equip";
import { Tower } from "../instance/Tower";
import {Unit} from "../instance/Unit"
import { Hero } from "../instance/Hero";
import { Timers } from "../lib/timers";

export class damage{
    damageA:Unit
    damageB:Unit
    private A_B_D:number //本次A对B造成的伤害
    private B_A_D:number //本次B对A造成的伤害

    constructor(damageA:Unit,damageB?:Unit){
        this.damageA = damageA
        this.damageB = damageB
    }

    SetthisdamageCount(target:"A"|"B",count:number){
        target == 'A' ? this.Set_A_B_D_damage(count) : this.Set_B_A_D_damage(count)
    }

    Set_A_B_D_damage(count:number){
        this.B_A_D = count
        this.postTheAttackhookHero({my:this.damageB,damage_target:this.damageB,causeSomeDamages:count,whetherToKill:this.damageA.isBattle(),attack_target:"塔"})
    }

    Set_B_A_D_damage(count:number){
        this.A_B_D = count
        this.postTheAttackhookHero({my:this.damageB,damage_target:this.damageA,causeSomeDamages:count,whetherToKill:this.damageB.isBattle(),attack_target:"塔"})
    }

    /**返回值为真的时候不进行正常结算 */
    beforeTheAttackhookHero(props:hook_parameter[HOOK.攻击前]){
        let bool = false
        if(props.my.type && props.my.type == 'Hero'){
           const callbacks =(props.my as Hero).GetEquipModifiler<hook_parameter[HOOK.攻击前]>(HOOK.攻击前)
           callbacks.forEach(callback=>{
               bool = callback({my:props.my,target:props.target,attack_target:props.attack_target})
           })
        }
        return bool
    }

    postTheAttackhookHero(props:hook_parameter[HOOK.攻击后]){
        let bool = false
        if(props.my.type && props.my.type == 'Hero'){
           const callbacks = (props.my as Hero).GetEquipModifiler<hook_parameter[HOOK.攻击后]>(HOOK.攻击后)
           callbacks.forEach(callback=>{
               bool = callback({my:props.my,attack_target:props.attack_target,causeSomeDamages:props.causeSomeDamages,whetherToKill:props.whetherToKill,damage_target:props.damage_target})
           })
        }
        return bool
    }
 
    settlement(){
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTACK",{uuid:this.damageA.UUID})
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTACK",{uuid:this.damageB.UUID})
        Timers.CreateTimer(1.5,()=>{
            this.beforeTheAttackhookHero({my:this.damageB,attack_target:"塔",target:this.damageB}) && this.Set_B_A_D_damage(this.damageA.hurt(this.damageB.Getattack))
            this.beforeTheAttackhookHero({my:this.damageA,attack_target:"塔",target:this.damageB}) && this.Set_A_B_D_damage(this.damageB.hurt(this.damageA.Getattack))
        })
    }

    /** 当damageB target为空时将以塔为目标  */
    attacklement(){
        if(!(this.damageB instanceof Card)){
            print("执行了攻击塔")
            CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTACK",{uuid:this.damageA.UUID})
            Timers.CreateTimer(1.5,()=>{
               const tower = GameRules.TowerGeneralControl.getCardScenceTower(PlayerResource.GetPlayer(this.damageA.PlayerID),this.damageA) as Tower
               tower.hurt(this.damageA.Getattack)
            })
        }else{
            this.settlement()
        }
    }

    spell_skill_settlement(damage_count:number){       
        print("激活---------------------------------------------") 
        CustomGameEventManager.Send_ServerToAllClients("S2C_HURT_DAMAGE",{particle:"particles/econ/items/shadow_fiend/sf_desolation/sf_rze_dso_scratch.vpcf",uuid:this.damageB.UUID})
        Timers.CreateTimer(1.5,()=>{
            this.damageB.hurt(damage_count)
        })
    }
}