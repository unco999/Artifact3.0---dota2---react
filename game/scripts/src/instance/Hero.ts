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

    isEquipFull(){
        let count = 0
        for(const key in this.Equips){
            if(this.Equips[key]){
                count++
            }
        }
        return count == 3
    }

    getEquipSpace(){
        const pop = []
        let index = 1
        for(const key in this.Equips){
            pop.push(Number(key))
        }
        if(pop.includes(1) && pop.includes(2)){
            index = 3
        }
        if(pop.includes(3) && pop.includes(1)){
            index = 2
        }
        if(pop.includes(3) && pop.includes(2)){
            index = 1
        }
        if(pop.includes(1) && !pop.includes(2) && !pop.includes(3)){
            index = 2
        }
        return index
    }

    unit_register_gameevent(){
        CustomGameEventManager.RegisterListener("C2S_SEND_up_equiment",(_,event)=>{
            if(event.uuid != this.UUID) return;
            if(this.find_Equip(event.item)) { CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(this.PlayerID),"S2C_INFORMATION",{information:"你不能装备唯一的物品!"});return}
            // if(this.Equips[event.index]){
            //     this.Equips[event.index].unload(this)
            // }
            if(this.isEquipFull()){ 
                CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(this.PlayerID),"S2C_INFORMATION",{information:"装备已满!"})
                return
            }
            if(!(GameRules.SceneManager.GetHandsScene(this.PlayerID) as Hand).find_id_and_remove(event.item)) return;
            const equip = EquipContainer.instance.GetEquit(event.item)
            let index = this.getEquipSpace()
            equip.upper(this,index)
            CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_UP_EQUIMENT_SHOW",{uuid:this.UUID,index:index,item:event.item})
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