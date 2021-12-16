import { Card } from "../instance/Card";
import { Tower } from "../instance/Tower";
import { Unit } from "../instance/Unit";
import { Timers } from "../lib/timers";

export class damage{
    damageA:Unit
    damageB:Unit

    constructor(damageA:Unit,damageB?:Unit){
        this.damageA = damageA
        this.damageB = damageB
    }

    settlement(){
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTACK",{uuid:this.damageA.UUID})
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTACK",{uuid:this.damageB.UUID})
        Timers.CreateTimer(1.5,()=>{
            this.damageA.hurt(this.damageB.Getattack)
            print(this.damageB.UUID,"攻击了",this.damageA.UUID)
            this.damageB.hurt(this.damageA.Getattack)
            print(this.damageA.UUID,"攻击了",this.damageB.UUID)
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