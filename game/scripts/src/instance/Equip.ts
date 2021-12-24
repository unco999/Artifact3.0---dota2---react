import { Card, CardParameter } from "./Card";
import { ICAScene } from "./Scenes";
import { Tower } from "./Tower";
import { Unit } from "./Unit";
import { Hero } from "./Hero";
import { item_robe_modifiler } from "../modifiler/testmodifiler";

export function ca_register_equip() {
    return function(constructor:any){
        const ability = new constructor() as Equip
        EquipContainer.instance.register(ability)
    }
}

/**技能容器 */
export class EquipContainer{
    Container:Record<string,Equip> = {}
    private static _instance:EquipContainer
    static get instance(){
        if(!this._instance){
            this._instance = new EquipContainer()
            return this._instance
        }
        return this._instance
    }

    register(Equip:Equip){
        this.Container[Equip.id] = Equip 
    }

    GetEquit(id:string){
        return this.Container[id]
    }

}

export enum HOOK{
    原始 = 16384,
    攻击前 = 0x00000001,
    攻击后 = 0x00000002,
    回复前 = 0x00000004,
    回复后 = 0x00000008,
    死亡前 = 0x00000010,
    死亡后 = 0x00000020,
    上场前 = 0x00000040,
    上场后 = 0x00000080,
    被攻击前 = 0x00000100,
    被攻击后 = 0x00000200,
    被技能击中前 = 0x00000400,
    被技能击中后 = 0x00000800,
    释放技能前 = 0x00001000,
    释放技能后 = 0x00002000,
    装备物品及时生效 = 0x00004000,
}

export type attack_target = "英雄" | "小兵" | "塔"
export type U3D = {attack:number,arrmor:number,heal:number}


export type hook_parameter = {
    [HOOK.攻击前]:{my:Card,target:Card|Tower}
    [HOOK.攻击后]:{my:Card,damage_target/**造成伤害的目标 */:Card|Tower,causeSomeDamages/**造成的伤害值 */:number}
    [HOOK.装备物品及时生效]:{my:Hero}
}


export type hookfuc = (...args:any[])=>boolean

export abstract class Equip{
    unit:Unit|undefined
    id:string
    hook:number
    hookEvent:Record<number,hookfuc[]> = {}

    constructor(hook:number,id:string){
        this.hook = hook
        this.id = id
        /**测试时填写 */
        this.register_hool()
    }

    abstract register_hool();

    call_hook(hook:HOOK){
        const table = []
        if(bit.bor(this.hook,hook) == this.hook){
            this.hookEvent[hook] && this.hookEvent[hook].forEach(fuc=>{
                table.push(fuc)
            })
        }
        return table
    }
    
}

export class EquipCard extends Card{
    equip:Equip

    constructor(CardParameter:CardParameter,Scene:ICAScene){
        super(CardParameter,Scene,"EQUIP")
        this.equip = EquipContainer.instance.GetEquit(CardParameter.Id)
    }

    override ToData() {
        print("返回了todata的值得",this.Id)
        return this.Id
    }
}

@ca_register_equip()
export class resurrection extends Equip{

    constructor(){
        super(
            HOOK.原始 | HOOK.装备物品及时生效,"item_robe"
        )
    }

    register_hool() {
        this.hookEvent[HOOK.装备物品及时生效] = [this.create]
    }

    /**装备及时生效 */
    create(hook_parameter:hook_parameter[HOOK.装备物品及时生效]){
        const my = hook_parameter.my
        my.addmodifiler(new item_robe_modifiler(my))
        return false
    }


}

@ca_register_equip()
export class fangTianli extends Equip{

    constructor(){
        super(
            HOOK.原始 | HOOK.攻击前 ,"item_blink"
        )
    }

    register_hool() {
        this.hookEvent[HOOK.攻击前] = [this.preattack]
    }

    /**装备及时生效 */
    preattack(hook_parameter:hook_parameter[HOOK.攻击前]){
        print("装备出触发了攻击前特效")
        const target = hook_parameter.target
        const my = hook_parameter.my as Hero
        if(target.constructor.name == 'Hero' || target.constructor.name == 'Solider')
        {
            const _enemyneighbor = GameRules.SceneManager.enemyneighbor(my as Card);
            (_enemyneighbor.center as Unit).hurt(my.Getattack);
            (_enemyneighbor.left as Unit).hurt(my.Getattack);
            (_enemyneighbor.right as Unit).hurt(my.Getattack);
            CustomGameEventManager.Send_ServerToAllClients('SC2_PLAY_EFFECT',{uuid:(_enemyneighbor.center as Unit).UUID,paticle:"particles/econ/items/sven/sven_ti7_sword/sven_ti7_sword_spell_great_cleave_gods_strength_crit.vpcf",cameraOrigin:"0 500 0",lookAt:"0 0 0"})
            CustomGameEventManager.Send_ServerToAllClients('SC2_PLAY_EFFECT',{uuid:(_enemyneighbor.left as Unit).UUID,paticle:"particles/econ/items/sven/sven_ti7_sword/sven_ti7_sword_spell_great_cleave_gods_strength_crit.vpcf",cameraOrigin:"0 500 0",lookAt:"0 0 0"})
            CustomGameEventManager.Send_ServerToAllClients('SC2_PLAY_EFFECT',{uuid:(_enemyneighbor.right as Unit).UUID,paticle:"particles/econ/items/sven/sven_ti7_sword/sven_ti7_sword_spell_great_cleave_gods_strength_crit.vpcf",cameraOrigin:"0 500 0",lookAt:"0 0 0"})
        }
        return false
    }


}