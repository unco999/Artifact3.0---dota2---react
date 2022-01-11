import { Card, CardParameter } from "./Card";
import { ICAScene } from "./Scenes";
import { Tower } from "./Tower";
import { Unit } from "./Unit";
import { Hero } from "./Hero";
import { item_bfury_modifiler } from "../modifiler/testmodifiler";
import { CAModifiler, ModifilerContainer } from "./Modifiler";

export function ca_register_equip() {
    return function(constructor:any){
        const ability = new constructor() as Equip
        EquipContainer.instance.register(ability)
    }
}

/**装备容器 */
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



export abstract class Equip{
    hero:Hero
    id:string
    modifiler:CAModifiler
    abstract containerInstance:any

    upper(hero:Hero){
        this.hero = hero;
        this.modifiler = ModifilerContainer.instance.Get_prototype_modifiler(this.id + "_modifiler")
        this.hero.addmodifiler(this.modifiler)
        print("装备英雄为",this.hero,"创造modifiler为",this.modifiler.name)
    }

    unload(hero:Hero){
        this.hero.removeModifiler(this.modifiler.name)
    }

    clone(){
        return this.containerInstance
    }
}

@ca_register_equip()
export class item_bfury extends Equip{
    containerInstance =  item_bfury
    id = this.constructor.name
    constructor(){
        super()
        print("创造装备实例成功",this,this.id)
    }
}

export class EquipCard extends Card{
    equip:Equip

    constructor(CardParameter:CardParameter,Scene:ICAScene){
        super(CardParameter,Scene,"EQUIP")
        this.equip = EquipContainer.instance.GetEquit(CardParameter.Id).clone()
        print("初始化手牌装备卡成功")
    }

    override ToData() {
        print("返回了todata的值得",this.Id)
        return this.Id
    }
}
