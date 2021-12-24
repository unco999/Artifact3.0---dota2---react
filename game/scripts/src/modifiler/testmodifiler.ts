import { Hero } from "../instance/Hero";
import { CAModifiler, modifilertype } from "../instance/Modifiler";

/**春哥甲modifier */
export class item_robe_modifiler extends CAModifiler{
    name: string = "item_robe_modifiler";
    modifilertype: modifilertype = modifilertype.无;
    duration: number = -1;
    debuff: boolean = false;
    thisHero: Hero ;

    constructor(Hero:Hero){
        super()
        this.thisHero = Hero
        print("创造了装备的modifiler")
    }

    roundExecution() {
    }

    EntryExecution(){
        this.thisHero.max_heal += this.influenceMaxheal
        this.thisHero.heal = this.thisHero.max_heal
    }

    roundExitExecution(){
        this.thisHero.max_heal -= this.influenceMaxheal
        if(this.thisHero.heal > this.thisHero.max_heal){
            this.thisHero.heal = this.thisHero.max_heal
        }
    }

    get influenceMaxheal(): any {
        return 55
    }

    get influenceAttack(): any {
        return 55
    }

    get influenceArrmor(): any {
        return 55
    }
    
    get influenceheal(): any {
        return 55
    }

}
