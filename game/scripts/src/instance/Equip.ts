import { Card, CardParameter } from "./Card";
import { ICAScene } from "./Scenes";
import { Unit } from "./Unit";

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

export abstract class Equip{
    unit:Unit|undefined
    id:string
    hook:number
    hookEvent:Record<number,Function[]> = {}
    name:string

    constructor(hook:number,id:string){
        this.hook = hook
        this.id = id
        /**测试时填写 */
        this.name = 'item_robe'
        this.register_hool()
    }

    abstract register_hool();

    call_hook(hook:HOOK){
        if(bit.bor(this.hook,hook) == this.hook){
            this.hookEvent[hook] && this.hookEvent[hook].forEach(fuc=>{
                fuc()
            })
        }
    }
    
}

export class EquipCard extends Card{
    equip:Equip

    constructor(CardParameter:CardParameter,Scene:ICAScene){
        super(CardParameter,Scene)
        this.equip = EquipContainer.instance.GetEquit(CardParameter.Id)
        this.type = "EQUIP"
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
            HOOK.原始 | HOOK.死亡前 | HOOK.死亡后,"item_robe"
        )
    }

    register_hool() {
        this.hookEvent[HOOK.死亡前] = [this.deathPreAction]
        this.hookEvent[HOOK.死亡后] = [this.deathPostAction]
        this.hookEvent[HOOK.装备物品及时生效] = [this.create]
    }

    /**装备及时生效 */
    create(){
        print("装备三维已经增加")
    }

    deathPreAction(){
        print("死亡前我播放了特效")
    }

    deathPostAction(){
        print("死亡后我实现了复活")
    }

}
