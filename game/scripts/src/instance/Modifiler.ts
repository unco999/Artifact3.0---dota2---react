export enum modifilertype {
    "沉默" = 1,
    "冻结" = 3,
}



export class CAModifiler{
    name:string
    modifilertype:modifilertype
    duration:number //持续回合数
    debuff:boolean //属于负增益吗?

    constructor(name:string,modifilertype:modifilertype,duration:number,debuff:boolean){
        this.name = name
        this.modifilertype = modifilertype
        this,duration = duration
    }

    get influenceAttack(){
        return 1
    }

    get influenceArrmor(){
        return 1
    }

    get influenceheal(){
        return 1
    }
}