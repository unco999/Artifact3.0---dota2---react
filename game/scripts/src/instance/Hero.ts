import { Unit } from "./Unit";
import { Timers } from "../lib/timers";
import { LinkedList } from "../structure/Linkedlist";
import { Card, CardParameter } from "./Card";
import { Equip, EquipContainer } from "./Equip";
import { Hand, ICAScene } from "./Scenes";
import { HOOK } from "./Modifiler";

export class Hero extends Unit{

    HasAbilities:string[] // 单位拥有的技能字符串
    Equips:Record<number,Equip> = {}

    constructor(CardParameter:CardParameter,Scene:ICAScene){
        super(CardParameter,Scene,'Hero');
        this.unit_register_gameevent()
    }

    find_Equip(id:string){
        for(const equip in this.Equips){
            if(this.Equips[equip].id == id){
                return equip
            }
        }
        return null
    }

    unit_register_gameevent(){
        CustomGameEventManager.RegisterListener("C2S_SEND_up_equiment",(_,event)=>{
            if(event.uuid != this.UUID) return;
            if(this.find_Equip(event.item)) { CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(this.PlayerID),"S2C_INFORMATION",{information:"你不能装备唯一的物品!"});return}
            if(!(GameRules.SceneManager.GetHandsScene(this.PlayerID) as Hand).find_id_and_remove(event.item)) return;
            if(this.Equips[event.index]){
                const EquipModifilerName = this.Equips[event.index].id + "_modifiler"
                this.removeModifiler(EquipModifilerName)
            }
            const equip = EquipContainer.instance.GetEquit(event.item)
            equip.upper(this)
            CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_UP_EQUIMENT_SHOW",{uuid:this.UUID,index:event.index,item:event.item})
            print("新物品已装备成功")
        })
        CustomGameEventManager.RegisterListener("C2S_GET_EQUIP",(_,event)=>{
            if(event.uuid != this.UUID) return;
            const table = {}
            const equips = this.Equips
            for(const equip in equips){
                table[equip] = equips[equip].id
            }
            CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(this.PlayerID),"S2C_SEND_EQUIP",{data:table,uuid:this.UUID})
        })
    }

    call_death(source:Card){
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_DEATH_ANIMATION",{uuid:this.UUID})
        Timers.CreateTimer(1.5,()=>{
            super.call_death(source)
        })
    }

    isHasAbility(abilityname:string){
       return this.HasAbilities.includes(abilityname)
    }

    ToData() {
        return ""
    }

}