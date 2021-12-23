import { Unit } from "./Unit";
import { Timers } from "../lib/timers";
import { LinkedList } from "../structure/Linkedlist";
import { CardParameter } from "./Card";
import { Equip, EquipContainer, HOOK } from "./Equip";
import { Hand, ICAScene } from "./Scenes";

export class Hero extends Unit{

    HasAbilities:string[] // 单位拥有的技能字符串
    Equips:Record<number,Equip> = {}

    constructor(CardParameter:CardParameter,Scene:ICAScene){
        super(CardParameter,Scene,'Hero');
        this.unit_register_gameevent()
    }

    find_Equip(name:string){
        for(const equip in this.Equips){
            if(this.Equips[equip].name == name){
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
            this.Equips[event.index] = EquipContainer.instance.GetEquit(event.item)
            CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_UP_EQUIMENT_SHOW",{uuid:this.UUID,index:event.index,item:event.item})
            for(const euqip in this.Equips){
                this.Equips[euqip].call_hook(HOOK.装备物品及时生效)
            }
            print("新物品已装备成功")
        })
        CustomGameEventManager.RegisterListener("C2S_GET_EQUIP",(_,event)=>{
            if(event.uuid != this.UUID) return;
            const table = {}
            const equips = this.Equips
            for(const equip in equips){
                table[equip] = equips[equip].name
            }
            CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(this.PlayerID),"S2C_SEND_EQUIP",{data:table,uuid:this.UUID})
        })
    }

    GetEquipModifiler<T>(hook:HOOK){
        const table:Array<(T:T)=>boolean> = []
        for(const equip in this.Equips){
            table.push(...this.Equips[equip].call_hook(hook))
        }
        return table
    }

    override call_death(){
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_DEATH_ANIMATION",{uuid:this.UUID})
        Timers.CreateTimer(1.5,()=>{
            this.Scene.CaSceneManager.change_secens(this.UUID,"Grave",-1)
        })
    }

    isHasAbility(abilityname:string){
       return this.HasAbilities.includes(abilityname)
    }

    ToData() {
        return ""
    }

}