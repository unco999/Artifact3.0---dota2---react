import { damage } from "../feature/damage";
import { Timers } from "../lib/timers";
import { reloadable } from "../lib/tstl-utils";
import { Card, CardParameter, CARD_TYPE, professionalMagicCard } from "./Card";
import { ICAScene } from "./Scenes";
import { Unit } from "./Unit";

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
    "双方"
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

    GetAbility(heroid:string){
        print("容器返回实例heroid为",heroid,this.Container[heroid] == null)
        return this.Container[heroid]
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
        return {skillSubject:this.hasHero,name:this.abilityInstance.heroid}
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



export class ability_templater{
    id:string
    consumption:number //消耗水晶
    heroid:string;
    Magic_brach:Magic_brach
    Magic_team:Magic_team
    Magic_range:Magic_range

    spell_skill(table:(Unit|number)[],target?:string){

    }

    constructor(id:string){
        this.id = id
    }
}

@ca_register_ability()
export class SmallSkill_leiji extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid="1"

    constructor(){
        super("SmallSkill_leiji")
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
 * 决斗
 */
@ca_register_ability()
export class SmallSkill_juedou extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid="2"

    constructor(){
        super("SmallSkill_juedou")
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
 * 爆头
 */
 @ca_register_ability()
 export class SmallSkill_baotou extends ability_templater{
     Magic_brach = Magic_brach.对格
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.单体
     heroid="3"
     constructor(){
         super("SmallSkill_baotou")
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
 * 幻影突袭
 */
  @ca_register_ability()
  export class SmallSkill_huanyingtuxi  extends ability_templater{
      Magic_brach = Magic_brach.对格
      Magic_team = Magic_team.敌方
      Magic_range = Magic_range.单体
      heroid="4"

      constructor(){
          super("SmallSkill_huanyingtuxi")
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
 * 淘汰之刃
 */
  @ca_register_ability()
  export class SmallSkill_taotaizhiren extends ability_templater{
      Magic_brach = Magic_brach.对格
      Magic_team = Magic_team.敌方
      Magic_range = Magic_range.单体
      heroid ="5"
  
      constructor(){
          super("SmallSkill_taotaizhiren")
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
 * 严寒灼烧
 */
 @ca_register_ability()
 export class SmallSkill_yanhanzhuoshao extends ability_templater{
     Magic_brach = Magic_brach.对格
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.单体
     heroid="5"

     constructor(){
         super("SmallSkill_yanhanzhuoshao")
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
 * 洗礼
 */
 @ca_register_ability()
 export class SmallSkill_xili extends ability_templater{
     Magic_brach = Magic_brach.对格
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.单体
     heroid = "7"
 
     constructor(){
         super("SmallSkill_xili")
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
 * 龙破斩
 */
 @ca_register_ability()
 export class SmallSkill_longpizhan extends ability_templater{
     Magic_brach = Magic_brach.对格
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.单体
     heroid = "8"
 
     constructor(){
         super("SmallSkill_longpizhan")
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
 * 恶魔转化 
 */
 @ca_register_ability()
 export class SmallSkill_emozhuanhua extends ability_templater{
     Magic_brach = Magic_brach.对格
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.单体
     heroid="9"
 
     constructor(){
         super("SmallSkill_emozhuanhua")
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
 * 传送 
 */
 @ca_register_ability()
 export class SmallSkill_chuansong extends ability_templater{
     Magic_brach = Magic_brach.对格
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.单体
     heroid = "11"
 
     constructor(){
         super("SmallSkill_chuansong")
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
 * 洪流 
 */
 @ca_register_ability()
 export class SmallSkill_hongliu extends ability_templater{
     Magic_brach = Magic_brach.对格
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.单体
     heroid = "12"
 
     constructor(){
         super("SmallSkill_hongliu")
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
 * 惑幻：召唤一个等同于恐怖利刃基础数值的幻想
 */
 @ca_register_ability()
 export class SmallSkill_huohuan extends ability_templater{
     Magic_brach = Magic_brach.对格
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.单体
     heroid = "13"
 
     constructor(){
         super("SmallSkill_huohuan")
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
 * 雷神之怒：对所有兵线上的每名敌方英雄造成3/5/7点纯粹伤害
 */
 @ca_register_ability()
 export class TrickSkill_leishenzhinu extends ability_templater{
     Magic_brach = Magic_brach.对格
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.单体
     heroid = "1"
 
     constructor(){
         super("TrickSkill_leishenzhinu")
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
 * 强攻：解除一个友方单位的控制效果，并获得4攻击力回复4生命值
 */
 @ca_register_ability()
 export class TrickSkill_qianggong extends ability_templater{
     Magic_brach = Magic_brach.对格
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.单体
     heroid = "2"
 
     constructor(){
         super("TrickSkill_qianggong")
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
 * 暗杀：对一个敌方单位造成10点纯粹伤害并眩晕（跨线技能）
 */
 @ca_register_ability()
 export class TrickSkill_ansha extends ability_templater{
     Magic_brach = Magic_brach.对格
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.单体
     heroid = "3"
 
     constructor(){
         super("TrickSkill_ansha")
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
 * 暗杀：对一个敌方单位造成10点纯粹伤害并眩晕（跨线技能）
 */
 @ca_register_ability()
 export class TrickSkill_encijietuo extends ability_templater{
     Magic_brach = Magic_brach.对格
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.单体
     heroid = "4"
 
     constructor(){
         super("TrickSkill_encijietuo")
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
 * 狂战士之吼：斧王与敌方近邻战斗
 */
 @ca_register_ability()
 export class TrickSkill_kuangzhanshizhihou extends ability_templater{
     Magic_brach = Magic_brach.对格
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.单体
     heroid = "5"
 
     constructor(){
         super("TrickSkill_kuangzhanshizhihou")
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
    寒冬诅咒：选择一个敌方英雄，使其与另一个敌方英雄决斗
 */
 @ca_register_ability()
 export class TrickSkill_handongzuzhou extends ability_templater{
     Magic_brach = Magic_brach.对格
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.单体
     heroid = "6"
 
     constructor(){
         super("TrickSkill_handongzuzhou")
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
    守护天使：使本回合所有的友方单位获得伤害免疫
 */
    @ca_register_ability()
    export class TrickSkill_shouhutianshi  extends ability_templater{
        Magic_brach = Magic_brach.对格
        Magic_team = Magic_team.敌方
        Magic_range = Magic_range.单体
        heroid = "7"
    
        constructor(){
            super("TrickSkill_shouhutianshi")
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
    神灭斩：对一个敌方单位造11/14/17点魔法伤害
 */
    @ca_register_ability()
    export class TrickSkill_mieshenzhan  extends ability_templater{
        Magic_brach = Magic_brach.对格
        Magic_team = Magic_team.敌方
        Magic_range = Magic_range.单体
        heroid = "8"
    
        constructor(){
            super("TrickSkill_mieshenzhan")
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
黑洞：对正面3格单位造成眩晕，并造成5/7/10点魔法伤害

 */
    @ca_register_ability()
    export class TrickSkill_heidong  extends ability_templater{
        Magic_brach = Magic_brach.对格
        Magic_team = Magic_team.敌方
        Magic_range = Magic_range.单体
        heroid = "9"
    
        constructor(){
            super("TrickSkill_heidong")
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
集中火力：选择一个敌方单位或者敌方防御塔造成3次5/6/8点纯粹伤害


 */
@ca_register_ability()
export class TrickSkill_jizhonghuoli  extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "10"

    constructor(){
        super("TrickSkill_jizhonghuoli")
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
自然的召唤：召唤3攻6血的小树人直到上限

 */
@ca_register_ability()
export class TrickSkill_zirandezhaohuan extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "11"

    constructor(){
        super("TrickSkill_zirandezhaohuan")
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
幽灵船：对一个敌方英雄施放一艘船使其眩晕并造成6点伤害，路径上的所有友方英雄获得2点抗性（跨线技能）

 */
@ca_register_ability()
export class TrickSkill_youlingchuan extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid="12"

    constructor(){
        super("TrickSkill_youlingchuan")
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
魂断：选择一个单位，使恐怖利刃和其交换当前生命值
 */
@ca_register_ability()
export class TrickSkill_hunduan extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "13"

    constructor(){
        super("TrickSkill_hunduan")
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
毁灭：本回合眩晕所有敌方单位，并造成2/3/4点物理伤害
 */
@ca_register_ability()
export class TrickSkill_huimie extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid= "14"

    constructor(){
        super("TrickSkill_huimie")
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
 * 冲击波：对本路全体敌方单位造成5/7/10点魔法伤害

 */
@ca_register_ability()
export class TrickSkill_chongjibo extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "15"

    constructor(){
        super("TrickSkill_chongjibo")
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
幽冥轰爆：对敌方近邻和防御塔造成5/7/10点伤害


 */
 @ca_register_ability()
 export class TrickSkill_youminghongbao extends ability_templater{
     Magic_brach = Magic_brach.对格
     Magic_team = Magic_team.敌方
     Magic_range = Magic_range.单体
     heroid="16"
 
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
    heroid = "17"

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
    heroid = "18"

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
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "19"

    constructor(){
        super("TrickSkill_yexingzhaohuanzhanying")
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
机械行军：对所有兵线上的敌方单位造成3/4/6点魔法伤害
 */
@ca_register_ability()
export class TrickSkill_jixiexingjun extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "20"

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
    heroid = "14"

    constructor(){
        super("SmallSkill_julang")
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
"致盲之光：将一个敌方单位移动到另一个敌方空格中，并对其造成3/5/8点魔法伤害

"

 */
@ca_register_ability()
export class SmallSkill_zhimangzhiguang extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid ="15"

    constructor(){
        super("SmallSkill_zhimangzhiguang")
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
生命汲取：选择一个单位造成3/5/8点伤害，并恢复帕格纳等量生命值
 */
@ca_register_ability()
export class SmallSkill_shengmingjiqu extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = '16'

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
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = '10'

    constructor(){
        super("SmallSkill_suboji")
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
巨力重击：眩晕对格敌方单位，并使其移动到一个敌方空格内
 */
@ca_register_ability()
export class SmallSkill_julizhongji extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "17"

    constructor(){
        super("SmallSkill_julizhongji")
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
照明火箭：选择一个敌方单位对其近邻造成3/5/7点物理伤害（跨线技能）

 */
@ca_register_ability()
export class SmallSkill_zhaominghuojian extends ability_templater{
    Magic_brach = Magic_brach.对格
    Magic_team = Magic_team.敌方
    Magic_range = Magic_range.单体
    heroid = "18"
    constructor(){
        super("SmallSkill_zhaominghuojian")
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