import { Hero } from "../instance/Hero";
import { CAModifiler, HOOK, modifilertype } from "../instance/Modifiler";

export class item_robe_modifiler extends CAModifiler{
    name: string = "item_robe_modifiler";
    modifilertype: modifilertype = modifilertype.无;
    duration: number = -1;
    debuff: boolean = false;

    constructor(){
        super(HOOK.创造时,"item_robe_modifiler")
        print("创造了装备的modifiler")
    }

    constructorinstance = item_robe_modifiler

    register_hook_event() {
        this.setHookEvent(HOOK.创造时,()=>{
            this.thisHero.max_heal += this.influenceMaxheal
            this.thisHero.heal = this.thisHero.max_heal
            return false})
        this.setHookEvent(HOOK.销毁时,()=>{
            this.thisHero.max_heal -= this.influenceMaxheal
            if(this.thisHero.heal > this.thisHero.max_heal){
                this.thisHero.heal = this.thisHero.max_heal
            }
            return false
        })
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
