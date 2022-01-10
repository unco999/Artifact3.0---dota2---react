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

    upper(hero:Hero){
        this.hero = hero;
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
