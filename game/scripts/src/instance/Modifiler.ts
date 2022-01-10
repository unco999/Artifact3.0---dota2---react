import { Card } from "./Card";
import { Hero } from "./Hero";
import { Tower } from "./Tower";

export enum modifilertype {
    "沉默" = 1,
    "冻结" = 3,
    "无" = 0,
}

export function ca_register_modifiler() {
    return function(constructor:any){
        const ability = new constructor() as CAModifiler
        ModifilerContainer.instance.register(ability)
    }
}

/**春哥甲modifier */
export class ModifilerContainer{
    Container:Record<string,CAModifiler> = {}
    private static _instance:ModifilerContainer
    static get instance(){
        if(!this._instance){
            this._instance = new ModifilerContainer()
            return this._instance
        }
        return this._instance
    }

    register(CAModifiler:CAModifiler){
        this.Container[CAModifiler.id] = CAModifiler
    }

    Get_prototype_modifiler(id:string){
        return this.Container[id].clone()
    }

}


export enum HOOK{
    原始 = 294912,
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
    创造时 = 0x00004000,
    销毁时 = 0x00008000,
    装备时 = 0x00010000,
}


export type hookfuc = (...args:any[])=>boolean

export type attack_target = "英雄" | "小兵" | "塔"
export type U3D = {attack:number,arrmor:number,heal:number}


export type hook_parameter = {
    [HOOK.攻击前]:{my:Card,target:Card|Tower}
    [HOOK.攻击后]:{my:Card,damage_target/**造成伤害的目标 */:Card|Tower,causeSomeDamages/**造成的伤害值 */:number}
    [HOOK.创造时]:{my:Hero}
}


export abstract class CAModifiler{
    name:string
    modifilertype:modifilertype
    duration:number //持续回合数
    debuff:boolean //属于负增益吗?
    thisHero:Hero
    id:string
    hook:number
    hookEvent:Record<number,hookfuc[]> = {}
    abstract constructorinstance

    constructor(hook:number,id:string){
        this.hook = hook
        this.id = id
        this.register_hook_event()
        /**测试时填写 */
    }


    clone(){
        return new this.constructorinstance()
    }

    abstract register_hook_event();

    setHookEvent(hook:HOOK,cb:hookfuc){
        if(this.hookEvent[hook] == null){
            this.hookEvent[hook] = []
        }
        this.hookEvent[hook].push(cb)
    }

    call_hook(hook:HOOK){
        const table = []
        if(bit.bor(this.hook,hook) == this.hook){
            this.hookEvent[hook] && this.hookEvent[hook].forEach(fuc=>{
                table.push(fuc)
            })
        }
        return table
    }
    
    abstract get influenceMaxheal();

    abstract get influenceAttack();

    abstract get influenceArrmor();

    abstract get influenceheal();
}
