import { ca_register_equip, Equip } from "../instance/Equip";

@ca_register_equip()
export class item_bfury extends Equip{
    containerInstance =  item_bfury
    id = this.constructor.name
    constructor(){
        super()
        print("创造装备实例成功",this.id)
    }
}

@ca_register_equip()
export class item_aegis extends Equip{
    containerInstance =  item_aegis
    id = this.constructor.name
    constructor(){
        super()
        print("创造装备实例成功",this.id)
    }
}


@ca_register_equip()
export class item_ultimate_scepter extends Equip{
    containerInstance =  item_ultimate_scepter
    id = this.constructor.name
    constructor(){
        super()
        print("创造装备实例成功",this.id)
    }
}


@ca_register_equip()
export class item_aghanims_shard extends Equip{
    containerInstance =  item_aghanims_shard
    id = this.constructor.name
    constructor(){
        super()
        print("创造装备实例成功",this.id)
    }
}

@ca_register_equip()
export class item_force_field extends Equip{
    containerInstance =  item_force_field
    id = this.constructor.name
    constructor(){
        super()
        print("创造装备实例成功",this.id)
    }
}

