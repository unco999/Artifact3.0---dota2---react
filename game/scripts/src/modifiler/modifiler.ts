import { damage } from "../feature/damage";
import { Hero } from "../instance/Hero";
import { CAModifiler, ca_register_modifiler, HOOK, ModifilerContainer, modifilertype } from "../instance/Modifiler";
import { BattleArea } from "../instance/Scenes";
import { Unit } from "../instance/Unit";
import { Timers } from "../lib/timers";

/**狂战斧 */
@ca_register_modifiler()
export class item_bfury_modifiler extends CAModifiler {
    name: string = "item_bfury_modifiler";
    modifilertype: modifilertype = modifilertype.原始;
    duration: number = -1;
    debuff: boolean = false;

    constructor() {
        super("item_bfury_modifiler");
        print("创造了装备的modifiler");
    }

    constructorinstance = item_bfury_modifiler;

    register_hook_event() {
        this.setHookEvent(HOOK.销毁时, () => {
            this.logoutHook();
            return true;
        });
        this.setHookEvent(HOOK.攻击前, () => {
            print("狂战斧生效了");
            if (this.thisHero.isunableToAttack()) return true;
            const { left, center, right } = GameRules.SceneManager.enemyneighbor(this.thisHero);
            if (!center) {
                const tower = GameRules.TowerGeneralControl.getCardScenceTower(PlayerResource.GetPlayer(this.thisHero.PlayerID), this.thisHero);
                tower.hurt(this.thisHero.Getattack);
                return true;
            }
            if (center && typeof (center) != "number") {
                center.hurt(this.thisHero.Getattack, this.thisHero, "default");
                CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT", { uuid: center.UUID, lookAt: "0 0 0", paticle: "particles/econ/items/ursa/ursa_swift_claw/ursa_swift_claw_right.vpcf", cameraOrigin: "0 500 0" });
            }
            if (left && typeof (left) != "number") {
                left.hurt(3, this.thisHero, "default");
                CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT", { uuid: left.UUID, lookAt: "0 0 0", paticle: "particles/econ/items/ursa/ursa_swift_claw/ursa_swift_claw_right.vpcf", cameraOrigin: "0 500 0" });
            }
            if (right && typeof (right) != "number") {
                right.hurt(3, this.thisHero, "default");
                CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT", { uuid: right.UUID, lookAt: "0 0 0", paticle: "particles/econ/items/ursa/ursa_swift_claw/ursa_swift_claw_right.vpcf", cameraOrigin: "0 500 0" });
            }
            return true;
        });
    }


    get influenceMaxheal(): any {
        return 0;
    }

    get influenceAttack(): any {
        return 3;
    }

    get influenceArrmor(): any {
        return 0;
    }

    get influenceheal(): any {
        return 0;
    }

}

/**
 * 免死甲
 */
@ca_register_modifiler()
export class item_force_field_modifiler extends CAModifiler {
    name: string = "item_force_field_modifiler";
    modifilertype: modifilertype = modifilertype.原始;
    duration: number = -1;
    debuff: boolean = false;

    constructor() {
        super("item_force_field_modifiler");
        print("创造了装备的modifiler");
    }

    constructorinstance = item_force_field_modifiler;

    register_hook_event() {
        this.setHookEvent(HOOK.创造时, () => {
            this.thisHero.max_heal += 3
            this.thisHero.heal += 3
            this.thisHero.updateAttribute()
            return true
        })
        this.setHookEvent(HOOK.死亡后, (thishero: Hero, source: Unit) => {
            print("触动了免死金牌");
            if (thishero) {
                thishero.heal = 1;
                thishero.updateAttribute();
            }
            CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT", { uuid: thishero.UUID, paticle: "particles/units/heroes/hero_fairy/fairy_revive.vpcf", cameraOrigin: '0 300 0', lookAt: '0 0 0' });
            this.logoutHook();
            return true;
        });
    }


    get influenceMaxheal(): any {
        return 3;
    }

    get influenceAttack(): any {
        return 0;
    }

    get influenceArrmor(): any {
        return 0;
    }

    get influenceheal(): any {
        return 3;
    }

}

/**
 * 复活甲
 */
@ca_register_modifiler()
export class item_aegis_modifiler extends CAModifiler {
    name: string = "item_aegis_modifiler";
    modifilertype: modifilertype = modifilertype.原始;
    duration: number = -1;
    debuff: boolean = false;
    preDeathIndex: number; //死亡前的序号
    preDeathBrach: string; //死亡前的场景名字

    constructor() {
        super("item_aegis_modifiler");
        print("创造了装备的modifiler");
    }

    constructorinstance = item_aegis_modifiler;

    register_hook_event() {
        this.setHookEvent(HOOK.死亡前, (thishero: Hero, source: Unit) => {
            print("记录了单位死亡的数据");
            let index = thishero.Index;
            let SceneName = thishero.Scene.SceneName;
            this.preDeathIndex = index;
            this.preDeathBrach = SceneName;
            return true;
        });
        this.setHookEvent(HOOK.死亡后, (thishero: Hero, source: Unit) => {
            print("触发了死亡后特效");
            Timers.CreateTimer(2, () => {
                thishero.heal = this.thisHero.max_heal;
                CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTRIBUTE", thishero.attribute);
                GameRules.SceneManager.change_secens(thishero.UUID, this.preDeathBrach, this.preDeathIndex, false);
                CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT", { uuid: thishero.UUID, paticle: "particles/econ/items/wraith_king/wraith_king_arcana/wk_arc_reincarn_tombstone_ring_flames.vpcf", cameraOrigin: "0 400 0", lookAt: "0 0 0" });
                this.logoutHook();
            });
            return false;
        });
    }


    get influenceMaxheal(): any {
        return 0;
    }

    get influenceAttack(): any {
        return 0;
    }

    get influenceArrmor(): any {
        return 1;
    }

    get influenceheal(): any {
        return 0;
    }

}




/**
 * 严寒灼烧
 */
@ca_register_modifiler()
export class abyssal_underlord_pit_of_malice_modifiler extends CAModifiler {
    name: string = "abyssal_underlord_pit_of_malice_modifiler";
    modifilertype: modifilertype = modifilertype.原始;
    duration: number = 1;
    debuff: boolean = false;
    preDeathIndex: number; //死亡前的序号
    preDeathBrach: string; //死亡前的场景名字

    constructor() {
        super("abyssal_underlord_pit_of_malice_modifiler");
        print("创造了装备的modifiler");
    }

    constructorinstance = abyssal_underlord_pit_of_malice_modifiler;

    register_hook_event() {
        this.setHookEvent(HOOK.死亡后, () => {
            this.thisHero.removeModifiler(this.name);
            return true;
        });
    }


    get influenceMaxheal(): any {
        return 0;
    }

    get influenceAttack(): any {
        return 5;
    }

    get influenceArrmor(): any {
        return 0;
    }

    get influenceheal(): any {
        return 0;
    }

}


/**
* 通用1回合沉默modifiler
*/
@ca_register_modifiler()
export class silence_modifiler extends CAModifiler {
    name: string = "silence_modifiler";
    modifilertype: modifilertype = modifilertype.沉默;
    duration: number = 1;
    debuff: boolean = true;

    constructor() {
        super("silence_modifiler");
    }

    constructorinstance = silence_modifiler;

    register_hook_event() {
        this.setHookEvent(HOOK.死亡后, () => {
            this.thisHero.removeModifiler(this.name);
            return true;
        });
    }


    get influenceMaxheal(): any {
        return 0;
    }

    get influenceAttack(): any {
        return 0;
    }

    get influenceArrmor(): any {
        return 0;
    }

    get influenceheal(): any {
        return 0;
    }

}



/**
* 冰霜漩涡减少2点护甲
*/
@ca_register_modifiler()
export class bingshuangxunwo_modifiler extends CAModifiler {
    name: string = "bingshuangxunwo_modifiler";
    duration: number = 1;
    debuff: boolean = true;
    modifilertype: modifilertype = modifilertype.原始;
    constructor() {
        super("bingshuangxunwo_modifiler");
    }

    constructorinstance = bingshuangxunwo_modifiler;

    register_hook_event() {
        this.setHookEvent(HOOK.死亡后, () => {
            this.thisHero.removeModifiler(this.name);
            return true;
        });
    }


    get influenceMaxheal(): any {
        return 0;
    }

    get influenceAttack(): any {
        return 0;
    }

    get influenceArrmor(): any {
        return -2;
    }

    get influenceheal(): any {
        return 0;
    }

}



/**
* 暗灭 攻击前忽视目标护甲
*/
@ca_register_modifiler()
export class item_desolator_modifiler extends CAModifiler {
    name: string = "item_desolator_modifiler";
    duration: number = -1;
    debuff: boolean = true;
    modifilertype: modifilertype = modifilertype.原始;

    constructor() {
        super("item_desolator_modifiler");
    }

    constructorinstance = item_desolator_modifiler;

    register_hook_event() {
        this.setHookEvent(HOOK.攻击前, ({ my, target }: { my: Unit, target: Unit; }) => {
            target.hurt(my.Getattack, target, 'default', () => {
                target.heal -= my.Getattack;
            });
            return true;
        });
    }


    get influenceMaxheal(): any {
        return 0;
    }

    get influenceAttack(): any {
        return 3;
    }

    get influenceArrmor(): any {
        return 0;
    }

    get influenceheal(): any {
        return 0;
    }

}



/**
* 辉耀
*/
@ca_register_modifiler()
export class item_radiance_modifiler extends CAModifiler {
    name: string = "item_radiance_modifiler";
    duration: number = -1;
    debuff: boolean = true;
    modifilertype: modifilertype = modifilertype.原始;

    constructor() {
        super("item_radiance_modifiler");
    }

    constructorinstance = item_radiance_modifiler;

    register_hook_event() {
        this.setHookEvent(HOOK.创造时, () => {
            this.thisHero.max_heal += 1
            this.thisHero.heal += 1
            this.thisHero.updateAttribute()
            return true
        })
        this.setHookEvent(HOOK.回合结束时, (my: Unit) => {
            const cards = GameRules.SceneManager.enemyneighbor(my);
            for (const key in cards) {
                if (typeof(cards[key]) == 'number') continue;
                const _damage = new damage(my, cards[key] as Unit);
                _damage.spell_skill_settlement(2, my, 'purely', "particles/econ/events/spring_2021/radiance_owner_spring_2021.vpcf");
            }
            return true;
        });
    }


    get influenceMaxheal(): any {
        return 1;
    }

    get influenceAttack(): any {
        return 1;
    }

    get influenceArrmor(): any {
        return 1;
    }

    get influenceheal(): any {
        return 1;
    }

}

/**
* 西瓦的守护
*/
@ca_register_modifiler()
export class item_shivas_guard_modifiler extends CAModifiler {
    name: string = "item_shivas_guard_modifiler";
    duration: number = -1;
    debuff: boolean = true;
    modifilertype: modifilertype = modifilertype.原始;

    constructor() {
        super("item_shivas_guard_modifiler");
    }

    constructorinstance = item_shivas_guard_modifiler;

    register_hook_event() {
        this.setHookEvent(HOOK.创造时, () => {
            print("触发了西瓦的守护")
            const left = this.thisHero.Find_left_Card();
            const right = this.thisHero.Find_right_Card();
            if (left) {
                left.addmodifiler(ModifilerContainer.instance.Get_prototype_modifiler("item_shivas_guard_buff_modifiler"));
            }
            if (right) {
                right.addmodifiler(ModifilerContainer.instance.Get_prototype_modifiler("item_shivas_guard_buff_modifiler"));
            }
            return true
        })
        this.setHookEvent(HOOK.光环, (hero: Unit) => {
            const left = hero.Find_left_Card();
            const right = hero.Find_right_Card();
            if (left) {
                left.addmodifiler(ModifilerContainer.instance.Get_prototype_modifiler("item_shivas_guard_buff_modifiler"));
            }
            if (right) {
                right.addmodifiler(ModifilerContainer.instance.Get_prototype_modifiler("item_shivas_guard_buff_modifiler"));
            }
            return true;
        });
        this.setHookEvent(HOOK.位移前触发, (hero: Unit) => {
            const left = hero.Find_left_Card();
            const right = hero.Find_right_Card();
            if (left && left.hasMoidifler("item_shivas_guard_buff_modifiler")) {
                left.removeModifiler("item_shivas_guard_buff_modifiler")
            }
            if (right && right.hasMoidifler("item_shivas_guard_buff_modifiler")) {
                right.removeModifiler("item_shivas_guard_buff_modifiler")
            }
            return true;
        });
        this.setHookEvent(HOOK.死亡后, (hero: Unit) => {
            const left = hero.Find_left_Card();
            const right = hero.Find_right_Card();
            if (left && left.hasMoidifler("item_shivas_guard_buff_modifiler")) {
                left.removeModifiler("item_shivas_guard_buff_modifiler")
            }
            if (right && right.hasMoidifler("item_shivas_guard_buff_modifiler")) {
                right.removeModifiler("item_shivas_guard_buff_modifiler")
            }
            return true;
        });
        this.setHookEvent(HOOK.位移后触发, (hero: Unit) => {
            const left = hero.Find_left_Card();
            const right = hero.Find_right_Card();
            if (left) {
                left.addmodifiler(ModifilerContainer.instance.Get_prototype_modifiler("item_shivas_guard_buff_modifiler"));
            }
            if (right) {
                right.addmodifiler(ModifilerContainer.instance.Get_prototype_modifiler("item_shivas_guard_buff_modifiler"));
            }
            return true;
        });
        
    }


    get influenceMaxheal(): any {
        return 0;
    }

    get influenceAttack(): any {
        return 0;
    }

    get influenceArrmor(): any {
        return 2;
    }

    get influenceheal(): any {
        return 0;
    }

}

/**
* 西瓦的守护友方buff
*/
@ca_register_modifiler()
export class item_shivas_guard_buff_modifiler extends CAModifiler {
    name: string = "item_shivas_guard_buff_modifiler";
    duration: number = -1;
    debuff: boolean = false;
    modifilertype: modifilertype = modifilertype.原始;

    constructor() {
        super("item_shivas_guard_buff_modifiler");
    }

    constructorinstance = item_shivas_guard_buff_modifiler;

    register_hook_event() {
        this.setHookEvent(HOOK.位移后触发
            , (hero: Unit) => {
            if(hero.death_state){
                this.thisHero.removeModifiler("item_shivas_guard_buff_modifiler")
            }
            const left = hero.Find_left_Card()
            const right = hero.Find_right_Card()
            if(!left.hasMoidifler("item_shivas_guard_modifiler") || !right.hasMoidifler("item_shivas_guard_modifiler")){
                this.thisHero.removeModifiler("item_shivas_guard_buff_modifiler")
            }
            return true
        });
        this.setHookEvent(HOOK.死亡后, () => {
            this.thisHero.removeModifiler(this.name);
            return true;
        });
    }


    get influenceMaxheal(): any {
        return 0;
    }

    get influenceAttack(): any {
        return 0;
    }

    get influenceArrmor(): any {
        return 1;
    }

    get influenceheal(): any {
        return 0;
    }

}






/**
* 通用1回合缴械modifiler
*/
@ca_register_modifiler()
export class contribute1Round_modifiler extends CAModifiler {
    name: string = "contribute1Round_modifiler";
    modifilertype: modifilertype = modifilertype.缴械;
    duration: number = 1;
    debuff: boolean = true;

    constructor() {
        super("contribute1Round_modifiler");
    }

    constructorinstance = contribute1Round_modifiler;

    register_hook_event() {
        this.setHookEvent(HOOK.攻击前, (thishero: Unit) => {
            return true;
        });
        this.setHookEvent(HOOK.死亡后, () => {
            this.thisHero.removeModifiler(this.name);
            return true;
        });
    }


    get influenceMaxheal(): any {
        return 0;
    }

    get influenceAttack(): any {
        return 0;
    }

    get influenceArrmor(): any {
        return 0;
    }

    get influenceheal(): any {
        return 0;
    }

}



/**
* 通用眩晕1回合modifiler
*/
@ca_register_modifiler()
export class stund1round_modifiler extends CAModifiler {
    name: string = "stund1round_modifiler";
    modifilertype: modifilertype = modifilertype.晕眩;
    duration: number = 1;
    debuff: boolean = true;

    constructor() {
        super("stund1round_modifiler");
    }

    constructorinstance = stund1round_modifiler;

    register_hook_event() {
        this.setHookEvent(HOOK.攻击前, (thishero: Unit) => {
            return true;
        });
        this.setHookEvent(HOOK.死亡后, () => {
            this.thisHero.removeModifiler(this.name);
            return true;
        });
    }


    get influenceMaxheal(): any {
        return 0;
    }

    get influenceAttack(): any {
        return 0;
    }

    get influenceArrmor(): any {
        return 0;
    }

    get influenceheal(): any {
        return 0;
    }

}


/**
 * 限制传送攻击增强
 */
@ca_register_modifiler()
export class ProphetFlight_modifiler extends CAModifiler {
    name: string = "ProphetFlight_modifiler";
    modifilertype: modifilertype = modifilertype.原始;
    duration: number = 1;
    debuff: boolean = true;

    constructor() {
        super("ProphetFlight_modifiler");
    }

    constructorinstance = ProphetFlight_modifiler;

    register_hook_event() {
    }


    get influenceMaxheal(): any {
        return 0;
    }

    get influenceAttack(): any {
        return 2;
    }

    get influenceArrmor(): any {
        return 0;
    }

    get influenceheal(): any {
        return 0;
    }

}


/**
* 通用1回合伤害免疫modifiler
*/
@ca_register_modifiler()
export class shanghaimianyi_modifiler extends CAModifiler {
    name: string = "shanghaimianyi_modifiler";
    modifilertype: modifilertype = modifilertype.原始;
    duration: number = 1;
    debuff: boolean = false;

    constructor() {
        super("shanghaimianyi_modifiler");
    }

    constructorinstance = shanghaimianyi_modifiler;

    register_hook_event() {
        this.setHookEvent(HOOK.被攻击前, (attack_type: "default" | "ability" | "purely", Source: Unit) => {
            print("触发了攻击前特效=====守护天使");
            if (attack_type == 'purely') {
                print("当前攻击为纯粹伤害,无法免伤");
                return false;
            }
            return true;
        });
        this.setHookEvent(HOOK.被技能击中前, (attack_type: "default" | "ability" | "purely", Source: Unit) => {
            print("触发了攻击前特效=====守护天使");
            if (attack_type == 'purely') {
                print("当前攻击为纯粹伤害,无法免伤");
                return false;
            }
            return true;
        });
        this.setHookEvent(HOOK.死亡后, () => {
            this.thisHero.removeModifiler(this.name);
            return true;
        });
    }


    get influenceMaxheal(): any {
        return 0;
    }

    get influenceAttack(): any {
        return 0;
    }

    get influenceArrmor(): any {
        return 0;
    }

    get influenceheal(): any {
        return 0;
    }

}


/**
* 强攻modifiler
*/
@ca_register_modifiler()
export class qianggong_modifiler extends CAModifiler {
    name: string = "qianggong_modifiler";
    modifilertype: modifilertype = modifilertype.原始;
    duration: number = 1;
    debuff: boolean = false;

    constructor() {
        super("qianggong_modifiler");
    }

    constructorinstance = qianggong_modifiler;

    register_hook_event() {
        let _modifiler: string;
        this.setHookEvent(HOOK.创造时, (thishero: Unit) => {
            const bool = thishero.isunableToAttack();
            if (!bool) return false;
            for (const modifiler of thishero.Modifilers) {
                if (modifiler.modifilertype != modifilertype.原始) {
                    _modifiler = modifiler.name;
                }
            }
            thishero.removeModifiler(_modifiler);
            return false;
        });
        this.setHookEvent(HOOK.死亡后, () => {
            this.thisHero.removeModifiler(this.name);
            return true;
        });
    }


    get influenceMaxheal(): any {
        return 0;
    }

    get influenceAttack(): any {
        return 4;
    }

    get influenceArrmor(): any {
        return 0;
    }

    get influenceheal(): any {
        return 0;
    }

}


/**
* 巨浪modifiler
*/
@ca_register_modifiler()
export class julang_modifiler extends CAModifiler {
    name: string = "qianggong_modifiler";
    modifilertype: modifilertype = modifilertype.原始;
    duration: number = 1;
    debuff: boolean = false;

    constructor() {
        super("julang_modifiler");
    }

    constructorinstance = julang_modifiler;

    register_hook_event() {
        this.setHookEvent(HOOK.死亡后, () => {
            this.thisHero.removeModifiler(this.name);
            return true;
        });
    }


    get influenceMaxheal(): any {
        return 0;
    }

    get influenceAttack(): any {
        return 0;
    }

    get influenceArrmor(): any {
        return -2;
    }

    get influenceheal(): any {
        return 0;
    }

}


/**
* 衰老
*/
@ca_register_modifiler()
export class senescence_modifiler extends CAModifiler {
    name: string = "senescence_modifiler";
    modifilertype: modifilertype = modifilertype.虚无;
    duration: number = 1;
    debuff: boolean = true;

    constructor() {
        super("senescence_modifiler");
    }

    constructorinstance = senescence_modifiler;

    register_hook_event() {
        this.setHookEvent(HOOK.被技能击中后, (damage: number, hero: Hero, target: Unit) => {
            print("触发了被技能击中后的hook");
            this.thisHero.hurt(damage, target, 'purely');
            return true;
        });
        this.setHookEvent(HOOK.被攻击前, () => {
            return true;
        });
    }


    get influenceMaxheal(): any {
        return 0;
    }

    get influenceAttack(): any {
        return 0;
    }

    get influenceArrmor(): any {
        return 0;
    }

    get influenceheal(): any {
        return 0;
    }

}


/**
* 幽灵船modifiler
*/
@ca_register_modifiler()
export class youlingchuan_modifiler extends CAModifiler {
    name: string = "youlingchuan_modifiler";
    modifilertype: modifilertype = modifilertype.原始;
    duration: number = 1;
    debuff: boolean = false;

    constructor() {
        super("youlingchuan_modifiler");
    }

    constructorinstance = youlingchuan_modifiler;

    register_hook_event() {
        this.setHookEvent(HOOK.死亡后, () => {
            this.thisHero.removeModifiler(this.name);
            return true;
        });
    }


    get influenceMaxheal(): any {
        return 0;
    }

    get influenceAttack(): any {
        return 0;
    }

    get influenceArrmor(): any {
        return 2;
    }

    get influenceheal(): any {
        return 0;
    }

}




/**
* 魔晶的modifiler
*/
@ca_register_modifiler()
export class item_aghanims_shard_modifiler extends CAModifiler {
    name: string = "item_aghanims_shard_modifiler";
    modifilertype: modifilertype = modifilertype.原始;
    duration: number = -1;
    debuff: boolean = false;

    constructor() {
        super("item_aghanims_shard_modifiler");
    }

    constructorinstance = item_aghanims_shard_modifiler;

    register_hook_event() {
    }

    get influenceMaxheal(): any {
        return 0;
    }

    get influenceAttack(): any {
        return 0;
    }

    get influenceArrmor(): any {
        return 1;
    }

    get influenceheal(): any {
        return 0;
    }

    get faulty() {
        return 1;
    }
}


/**
* 神杖的modifiler
*/
@ca_register_modifiler()
export class item_ultimate_scepter_modifiler extends CAModifiler {
    name: string = "item_ultimate_scepter_modifiler";
    modifilertype: modifilertype = modifilertype.原始;
    duration: number = -1;
    debuff: boolean = false;

    constructor() {
        super("item_ultimate_scepter_modifiler");
    }

    constructorinstance = item_ultimate_scepter_modifiler;

    register_hook_event() {
        this.setHookEvent(HOOK.创造时, () => {
            this.thisHero.max_heal += 3
            this.thisHero.heal += 3
            this.thisHero.updateAttribute()
            return true
        })
    }

    get influenceMaxheal(): any {
        return 3;
    }

    get influenceAttack(): any {
        return 0;
    }

    get influenceArrmor(): any {
        return 0;
    }

    get influenceheal(): any {
        return 3;
    }

    get faulty() {
        return 1;
    }
}

/**
* 恐鳌之心  战斗回合结束后触发
*/
@ca_register_modifiler()
export class item_heart_modifiler extends CAModifiler{
    name: string = "item_heart_modifiler";
    modifilertype: modifilertype = modifilertype.原始;
    duration: number = -1;
    debuff: boolean = false;

    constructor() {
        super("item_heart_modifiler");
    }

    constructorinstance = item_heart_modifiler;

    register_hook_event() {
        this.setHookEvent(HOOK.创造时, () => {
            this.thisHero.max_heal += 4
            this.thisHero.heal += 4
            this.thisHero.updateAttribute()
            return true
        })
        this.setHookEvent(HOOK.回合结束时, () => {
            this.thisHero.cure(2,this.thisHero)
            return true
        })
    }

    get influenceMaxheal(): any {
        return 4;
    }

    get influenceAttack(): any {
        return 0;
    }

    get influenceArrmor(): any {
        return 0;
    }

    get influenceheal(): any {
        return 4;
    }

    get faulty() {
        return 1;
    }
}

/**
* 金箍棒释放技能后增加攻击
*/
@ca_register_modifiler()
export class item_monkey_king_bar_modifiler extends CAModifiler{
    name: string = "item_monkey_king_bar_modifiler";
    modifilertype: modifilertype = modifilertype.原始;
    duration: number = -1;
    debuff: boolean = false;
    superimposedAttack:number = 0

    constructor() {
        super("item_monkey_king_bar_modifiler");
    }

    constructorinstance = item_monkey_king_bar_modifiler;

    register_hook_event() {
        this.setHookEvent(HOOK.释放技能前, () => {
            print("增加了攻击")
            this.superimposedAttack += 3
            this.thisHero.updateAttribute()
            return true
        })
        this.setHookEvent(HOOK.回合结束时, () => {
            this.superimposedAttack = 0
            this.thisHero.updateAttribute()
            return true
        })
        this.setHookEvent(HOOK.死亡后, () => {
            this.superimposedAttack = 0
            this.thisHero.updateAttribute()
            return true
        })
    }

    get influenceMaxheal(): any {
        return 4;
    }

    get influenceAttack(): any {
        return 3 + this.superimposedAttack;
    }

    get influenceArrmor(): any {
        return 0;
    }

    get influenceheal(): any {
        return 0;
    }

    get faulty() {
        return 1;
    }
}

