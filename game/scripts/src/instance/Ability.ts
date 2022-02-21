import {  damage } from "../feature/damage";
import { Timers } from "../lib/timers";
import { reloadable } from "../lib/tstl-utils";
import { get_current_operate_brach } from "../Manager/nettablefuc";
import { set_settlement_false, set_settlement_true } from "../Manager/statusSwitcher";
import { Card, CardParameter, CARD_TYPE, professionalMagicCard } from "./Card";
import { Hero } from "./Hero";
import { ModifilerContainer } from "./Modifiler";
import { BattleArea, ICAScene, Scenes } from "./Scenes";
import { Tower } from "./Tower";
import { Unit } from "./Unit";


export enum select_type{
    任意单体,
    敌方单体,
    敌方近邻,
    敌方全体,
    全体,
    友方单体,
    友方全体,
    自己,
    敌方对格,
    本路,
    友方本路,
    敌方本路,
    全场任意敌方单体,
}

export enum Magic_brach{
    "本路",
    "跨线",
    "对格"
}

export enum Magic_range{
    "单体",
    "近邻",
    "全体"
}

export enum Magic_team{
    "友方",
    "敌方",
    "双方",
    "自己"
}

export enum Magic_attack_tart_type{
    "小兵" = 1,
    "召唤物" = 2,
    "英雄" = 4,
    "所有" = 1 + 2 + 4
}

export function ca_register_ability() {
    return function(constructor:any){
        const ability = new constructor() as ability_templater
        AbiliyContainer.instance.register(ability)
    }
}
/**技能容器 */
export class AbiliyContainer{
    Container:Record<string,ability_templater> = {}
    private static _instance:AbiliyContainer
    static get instance(){
        if(!this._instance){
            this._instance = new AbiliyContainer()
            return this._instance
        }
        return this._instance
    }

    register(AbilityCard:ability_templater){
        print(AbilityCard.id,"注册装饰器成功")
        this.Container[AbilityCard.id] = AbilityCard 
    }

    GetAbility(abilityName:string){
        print("容器返回实例heroid为",abilityName,this.Container[abilityName] == null)
        return this.Container[abilityName]
    }

}


/**职业魔法卡实例 */
export class AbilityCard extends Card {
    hasHero:string
    abilityInstance:ability_templater

    constructor(CardParameter:CardParameter,Scene:ICAScene,type:CARD_TYPE,hasHero:string){
        super(CardParameter,Scene,type)
        this.hasHero = hasHero
        this.abilityInstance = AbiliyContainer.instance.GetAbility(this.Id)
        print("打印当前魔法卡heroid",this.abilityInstance.heroid)
    }

    GameEventToClientTograve(){
        GameRules.SceneManager.change_secens(this.UUID,"Ability")
        Timers.CreateTimer(3,()=>{
            GameRules.SceneManager.change_secens(this.UUID,"Grave")
        })
    }

    ToData() {
        return {skillSubject:this.hasHero,name:this.abilityInstance.heroid,replacementCard:this.abilityInstance.displacement,vacancyRelease:this.abilityInstance.vacancyRelease}
    }

}

export class TrickSkill extends AbilityCard{

    constructor(CardParameter:CardParameter,Scene:ICAScene,hasHero:string){
        super(CardParameter,Scene,"TrickSkill",hasHero)
    }

    ToData() {
        print("向客户端发送了todata",super.ToData().skillSubject)
        return super.ToData()
    }
} 

export class SmallSkill extends AbilityCard{
    
    constructor(CardParameter:CardParameter,Scene:ICAScene,hasHero:string){
        super(CardParameter,Scene,"SmallSkill",hasHero)
    }

    ToData() {
        return super.ToData()
    }
} 

export function brachFilfer(str:string,playerID:PlayerID){
    print("传入的解析路线是",str)
    switch(str){
        case "1":{
            print("解析为上路")
            return GameRules.SceneManager.GetGoUpScene(playerID)
        }
        case "2":{
            print("解析为中路")
            return GameRules.SceneManager.GetMidwayScene(playerID)
        }
        case "3":{
            print("解析为下路")
            return GameRules.SceneManager.GetLaidDownScene(playerID)
        }
    }
    return null
}



export class ability_templater{
    ability_select_type:select_type = select_type.敌方全体;
    id:string
    consumption:number //消耗水晶
    heroid:string;
    Magic_brach:Magic_brach
    Magic_team:Magic_team
    Magic_range:Magic_range
    Magic_attack_tart_type:Magic_attack_tart_type = Magic_attack_tart_type.所有
    wounded:boolean = false
    /** 全场空格位技能 -1为否  1为本路  2为全场*/
    displacement:number = -1
    /**-1为不可作用域防御塔   1为本路防御塔   2为全局防御塔 */ 
    istypeTower:number = -1 
    skillAnimation:number = 3.5;
    vacancyRelease:boolean = false

    spell_tower(table:(Card|number)[],target?:string,hero?:Unit,tower?:Tower){

    }


    spell_skill(table:(Unit|number)[],target?:string,hero?:Unit,target_index?:number /**空格释放技能 所选择的空格索引 */){
        set_settlement_true()
        Timers.CreateTimer(this.skillAnimation,()=>{
            GameRules.SceneManager.Current_Scnese_Card_Center(true)
            set_settlement_false()
        })
    }

    /**
     * 
     * 位移后效果
     */
    post_move_spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
        print("关闭了特效显示")
        Timers.CreateTimer(this.skillAnimation,()=>{
            GameRules.SceneManager.Current_Scnese_Card_Center(true)
            set_settlement_false()
        })
    }

    constructor(id:string){
        this.id = id
    }
}

/**
 * 雷击
 */
@ca_register_ability()
export class SmallSkill_leiji extends ability_templater{
    ability_select_type: select_type = select_type.敌方单体;
    Magic_brach = Magic_brach.本路
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid="22"
    consumption: number = 3

    constructor(){
        super("SmallSkill_leiji")
    }

    spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        super.spell_skill(table,target,hero)
        const _target = GameRules.SceneManager.get_card(target) as Unit
        const _damage = new damage(hero,_target)
        _damage.spell_skill_settlement(this.damage_calculate(hero),hero)
        const modifiler = ModifilerContainer.instance.Get_prototype_modifiler("stund1round_modifiler")
        _target.addmodifiler(modifiler)
        CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT",{uuid:_target.UUID,paticle:"particles/econ/items/zeus/arcana_chariot/zeus_arcana_kill_remnant.vpcf",cameraOrigin:'0 400 0',lookAt:'0 0 0'})
    }

    /**伤害结算方法 */
    damage_calculate(hero:Unit){
        let damage = 0
        if(hero.Getfaulty == 1){
            damage = 3
        }
        if(hero.Getfaulty == 2){
            damage = 5
        }
        if(hero.Getfaulty == 3){
            damage = 8
        }
        return damage
    }
}

/**
 * 决斗
 */
@ca_register_ability()
export class SmallSkill_juedou extends ability_templater{
    Magic_brach = Magic_brach.本路
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid="104"
    ability_select_type: select_type = select_type.敌方单体;
    consumption: number = 2
    constructor(){
        super("SmallSkill_juedou")
    }

    spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        super.spell_skill(table)
        if(!target || !hero) return
        const _target = GameRules.SceneManager.get_card(target) as Unit
        const _damage = new damage(hero,_target)
        _damage.spell_skill_settlement(hero.Getattack,hero)
        const _mydatama = new damage(_target,hero)
        _mydatama.spell_skill_settlement(_target.Getattack,hero)
        CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT",{uuid:_target.UUID,paticle:"particles/econ/items/legion/legion_weapon_voth_domosh/legion_duel_ring_arcana.vpcf",cameraOrigin:"0 400 0",lookAt:"0 0 0"})
        CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT",{uuid:hero.UUID,paticle:"particles/econ/items/legion/legion_weapon_voth_domosh/legion_duel_ring_arcana.vpcf",cameraOrigin:"0 400 0",lookAt:"0 0 0"})
    }

}


/**
 * 爆头
 */
 @ca_register_ability()
 export class SmallSkill_baotou extends ability_templater{
     Magic_brach = Magic_brach.本路
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.单体
     heroid="35"
     ability_select_type: select_type = select_type.敌方单体;
     consumption: number = 3
     constructor(){
         super("SmallSkill_baotou")
     }
 
     spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
         // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
         if(!target || !hero) return
         super.spell_skill(table,target,hero)
               // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        const _target = GameRules.SceneManager.get_card(target) as Unit
        const _damage = new damage(hero,_target)
        _damage.spell_skill_settlement(this.damage_calculate(hero),hero)
        CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT",{uuid:_target.UUID,paticle:"particles/econ/items/zeus/arcana_chariot/zeus_arcana_kill_remnant.vpcf",cameraOrigin:'0 400 0',lookAt:'0 0 0'})
     }
 
     /**伤害结算方法 */
     damage_calculate(hero:Unit){
        let damage = 0
        if(hero.Getfaulty == 1){
            damage = 5
        }
        if(hero.Getfaulty == 2){
            damage = 7
        }
        if(hero.Getfaulty == 3){
            damage = 10
        }
        return damage
    }
 }

 /**
 * 幻影突袭
 */
  @ca_register_ability()
  export class SmallSkill_huanyingtuxi  extends ability_templater{
      Magic_brach = Magic_brach.对格
      Magic_team = Magic_team.敌方
      Magic_range = Magic_range.单体
      heroid="44"
      ability_select_type: select_type = select_type.敌方单体;
      consumption: number = 4

      constructor(){
          super("SmallSkill_huanyingtuxi")
      }

            spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
            // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
            if(!target || !hero) return
            super.spell_skill(table,target,hero)
            // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
            const _target = GameRules.SceneManager.get_card(target) as Unit
            let index = (_target.Scene.find_oppose() as BattleArea).GetrecentSpace(_target.Index)
            while((_target.Scene.find_oppose() as BattleArea).GetSpaceCount() == 2 && _target.Index == hero.Index){
                let index = (_target.Scene.find_oppose() as BattleArea).GetrecentSpace(_target.Index)
            }
            if(index != -1 && _target.Index != hero.Index){
                GameRules.SceneManager.change_secens(hero.UUID,hero.Scene.SceneName,index + 1 )
            }
            const _damage = new damage(hero,_target)
            _damage.spell_skill_settlement(this.damage_calculate(hero),hero)
            CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT",{uuid:_target.UUID,paticle:"particles/econ/items/zeus/arcana_chariot/zeus_arcana_kill_remnant.vpcf",cameraOrigin:'0 400 0',lookAt:'0 0 0'})
    }
  
 
     /**伤害结算方法 */
     damage_calculate(hero:Unit){
        let damage = 0
        if(hero.Getfaulty == 1){
            damage = 4
        }
        if(hero.Getfaulty == 2){
            damage = 6
        }
        if(hero.Getfaulty == 3){
            damage = 9
        }
        return damage
    }
  }

 /**
 * 淘汰之刃
 */
  @ca_register_ability()
  export class SmallSkill_taotaizhiren extends ability_templater{
      Magic_brach = Magic_brach.本路
      Magic_team = Magic_team.敌方
      Magic_range = Magic_range.单体
      heroid ="2"
      wounded = true
      ability_select_type: select_type = select_type.敌方近邻;
      consumption: number = 3

      constructor(){
          super("SmallSkill_taotaizhiren")
      }
  
      spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
        if(!target || !hero) return
        super.spell_skill(table,target,hero)
        const _target = GameRules.SceneManager.get_card(target) as Unit
        if(_target.max_heal != _target.heal){
            const _damage = new damage(hero,_target)
            _damage.spell_skill_settlement(100,hero)
            CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT",{uuid:_target.UUID,paticle:"particles/vr_env/killbanner/vr_killbanner_first_blood.vpcf",cameraOrigin:'0 400 0',lookAt:'0 0 0'})
        }
      }

}

/**
 * 严寒灼烧
 */
 @ca_register_ability()
 export class SmallSkill_yanhanzhuoshao extends ability_templater{
     Magic_brach = Magic_brach.本路
     Magic_team = Magic_team.自己
     Magic_range = Magic_range.单体
     heroid="112"
     displacement = 1
     ability_select_type: select_type = select_type.自己;
     consumption: number = 3

     constructor(){
         super("SmallSkill_yanhanzhuoshao")
     }
 
    spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
        if(!target || !hero) return
        super.spell_skill(table,target,hero)
        const _target = GameRules.SceneManager.get_card(target) as Unit
        const scene = hero.Scene as BattleArea
    }
 
    post_move_spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
        super.post_move_spell_skill(table,target,hero)
        const midifiler = ModifilerContainer.instance.Get_prototype_modifiler("abyssal_underlord_pit_of_malice_modifiler")
        hero.addmodifiler(midifiler)
    }

     /**伤害结算方法 */
     damage_calculate(distance:number){
         return 3 - distance
     }
}

/**
 * 洗礼
 */
 @ca_register_ability()
 export class SmallSkill_xili extends ability_templater{
     Magic_brach = Magic_brach.本路
     Magic_team = Magic_team.友方
     Magic_range = Magic_range.单体
     heroid = "57"
     ability_select_type: select_type = select_type.友方单体;
     consumption: number = 4
 
     constructor(){
         super("SmallSkill_xili")
     }


     spell_skill(_table:(Unit|number)[],target?:string,hero?:Unit){
        if(!target || !hero) return
        const _target = GameRules.SceneManager.get_card(target) as Unit
        if(_target.PlayerID == hero.PlayerID){
            super.spell_skill(_table,target,hero)
            _target.cure(this.calculate(hero),hero)
            CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT",{uuid:_target.UUID,paticle:"particles/econ/items/omniknight/omni_2021_immortal/omni_2021_immortal_owner.vpcf",cameraOrigin:"0 400 0",lookAt:"0 0 0"})
            const table = GameRules.SceneManager.enemyneighbor(_target)
            this.__damage(table.center,hero)
            this.__damage(table.left,hero)
            this.__damage(table.right,hero)
        }
    }

    __damage(target:Unit|number,source:Unit){
        if(typeof(target) == 'number') return;
        const _damage = new damage(source,target)
        _damage.spell_skill_settlement(this.calculate(source),source)
    }
 
     /**伤害结算方法 */
     calculate(hero:Unit){
        let cure = 0
        if(hero.Getfaulty == 1){
            cure = 3
        }
        if(hero.Getfaulty == 2){
            cure = 5
        }
        if(hero.Getfaulty == 3){
            cure = 7
        }
        return cure
    }
}

// /**
//  * 龙破斩
//  */
//  @ca_register_ability()
//  export class SmallSkill_longpizhan extends ability_templater{
//     Magic_brach = Magic_brach.对格
//     Magic_team = Magic_team.敌方
//     Magic_range = Magic_range.近邻
//     heroid = "25"
//     ability_select_type: select_type = select_type.敌方近邻;
//     consumption: number = 3

//      constructor(){
//          super("SmallSkill_longpizhan")
//      }
 

//      spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
//         if(!target || !hero) return
//         super.spell_skill(table,target,hero)
//         const _table =  GameRules.SceneManager.enemyneighbor(hero)
//         this.__damage(_table.center,hero)
//         this.__damage(_table.left,hero)
//         this.__damage(_table.right,hero)
        
//     }

    
//     __damage(target:Unit|number,source:Unit){
//         if(typeof(target) == 'number') return;
//         const _damage = new damage(source,target)
//         _damage.spell_skill_settlement(this.calculate(source),source)
//         CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT",{uuid:target.UUID,paticle:"particles/econ/items/legion/legion_weapon_voth_domosh/legion_commander_duel_arcana_fire.vpcf",cameraOrigin:"0 400 0",lookAt:"0 0 0"})
//     }
 
//      /**伤害结算方法 */
//      calculate(hero:Unit){
//         let cure = 0
//         if(hero.Getfaulty == 1){
//             cure = 3
//         }
//         if(hero.Getfaulty == 2){
//             cure = 5
//         }
//         if(hero.Getfaulty == 3){
//             cure = 7
//         }
//         return cure
//     }
// }

/**
 * 恶魔转化 
 */
 @ca_register_ability()
 export class SmallSkill_emozhuanhua extends ability_templater{
     Magic_brach = Magic_brach.本路
     Magic_team = Magic_team.友方
     Magic_range = Magic_range.单体
     heroid="33"
     wounded = false
     ability_select_type: select_type = select_type.友方单体;
     Magic_attack_tart_type = Magic_attack_tart_type.小兵 | Magic_attack_tart_type.召唤物
     consumption: number = 3
     skillAnimation = 5

     constructor(){
         super("SmallSkill_emozhuanhua")
     }

     spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
        if(!target || !hero) return
        const _target = GameRules.SceneManager.get_card(target) as Unit
        super.spell_skill(table,target,hero)
        const _damage = new damage(hero,_target as Unit,true)
        _damage.spell_skill_settlement((_target as Unit).max_heal,hero,'purely')
        Timers.CreateTimer(1.5,()=>{
            GameRules.brash_solidier.playerSummoning("1",3,hero.PlayerID,hero.Scene as BattleArea)
        }) 
      }
 
     /**伤害结算方法 */
     damage_calculate(distance:number){
         return 3 - distance
     }
}   

/**
 * 传送 
 */
 @ca_register_ability()
 export class SmallSkill_chuansong extends ability_templater{
     Magic_brach = Magic_brach.跨线
     Magic_team = Magic_team.自己
     Magic_range = Magic_range.单体
     heroid = "53"
     displacement: number = 2
     ability_select_type: select_type = select_type.自己;
     consumption: number = 2

     constructor(){
         super("SmallSkill_chuansong")
     }
 
     spell_skill(table:(Unit|number)[],target?:string){
     }

     post_move_spell_skill(table: (number | Unit)[], target?: string, hero?: Unit): void {
         super.post_move_spell_skill(table,target,hero)
         hero.addmodifiler(ModifilerContainer.instance.Get_prototype_modifiler("ProphetFlight_modifiler"))
     }
}   

/**
 * 洪流 
 */
 @ca_register_ability()
 export class SmallSkill_hongliu extends ability_templater{
    Magic_brach = Magic_brach.本路
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.近邻
    heroid="23"
    ability_select_type: select_type = select_type.敌方近邻;
    consumption: number = 4

    constructor(){
        super("SmallSkill_hongliu")
    }

    spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        super.spell_skill(table,target,hero)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    const _damage = new damage(hero,target)
                    _damage.spell_skill_settlement(this.damage_calculate(),hero)
                    const modifiler = ModifilerContainer.instance.Get_prototype_modifiler("stund1round_modifiler")
                    target.addmodifiler(modifiler)
                }   
            }
        })
    }

    /**伤害结算方法 */
    damage_calculate(){
        return 3
    }
}

/**
 * 惑幻：召唤一个等同于恐怖利刃基础数值的幻想
 */
 @ca_register_ability()
 export class SmallSkill_huohuan extends ability_templater{
     Magic_brach = Magic_brach.本路
     Magic_team = Magic_team.友方
     Magic_range = Magic_range.单体
     heroid = "109"
     ability_select_type: select_type = select_type.自己;
     consumption: number = 3
     displacement = 1;
     vacancyRelease = true // 空位释放

     constructor(){
         super("SmallSkill_huohuan")
     }


     spell_skill(table:(Unit|number)[],target?:string,hero?:Unit,target_index?:number){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        super.spell_skill(table,target,hero)
        if(!target_index) return;
        print("在",target_index,"位置召唤一个单位")
        GameRules.brash_solidier.playerSummoning("2",1,hero.PlayerID,hero.Scene as BattleArea,target_index)
    }
 
}   


/**
 * 雷神之怒：对所有兵线上的每名敌方英雄造成3/5/7点纯粹伤害
 */
 @ca_register_ability()
 export class TrickSkill_leishenzhinu extends ability_templater{
     Magic_brach = Magic_brach.跨线
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.全体
     Magic_attack_tart_type = Magic_attack_tart_type.英雄
     heroid = "22"
     ability_select_type: select_type = select_type.敌方全体;
     consumption: number = 6

     constructor(){
         super("TrickSkill_leishenzhinu")
     }
 
     spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
         // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
         super.spell_skill(table)
         table.forEach(target=>{
             if(typeof(target) != 'number'){
                 if(target.Index){
                     if(target.type == 'Hero'){
                        const _damage = new damage(hero,target)
                        _damage.spell_skill_settlement(this.damage_calculate(hero),hero)
                     }
                 }   
             }
         })
     }
 
     /**伤害结算方法 */
     damage_calculate(hero:Unit){
        let damage = 0
        if(hero.Getfaulty == 1){
            damage = 3
        }
        if(hero.Getfaulty == 2){
            damage = 5
        }
        if(hero.Getfaulty == 3){
            damage = 7
        }
        return damage
    }
}   



/**
 * 强攻：解除一个友方单位的控制效果，并获得4攻击力回复4生命值
 */
 @ca_register_ability()
 export class TrickSkill_qianggong extends ability_templater{
     Magic_brach = Magic_brach.本路
     Magic_team = Magic_team.友方
     Magic_range = Magic_range.单体
     heroid = "104"
     ability_select_type: select_type = select_type.友方单体;
     consumption: number = 5

     constructor(){
         super("TrickSkill_qianggong")
     }
 
     spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        if(!target || !hero) return
        const _target = GameRules.SceneManager.get_card(target) as Unit
        if(_target.PlayerID == hero.PlayerID){
            super.spell_skill(table,target,hero)
            _target.cure(3,hero)
            _target.addmodifiler(ModifilerContainer.instance.Get_prototype_modifiler("qianggong_modifiler"))            
        }
    }
}   


/**
 * 暗杀：对一个敌方单位造成10点纯粹伤害并眩晕（跨线技能）
 */
 @ca_register_ability()
 export class TrickSkill_ansha extends ability_templater{
     Magic_brach = Magic_brach.跨线
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.单体
     heroid = "35"
     ability_select_type: select_type = select_type.全场任意敌方单体;
     consumption: number = 6

     constructor(){
         super("TrickSkill_ansha")
     }
 
     spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        if(!target || !hero) return
        const _target = GameRules.SceneManager.get_card(target) as Unit
        if(_target.PlayerID != hero.PlayerID){
            super.spell_skill(table,target,hero)
            _target.hurt(10,hero,'purely')    
        }
    }

}   


/**
 * 恩赐解脱：惩处一名敌方英雄
 */
 @ca_register_ability()
 export class TrickSkill_encijietuo extends ability_templater{
     Magic_brach = Magic_brach.本路
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.单体
     heroid = "44"
     ability_select_type: select_type = select_type.敌方单体;
     wounded: boolean = false;
     consumption: number = 5
 
     constructor(){
         super("TrickSkill_encijietuo")
     }
 
     spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        if(!target || !hero) return
        super.spell_skill(table,target,hero)
        const _target = GameRules.SceneManager.get_card(target) as Unit
        if(_target.PlayerID != hero.PlayerID){
            _target.hurt(100,hero,'purely')       
        }
    }
}


/**
 * 狂战士之吼：斧王与敌方近邻战斗
 */
 @ca_register_ability()
 export class TrickSkill_kuangzhanshizhihou extends ability_templater{
     Magic_brach = Magic_brach.对格
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.近邻
     heroid = "2"
     ability_select_type: select_type = select_type.敌方近邻;
     consumption: number = 5

     constructor(){
         super("TrickSkill_kuangzhanshizhihou")
     }
 
     spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        if(!target || !hero) return
        super.spell_skill(table,target,hero)
        table.forEach(card=>{
            if(typeof(card) != 'number'){
                const _damage = new damage(hero,card)
                _damage.settlement()
            }
        })
    }
 
}   


/**
    寒冬诅咒：选择一个敌方英雄，使其与另一个敌方英雄决斗
 */
 @ca_register_ability()
 export class TrickSkill_handongzuzhou extends ability_templater{
     Magic_brach = Magic_brach.本路
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.单体
     heroid = "112"
     ability_select_type: select_type = select_type.敌方单体;
     consumption: number = 5
 
     constructor(){
         super("TrickSkill_handongzuzhou")
     }
 
     spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        if(!target || !hero) return
        super.spell_skill(table,target,hero)
        const _target = GameRules.SceneManager.get_card(target) as Unit
        const _target2 = (_target.Scene as BattleArea).randomGet() as Unit
        if(_target.PlayerID !+ hero.PlayerID){
            let i = 1
            Timers.CreateTimer(i,()=>{
                i++
                _target.hurt(_target2.attack,_target2,"ability")
            })
            Timers.CreateTimer(i,()=>{
                _target2.hurt(_target.attack,_target,"ability")
            })
        }
    }
 
}   



/**
    守护天使：使本回合所有的友方单位获得伤害免疫
 */
    @ca_register_ability()
    export class TrickSkill_shouhutianshi  extends ability_templater{
        Magic_brach = Magic_brach.本路
        Magic_team = Magic_team.友方
        Magic_range = Magic_range.全体
        heroid = "57"
        ability_select_type: select_type = select_type.友方本路;
        consumption: number = 5

        constructor(){
            super("TrickSkill_shouhutianshi")
        }
    
        spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
            // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
            if(!target || !hero) return
            super.spell_skill(table,target,hero)
            table.forEach(card=>{
                if(typeof(card) != "number"){
                    if(card.PlayerID == hero.PlayerID){
                        card.addmodifiler(ModifilerContainer.instance.Get_prototype_modifiler("shanghaimianyi_modifiler"))
                    }
                }
            })
        }
   }   


   /**
    神灭斩：对一个敌方单位造11/14/17点魔法伤害
 */
    @ca_register_ability()
    export class TrickSkill_mieshenzhan  extends ability_templater{
        Magic_brach = Magic_brach.本路
        Magic_team = Magic_team.敌方
        Magic_range = Magic_range.单体
        heroid = "25"
        ability_select_type: select_type = select_type.敌方单体;
        consumption: number = 5

        constructor(){
            super("TrickSkill_mieshenzhan")
        }
    
        spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
            // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
            if(!target || !hero) return
            super.spell_skill(table,target,hero)
            const _target = GameRules.SceneManager.get_card(target) as Unit
            const _damage = new damage(hero,_target)
            _damage.spell_skill_settlement(this.damage_calculate(hero),hero)
        }
    
     /**伤害结算方法 */
     damage_calculate(hero:Unit){
        let damage = 0
        if(hero.Getfaulty == 1){
            damage = 11
        }
        if(hero.Getfaulty == 2){
            damage = 14
        }
        if(hero.Getfaulty == 3){
            damage = 17
        }
        return damage
     }
 }   


/**
黑洞：对正面3格单位造成眩晕，并造成5/7/10点魔法伤害
 */
    @ca_register_ability()
    export class TrickSkill_heidong  extends ability_templater{
        Magic_brach = Magic_brach.本路
        Magic_team = Magic_team.敌方
        Magic_range = Magic_range.近邻
        heroid = "33"
        ability_select_type: select_type = select_type.敌方近邻;
        consumption: number = 6

        constructor(){
            super("TrickSkill_heidong")
        }
    
        spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
            // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
            if(!target || !hero) return
            super.spell_skill(table,target,hero)
            const _table =  GameRules.SceneManager.enemyneighbor(hero)
            this.__damage(_table.center,hero)
            this.__damage(_table.left,hero)
            this.__damage(_table.right,hero)
            _table.center && _table.center.addmodifiler(ModifilerContainer.instance.Get_prototype_modifiler("stund1round_modifiler"))
            _table.left && (_table.left as Unit).addmodifiler(ModifilerContainer.instance.Get_prototype_modifiler("stund1round_modifiler"))
            _table.right && (_table.right as Unit).addmodifiler(ModifilerContainer.instance.Get_prototype_modifiler("stund1round_modifiler"))
        }

        __damage(target:Unit|number,source:Unit){
            if(typeof(target) == 'number') return;
            const _damage = new damage(source,target)
            _damage.spell_skill_settlement(this.damage_calculate(source),source)
        }
     
     /**伤害结算方法 */
     damage_calculate(hero:Unit){
        let damage = 0
        if(hero.Getfaulty == 1){
            damage = 5
        }
        if(hero.Getfaulty == 2){
            damage = 7
        }
        if(hero.Getfaulty == 3){
            damage = 10
        }
        return damage
     }
   }   


         /**
集中火力：选择一个敌方单位或者敌方防御塔造成3次5/6/8点纯粹伤害


 */
@ca_register_ability()
export class TrickSkill_jizhonghuoli  extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "21"
    ability_select_type: select_type = select_type.敌方单体;
    istypeTower = 1;
    consumption: number = 7

    constructor(){
        super("TrickSkill_jizhonghuoli")
    }

    spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        if(!target || !hero) return
        super.spell_skill(table,target,hero)
        const _target = GameRules.SceneManager.get_card(target) as Unit
        if(_target){
            for(let i = 0 ; i < 3 ; i++){
                this.newDamege(hero,_target,i)        
            }
        }
    }

    newDamege(hero:Unit,target:Unit,index:number){
        Timers.CreateTimer(index,()=>{
            const _damage = new damage(hero,target)
            _damage.spell_skill_settlement(this.damage_calculate(hero),hero,"purely")
        })
    }

    towerDamage(tower:Tower,index:number,hero:Unit){
        super.spell_skill([],null,null)
        Timers.CreateTimer(index,()=>{
            tower.hurt(this.damage_calculate(hero))  
        })
    }

    spell_tower(table:(Unit|number)[],target?:string,hero?:Unit,tower?:Tower){
        if(tower){
            for(let i = 1 ; i < 4 ; i ++){
                this.towerDamage(tower,i,hero) 
            }
        }else{
            this.spell_skill(table,target,hero)
        } 
    }
    
    damage_calculate(hero:Unit){
        let damage = 0
        if(hero.Getfaulty == 1){
            damage = 5
        }
        if(hero.Getfaulty == 2){
            damage = 7
        }
        if(hero.Getfaulty == 3){
            damage = 10
        }
        return damage
     }
}   


         /**
自然的召唤：召唤3攻6血的小树人直到上限

 */
@ca_register_ability()
export class TrickSkill_zirandezhaohuan extends ability_templater{
    Magic_brach = Magic_brach.本路
    Magic_team = Magic_team.友方
    Magic_range = Magic_range.单体
    heroid = "53"
    displacement = 1
    ability_select_type: select_type = select_type.自己;
    consumption: number = 5
    vacancyRelease = true // 空位释放

    constructor(){
        super("TrickSkill_zirandezhaohuan")
    }

    

    spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        super.spell_skill(table,target,hero)
        const _target = GameRules.SceneManager.get_card(target) as Unit
        const scene = hero.Scene as BattleArea
        const count = scene.GetSpaceCount()
        GameRules.brash_solidier.playerSummoning("4",count,hero.PlayerID,hero.Scene as BattleArea)
        print("触发了自然的召唤",hero.UUID)      
    }
}   


/**
幽灵船：对一个敌方英雄施放一艘船使其眩晕并造成6点伤害，路径上的所有友方英雄获得2点抗性（跨线技能）

 */
@ca_register_ability()
export class TrickSkill_youlingchuan extends ability_templater{
    Magic_brach = Magic_brach.跨线
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid="23"
    ability_select_type: select_type = select_type.敌方全体;
    consumption: number = 6

    constructor(){
        super("TrickSkill_youlingchuan")
    }

    spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
        if(!target || !hero) return
        super.spell_skill(table,target,hero)
        const _target = GameRules.SceneManager.get_card(target) as Unit
        const _damage = new damage(hero,_target,true)
        _damage.spell_skill_settlement(this.damage_calculate(),hero)
        const units = _target.Scene.find_oppose().getAll() as Unit[]
        _target.addmodifiler(ModifilerContainer.instance.Get_prototype_modifiler("stund1round_modifiler"))
        units.forEach(card=>{
            if(typeof(card) != 'number'){
                card.addmodifiler(ModifilerContainer.instance.Get_prototype_modifiler("youlingchuan_modifiler"))
            }
        })
    }

    /**伤害结算方法 */
    damage_calculate(){
        return 6
    }
}   

         /**
魂断：选择一个单位，使恐怖利刃和其交换当前生命值
 */
@ca_register_ability()
export class TrickSkill_hunduan extends ability_templater{
    Magic_brach = Magic_brach.本路
    Magic_team = Magic_team.双方
    Magic_range = Magic_range.单体
    ability_select_type: select_type = select_type.本路;
    heroid = "109"
    consumption: number = 4

    constructor(){
        super("TrickSkill_hunduan")
    }

    spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
        super.spell_skill(table,target,hero)
        if(!target || !hero) return;
        const _target = GameRules.SceneManager.get_card(target) as Unit
        const myheal =  hero.GETheal 
        const youheal = _target.GETheal
        hero.cure(youheal - myheal,hero)
        _target.cure(myheal - youheal,hero)
        hero.updateAttribute()
        _target.updateAttribute()
    }

}   


         /**
毁灭：本回合眩晕所有敌方单位，并造成2/3/4点物理伤害
 */
@ca_register_ability()
export class TrickSkill_huimie extends ability_templater{
    Magic_brach = Magic_brach.本路
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.全体
    heroid= "29"
    ability_select_type: select_type = select_type.敌方本路;
    consumption: number = 6

    constructor(){
        super("TrickSkill_huimie")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        const hero = GameRules.SceneManager.get_hero(this.heroid) as Unit
        super.spell_skill(table)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    target.addmodifiler(ModifilerContainer.instance.Get_prototype_modifiler("stund1round_modifiler"))
                    const _damage = new damage(hero,target)
                    _damage.spell_skill_settlement(this.damage_calculate(hero),hero)
                }   
            }
        })
    }

    damage_calculate(hero:Unit){
        let damage = 0
        if(hero.Getfaulty == 1){
            damage = 2
        }
        if(hero.Getfaulty == 2){
            damage = 3
        }
        if(hero.Getfaulty == 3){
            damage = 4
        }
        return damage
    }
}   

/**
 * 冲击波：对本路全体敌方单位造成5/7/10点魔法伤害

 */
@ca_register_ability()
export class TrickSkill_chongjibo extends ability_templater{
    Magic_brach = Magic_brach.本路
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.全体
    heroid = "90"
    ability_select_type: select_type = select_type.敌方本路;
    consumption: number = 6

    constructor(){
        super("TrickSkill_chongjibo")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        const hero = GameRules.SceneManager.get_hero(this.heroid) as Unit
        super.spell_skill(table)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    const _damage = new damage(hero,target)
                    _damage.spell_skill_settlement(this.damage_calculate(hero),hero)
                }   
            }
        })
    }

    /**伤害结算方法 */
    damage_calculate(hero:Unit){
        let damage = 0
        if(hero.Getfaulty == 1){
            damage = 5
        }
        if(hero.Getfaulty == 2){
            damage = 7
        }
        if(hero.Getfaulty == 3){
            damage = 10
        }
        return damage
    }
}   


/**
幽冥轰爆：对敌方近邻和防御塔造成5/7/10点伤害


 */
 @ca_register_ability()
 export class TrickSkill_youminghongbao extends ability_templater{
     Magic_brach = Magic_brach.对格
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.单体
     heroid="45"
     ability_select_type: select_type = select_type.敌方近邻;
     consumption: number = 3

     constructor(){
         super("TrickSkill_youminghongbao")
     }
 
     spell_skill(table:(Unit|number)[],target?:string){
         // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
         const hero = GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID()).IndexGet(3) as Unit
         super.spell_skill(table)
         table.forEach(target=>{
             if(typeof(target) != 'number'){
                 if(target.Index){
                     const _damage = new damage(hero,target)
                     _damage.spell_skill_settlement(this.damage_calculate(math.abs(hero.Index - target.Index)),hero)
                 }   
             }
         })
     }
 
     /**伤害结算方法 */
     damage_calculate(distance:number){
         return 3 - distance
     }
 }   


 
/**
暗影冲刺：选择一个敌方英雄与之战斗,裂魂人进入与该英雄距离最近的友方空格（跨线技能）

 */
@ca_register_ability()
export class TrickSkill_anyingchongchi extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "71"
    ability_select_type: select_type = select_type.全场任意敌方单体;

    constructor(){
        super("TrickSkill_anyingchongchi")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        const hero = GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID()).IndexGet(3) as Unit
        super.spell_skill(table)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    const _damage = new damage(hero,target)
                    _damage.spell_skill_settlement(this.damage_calculate(math.abs(hero.Index - target.Index)),hero)
                }   
            }
        })
    }

    /**伤害结算方法 */
    damage_calculate(distance:number){
        return 3 - distance
    }
}   

 
/**
发射钩爪：发条移动到一个友方空格，对该空格的对格敌方目标造成眩晕和6点物理伤害（跨线技能）
 */
@ca_register_ability()
export class TrickSkill_fashegouzhua extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "51"
    ability_select_type: select_type = select_type.自己;

    constructor(){
        super("TrickSkill_fashegouzhua")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        const hero = GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID()).IndexGet(3) as Unit
        super.spell_skill(table)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    const _damage = new damage(hero,target)
                    _damage.spell_skill_settlement(this.damage_calculate(math.abs(hero.Index - target.Index)),hero)
                }   
            }
        })
    }

    /**伤害结算方法 */
    damage_calculate(distance:number){
        return 3 - distance
    }
}   

/**
野性呼唤战鹰：召唤一只6攻9血的战鹰（跨线技能）
 */
@ca_register_ability()
export class TrickSkill_yexingzhaohuanzhanying extends ability_templater{
    Magic_brach = Magic_brach.本路
    Magic_team = Magic_team.友方
    Magic_range = Magic_range.单体
    heroid = "38"
    ability_select_type: select_type = select_type.自己;
    consumption = 3
    displacement = 1
    vacancyRelease = true // 空位释放

    constructor(){
        super("TrickSkill_yexingzhaohuanzhanying")
    }

    spell_skill(table:(Unit|number)[],target?:string,hero?:Unit,target_index?:number){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        super.spell_skill(table)
        const scene = hero.Scene as BattleArea
        GameRules.brash_solidier.playerSummoning("3",2,hero.PlayerID,hero.Scene as BattleArea)
    }

}   

/**
机械行军：对所有兵线上的敌方单位造成3/4/6点魔法伤害
 */
@ca_register_ability()
export class TrickSkill_jixiexingjun extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "34"
    ability_select_type: select_type = select_type.敌方全体;
    constructor(){
        super("TrickSkill_jixiexingjun")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        const hero = GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID()).IndexGet(3) as Unit
        super.spell_skill(table)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    const _damage = new damage(hero,target)
                    _damage.spell_skill_settlement(this.damage_calculate(math.abs(hero.Index - target.Index)),hero)
                }   
            }
        })
    }

    /**伤害结算方法 */
    damage_calculate(distance:number){
        return 3 - distance
    }
}   


/**
巨浪：选择一个敌方单位，移除其抗性值
 */
@ca_register_ability()
export class SmallSkill_julang extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "29"
    ability_select_type: select_type = select_type.敌方单体;
    consumption: number = 3;
    constructor(){
        super("SmallSkill_julang")
    }   

    spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
        if(!target || !hero) return
        super.spell_skill(table,target,hero)
        const _target = GameRules.SceneManager.get_card(target) as Unit
        const _damage = new damage(hero,_target)
        _damage.spell_skill_settlement(this.damage_calculate(hero),_target)
        _target.addmodifiler(ModifilerContainer.instance.Get_prototype_modifiler("julang_modifiler"))
    }

    damage_calculate(hero:Unit){
        let damage = 0
        if(hero.Getfaulty == 1){
            damage = 3
        }
        if(hero.Getfaulty == 2){
            damage = 5
        }
        if(hero.Getfaulty == 3){
            damage = 7
        }
        return damage
    }


}   


/**
"致盲之光：将一个敌方单位移动到另一个敌方空格中，并对其造成3/5/8点魔法伤害

"

 */
@ca_register_ability()
export class SmallSkill_zhimangzhiguang extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid ="90"
    ability_select_type: select_type = select_type.敌方单体;
    consumption: number = 3
    constructor(){
        super("SmallSkill_zhimangzhiguang")
    }

    spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
        if(!target || !hero) return
        super.spell_skill(table,target,hero)
        const _target = GameRules.SceneManager.get_card(target) as Unit
        const scnes = _target.Scene as BattleArea
        const _damage = new damage(hero,_target)
        _damage.spell_skill_settlement(this.damage_calculate(hero),hero)
        const index = scnes.randomGetSpace()
        if(index)
        Timers.CreateTimer(1,()=>{
            GameRules.SceneManager.change_secens(_target.UUID,scnes.SceneName,+index)
        })
    }


    damage_calculate(hero:Unit){
        let damage = 0
        if(hero.Getfaulty == 1){
            damage = 3
        }
        if(hero.Getfaulty == 2){
            damage = 5
        }
        if(hero.Getfaulty == 3){
            damage = 8
        }
        return damage
    }
}   


/**
生命汲取：选择一个单位造成3/5/8点伤害，并恢复帕格纳等量生命值
 */
@ca_register_ability()
export class SmallSkill_shengmingjiqu extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = '45'
    ability_select_type: select_type = select_type.敌方单体;
    constructor(){
        super("SmallSkill_shengmingjiqu")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        const hero = GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID()).IndexGet(3) as Unit
        super.spell_skill(table)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    const _damage = new damage(hero,target)
                    _damage.spell_skill_settlement(this.damage_calculate(math.abs(hero.Index - target.Index)),hero)
                }   
            }
        })
    }

    /**伤害结算方法 */
    damage_calculate(distance:number){
        return 3 - distance
    }
}   

/**
束缚击：选择一个敌方单位，使其和其右边的一个敌方单位眩晕
 */
@ca_register_ability()
export class SmallSkill_suboji extends ability_templater{
    Magic_brach = Magic_brach.本路
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = '21'
    ability_select_type: select_type = select_type.敌方单体;
    consumption: number = 3;
    constructor(){
        super("SmallSkill_suboji")
    }

    spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        if(!target || !hero) return
        const _target = GameRules.SceneManager.get_card(target) as Unit
        if(_target.PlayerID != hero.PlayerID){
            super.spell_skill(table,target,hero)
            const index = _target.Index
            const right = _target.Scene.IndexGet(index+1) //右边的单位 不确定是否为空
            if(typeof(right) != 'number'){
                const modifiler = ModifilerContainer.instance.Get_prototype_modifiler("stund1round_modifiler")
                _target.addmodifiler(modifiler);
                (right as Unit).addmodifiler(modifiler)
            }
        }
    }

}   



/**
巨力重击：眩晕对格敌方单位，并使其移动到一个敌方空格内
 */
@ca_register_ability()
export class SmallSkill_julizhongji extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "71"
    ability_select_type: select_type = select_type.敌方对格;
    consumption = 2;
    constructor(){
        super("SmallSkill_julizhongji")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        super.spell_skill(table)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    const modifiler = ModifilerContainer.instance.Get_prototype_modifiler("stund1round_modifiler")
                    target.addmodifiler(modifiler)
                    const index = (target.Scene as BattleArea).randomGetSpace()
                    if(index)
                    Timers.CreateTimer(1,()=>{
                        GameRules.SceneManager.change_secens(target.UUID,target.Scene.SceneName,+index)
                    })
                }   
            }
        })
    }

    /**伤害结算方法 */
    damage_calculate(distance:number){
        return 3 - distance
    }
}   


/**
照明火箭：选择一个敌方单位对其近邻造成3/5/7点物理伤害（跨线技能）

 */
@ca_register_ability()
export class SmallSkill_zhaominghuojian extends ability_templater{
    Magic_brach = Magic_brach.跨线
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "51"
    ability_select_type: select_type = select_type.全场任意敌方单体;
    consumption = 4
    constructor(){
        super("SmallSkill_zhaominghuojian")
    }

    spell_skill(table:(Unit|number)[],target?:string,hero?:Hero){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        super.spell_skill(table)
        const _target = GameRules.SceneManager.get_card(target) as Unit
        const left = _target.Find_left_Card()
        const right = _target.Find_right_Card()
        this.settlement(_target,hero)
        left != null && this.settlement(left,hero)
        right != null  && this.settlement(right,hero)
    }

    settlement(target:Unit,my:Hero){
        print("找到了目标为",target.UUID)
        const _damage = new damage(my,target)
        _damage.spell_skill_settlement(this.damage_calculate(my),my)
    }


    damage_calculate(hero:Unit){
        let damage = 0
        if(hero.Getfaulty == 1){
            damage = 3
        }
        if(hero.Getfaulty == 2){
            damage = 5
        }
        if(hero.Getfaulty == 3){
            damage = 7
        }
        return damage
    }
}   


/**
热导飞弹：对敌方单位随机释放3枚导弹,每枚导弹造成3/5/7点伤害

 */
@ca_register_ability()
export class SmallSkill_redaofeidan extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "34"
    ability_select_type: select_type = select_type.敌方本路;
    constructor(){
        super("SmallSkill_redaofeidan")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        const hero = GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID()).IndexGet(3) as Unit
        super.spell_skill(table)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    const _damage = new damage(hero,target)
                    _damage.spell_skill_settlement(this.damage_calculate(math.abs(hero.Index - target.Index)),hero)
                }   
            }
        })
    }

    /**伤害结算方法 */
    damage_calculate(distance:number){
        return 3 - distance
    }
}



/**
野性呼唤豪猪：召唤一只4攻7血的豪猪
 */
@ca_register_ability()
export class SmallSkill_yexingzhaohuanyezhu extends ability_templater{
    Magic_brach = Magic_brach.本路
    Magic_team = Magic_team.友方
    Magic_range = Magic_range.单体
    heroid = "38"
    ability_select_type: select_type = select_type.自己;
    displacement = 1
    vacancyRelease = true // 空位释放
    consumption = 3;
    constructor(){
        super("SmallSkill_yexingzhaohuanyezhu")
    }

    spell_skill(table:(Unit|number)[],target?:string,hero?:Unit,target_index?:number){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        super.spell_skill(table)
        const scene = hero.Scene as BattleArea
        GameRules.brash_solidier.playerSummoning("3",2,hero.PlayerID,hero.Scene as BattleArea)
    }
}   


/**
3水晶 丽娜小 光击阵：眩晕丽娜的敌方近邻，并造成2/4/6点伤害
 */
@ca_register_ability()
export class SmallSkill_guangjizhen extends ability_templater{
    Magic_brach = Magic_brach.本路
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.近邻
    heroid = "25"
    ability_select_type: select_type = select_type.敌方近邻;
    consumption: number = 3
    constructor(){
        super("SmallSkill_guangjizhen")
    }

    spell_skill(table:(Unit|number)[],target?:string,hero?:Unit){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        super.spell_skill(table,target,hero)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    const _damage = new damage(hero,target)
                    _damage.spell_skill_settlement(this.damage_calculate(hero),hero)
                    const modifiler = ModifilerContainer.instance.Get_prototype_modifiler("stund1round_modifiler")
                    target.addmodifiler(modifiler)
                }   
            }
        })
    }

     /**伤害结算方法 */
     damage_calculate(hero:Unit){
        let damage = 0
        if(hero.Getfaulty == 1){
            damage = 2
        }
        if(hero.Getfaulty == 2){
            damage = 4
        }
        if(hero.Getfaulty == 3){
            damage = 6
        }
        return damage
    }
}   


/**
4水晶 船长小 水刀：对船长的敌方近邻造成等同于（船长当前攻击力的一半）的伤害，向下取整
 */
@ca_register_ability()
export class SmallSkill_shuidao extends ability_templater{
    Magic_brach = Magic_brach.本路
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.近邻
    heroid = "23"
    ability_select_type: select_type = select_type.敌方近邻;
    consumption: number = 4
    constructor(){
        super("SmallSkill_shuidao")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        const hero = GameRules.SceneManager.get_hero(this.heroid) as Unit
        super.spell_skill(table)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    const _damage = new damage(hero,target)
                    _damage.spell_skill_settlement(math.floor(hero.Getattack / 2),hero)
                }   
            }
        })
    }


}   


/**
3水晶 骨法小 衰老：选择一个敌方单位使其不能攻击且不会受到攻击，并承受双倍技能伤害

 */
@ca_register_ability()
export class SmallSkill_shuailao extends ability_templater{
    Magic_brach = Magic_brach.本路
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "45"
    ability_select_type: select_type = select_type.敌方单体;
    consumption: number = 3
    
    constructor(){
        super("SmallSkill_shuailao")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        super.spell_skill(table)
        const _target = GameRules.SceneManager.get_card(target) as Unit
        _target.addmodifiler(ModifilerContainer.instance.Get_prototype_modifiler("senescence_modifiler"))
    }

    /**伤害结算方法 */
    damage_calculate(distance:number){
        return 3 - distance
    }
}   



/**
3水晶 丁哥小 激光：选择一个敌方单位对其造成3/5/7点伤害，并使该敌方单位本回合无法攻击


 */
@ca_register_ability()
export class SmallSkill_jiguang extends ability_templater{
    Magic_brach = Magic_brach.本路
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "34"
    ability_select_type: select_type = select_type.敌方本路;
    consumption = 3
    constructor(){
        super("SmallSkill_jiguang")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        const hero = GameRules.SceneManager.get_hero(this.heroid) as Unit
        const _target = GameRules.SceneManager.get_card(target) as Unit
        super.spell_skill(table,target)
        const modifiler = ModifilerContainer.instance.Get_prototype_modifiler("contribute1Round_modifiler")
        _target.addmodifiler(modifiler)
        const _damage = new damage(hero,_target)
        _damage.spell_skill_settlement(this.damage_calculate(hero),hero)
    
    }

     /**伤害结算方法 */
     damage_calculate(hero:Unit){
        let damage = 0
        if(hero.Getfaulty == 1){
            damage = 5
        }
        if(hero.Getfaulty == 2){
            damage = 7
        }
        if(hero.Getfaulty == 3){
            damage = 10
        }
        return damage
    }
}   




/**
3水晶 小黑小 狂风：沉默一个敌方英雄并使该英雄，移动到另一个敌方空格



 */
@ca_register_ability()
export class SmallSkill_kuangfeng extends ability_templater{
    Magic_brach = Magic_brach.本路
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "6"
    ability_select_type: select_type = select_type.敌方单体;
    consumption = 3

    constructor(){
        super("SmallSkill_kuangfeng")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        super.spell_skill(table)
        const hero = GameRules.SceneManager.get_hero(this.heroid) as Unit
        const _target = GameRules.SceneManager.get_card(target) as Unit
        const modifiler = ModifilerContainer.instance.Get_prototype_modifiler("silence_modifiler")
        _target.addmodifiler(modifiler)
        const index = (_target.Scene as BattleArea).randomGetSpace()
        if(index)
        Timers.CreateTimer(1,()=>{
            GameRules.SceneManager.change_secens(_target.UUID,_target.Scene.SceneName,+index)
        })
    }

    /**伤害结算方法 */
    damage_calculate(distance:number){
        return 3 - distance
    }
}   


/**
3水晶 小黑小 狂风：沉默一个敌方英雄并使该英雄，移动到另一个敌方空格



 */
@ca_register_ability()
export class SmallSkill_kuangfen  extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "6"
    ability_select_type: select_type = select_type.自己;
    constructor(){
        super("SmallSkill_kuangfen")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        const hero = GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID()).IndexGet(3) as Unit
        super.spell_skill(table)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    const _damage = new damage(hero,target)
                    _damage.spell_skill_settlement(this.damage_calculate(math.abs(hero.Index - target.Index)),hero)
                }   
            }
        })
    }

    /**伤害结算方法 */
    damage_calculate(distance:number){
        return 3 - distance
    }
}   



/**
4水晶 冰魂小 冰霜漩涡：使冰魂的敌方近邻降低2点抗性值

 */
@ca_register_ability()
export class SmallSkill_bingshuangxuanwo extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "68"
    ability_select_type: select_type = select_type.自己;
    constructor(){
        super("SmallSkill_bingshuangxuanwo")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        const hero = GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID()).IndexGet(3) as Unit
        super.spell_skill(table)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    const _damage = new damage(hero,target)
                    _damage.spell_skill_settlement(this.damage_calculate(math.abs(hero.Index - target.Index)),hero)
                }   
            }
        })
    }

    /**伤害结算方法 */
    damage_calculate(distance:number){
        return 3 - distance
    }
}   


/**
4水晶 老陈小 神圣劝化：将敌方一个非英雄单位召唤为己方单位


 */
@ca_register_ability()
export class SmallSkill_shenshengquanhua extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "66"
    ability_select_type: select_type = select_type.自己;
    constructor(){
        super("SmallSkill_shenshengquanhua")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        const hero = GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID()).IndexGet(3) as Unit
        super.spell_skill(table)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    const _damage = new damage(hero,target)
                    _damage.spell_skill_settlement(this.damage_calculate(math.abs(hero.Index - target.Index)),hero)
                }   
            }
        })
    }

    /**伤害结算方法 */
    damage_calculate(distance:number){
        return 3 - distance
    }
}   



/**
4水晶 NEC小 死亡脉冲：对敌方近邻造成3/5/7点伤害，并对友方近邻治疗3/5/7点生命值
 */
@ca_register_ability()
export class SmallSkill_siwangmaichong extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "36"
    ability_select_type: select_type = select_type.自己;
    constructor(){
        super("SmallSkill_siwangmaichong")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        const hero = GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID()).IndexGet(3) as Unit
        super.spell_skill(table)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    const _damage = new damage(hero,target)
                    _damage.spell_skill_settlement(this.damage_calculate(math.abs(hero.Index - target.Index)),hero)
                }   
            }
        })
    }

    /**伤害结算方法 */
    damage_calculate(distance:number){
        return 3 - distance
    }
}   


/**
5水晶 飞机小 火箭弹幕：对本条兵线上的所有随机敌方单位施放10次1/2/3点伤害的火箭弹幕
 */
@ca_register_ability()
export class SmallSkill_huojiandanmu extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "72"
    ability_select_type: select_type = select_type.自己;
    constructor(){
        super("SmallSkill_huojiandanmu")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        const hero = GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID()).IndexGet(3) as Unit
        super.spell_skill(table)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    const _damage = new damage(hero,target)
                    _damage.spell_skill_settlement(this.damage_calculate(math.abs(hero.Index - target.Index)),hero)
                }   
            }
        })
    }

    /**伤害结算方法 */
    damage_calculate(distance:number){
        return 3 - distance
    }
}   



/**
6水晶 小黑大 射手天赋：对一个敌方单位造成两倍于卓尔游侠当前攻击力的伤害

 */
@ca_register_ability()
export class TrickSkill_sheshoutianfu extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "6"
    ability_select_type: select_type = select_type.自己;
    constructor(){
        super("TrickSkill_sheshoutianfu")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        const hero = GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID()).IndexGet(3) as Unit
        super.spell_skill(table)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    const _damage = new damage(hero,target)
                    _damage.spell_skill_settlement(this.damage_calculate(math.abs(hero.Index - target.Index)),hero)
                }   
            }
        })
    }

    /**伤害结算方法 */
    damage_calculate(distance:number){
        return 3 - distance
    }
}   



/**
7水晶 冰魂大 冰晶轰爆：惩处一名受伤的敌方英雄（跨线技能）


 */
@ca_register_ability()
export class TrickSkill_bingjinghongbao extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "68"
    ability_select_type: select_type = select_type.自己;
    constructor(){
        super("TrickSkill_bingjinghongbao")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        const hero = GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID()).IndexGet(3) as Unit
        super.spell_skill(table)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    const _damage = new damage(hero,target)
                    _damage.spell_skill_settlement(this.damage_calculate(math.abs(hero.Index - target.Index)),hero)
                }   
            }
        })
    }

    /**伤害结算方法 */
    damage_calculate(distance:number){
        return 3 - distance
    }
}   



/**
7水晶 老陈大 上帝之手：为所有己方英雄治疗4/6/8点生命值


 */
@ca_register_ability()
export class TrickSkill_shangdizhishou extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "66"
    ability_select_type: select_type = select_type.自己;
    constructor(){
        super("TrickSkill_shangdizhishou")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        const hero = GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID()).IndexGet(3) as Unit
        super.spell_skill(table)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    const _damage = new damage(hero,target)
                    _damage.spell_skill_settlement(this.damage_calculate(math.abs(hero.Index - target.Index)),hero)
                }   
            }
        })
    }

    /**伤害结算方法 */
    damage_calculate(distance:number){
        return 3 - distance
    }
}   


/**
6水晶 NEC大 死神镰刀：眩晕一名敌方英雄，并对改单位造成等同于（当前其以损失的生命值）的伤害
 */
@ca_register_ability()
export class TrickSkill_sishenliandao extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "36"
    ability_select_type: select_type = select_type.自己;
    constructor(){
        super("TrickSkill_sishenliandao")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        const hero = GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID()).IndexGet(3) as Unit
        super.spell_skill(table)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    const _damage = new damage(hero,target)
                    _damage.spell_skill_settlement(this.damage_calculate(math.abs(hero.Index - target.Index)),hero)
                }   
            }
        })
    }

    /**伤害结算方法 */
    damage_calculate(distance:number){
        return 3 - distance
    }
}   



/**
6水晶 飞机大 召唤飞弹：对本条兵线上的所有敌方单位造成2次2/3/5点伤害
 */
@ca_register_ability()
export class TrickSkill_zhaohuanfeidan extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "36"
    ability_select_type: select_type = select_type.自己;
    constructor(){
        super("TrickSkill_zhaohuanfeidan")
    }

    spell_skill(table:(Unit|number)[],target?:string){
        // const hero = GameRules.SceneManager.get_hero(this.heorheroid) as Unit
        const hero = GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID()).IndexGet(3) as Unit
        super.spell_skill(table)
        table.forEach(target=>{
            if(typeof(target) != 'number'){
                if(target.Index){
                    const _damage = new damage(hero,target)
                    _damage.spell_skill_settlement(this.damage_calculate(math.abs(hero.Index - target.Index)),hero)
                }   
            }
        })
    }

    /**伤害结算方法 */
    damage_calculate(distance:number){
        return 3 - distance
    }
}   