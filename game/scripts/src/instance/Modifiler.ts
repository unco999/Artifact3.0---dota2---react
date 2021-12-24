import { Hero } from "./Hero";

export enum modifilertype {
    "沉默" = 1,
    "冻结" = 3,
    "无" = 0,
}



export abstract class CAModifiler{
    abstract name:string
    abstract modifilertype:modifilertype
    abstract duration:number //持续回合数
    abstract debuff:boolean //属于负增益吗?
    abstract thisHero:Hero

    abstract EntryExecution();

    abstract roundExecution();

    abstract roundExitExecution();

    abstract get influenceMaxheal();

    abstract get influenceAttack();

    abstract get influenceArrmor();

    abstract get influenceheal();
}
