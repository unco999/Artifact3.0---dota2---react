import { Unit } from "../instance/Unit";

export class damage{
    damageA:Unit
    damageB:Unit

    constructor(damageA:Unit,damageB:Unit){
        this.damageA = damageA
        this.damageB = damageB
    }

    settlement(){
        this.damageA.hurt(this.damageB.Getattack)
        this.damageB.hurt(this.damageA.Getattack)
        print("执行了伤害")
    }
}