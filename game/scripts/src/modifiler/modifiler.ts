import { Hero } from "../instance/Hero";
import { CAModifiler, ca_register_modifiler, HOOK, modifilertype } from "../instance/Modifiler";
import { BattleArea } from "../instance/Scenes";
import { Unit } from "../instance/Unit";
import { Timers } from "../lib/timers";

/**狂战斧 */
@ca_register_modifiler()
export class item_bfury_modifiler extends CAModifiler{
    name: string = "item_bfury_modifiler";
    modifilertype: modifilertype = modifilertype.原始;
    duration: number = 9999;
    debuff: boolean = false;

    constructor(){
        super("item_bfury_modifiler")
        print("创造了装备的modifiler")
    }

    constructorinstance = item_bfury_modifiler

    register_hook_event() {
        this.setHookEvent(HOOK.创造时,()=>{
            this.thisHero.max_heal += this.influenceMaxheal
            this.thisHero.heal = this.thisHero.max_heal
            return false})
        this.setHookEvent(HOOK.销毁时,()=>{
            this.logoutHook()
            return true
        })
        this.setHookEvent(HOOK.攻击前,()=>{
            print("狂战斧生效了")
            const {left,center,right} =  GameRules.SceneManager.enemyneighbor(this.thisHero)
            if(center && typeof(center) != "number"){
                center.hurt(this.thisHero.attack,this.thisHero,"defualt")
                CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT",{uuid:center.UUID,lookAt:"0 0 0",paticle:"particles/econ/items/ursa/ursa_swift_claw/ursa_swift_claw_right.vpcf",cameraOrigin:"0 500 0"})
            }
            if(left && typeof(left) != "number"){
                center.hurt(3,this.thisHero,"defualt")
                CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT",{uuid:left.UUID,lookAt:"0 0 0",paticle:"particles/econ/items/ursa/ursa_swift_claw/ursa_swift_claw_right.vpcf",cameraOrigin:"0 500 0"})
            }
            if(right && typeof(right) != "number"){
                center.hurt(3,this.thisHero,"defualt")
                CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT",{uuid:right.UUID,lookAt:"0 0 0",paticle:"particles/econ/items/ursa/ursa_swift_claw/ursa_swift_claw_right.vpcf",cameraOrigin:"0 500 0"})
            }
            if(!center){
               const tower = GameRules.TowerGeneralControl.getCardScenceTower(PlayerResource.GetPlayer(this.thisHero.PlayerID),this.thisHero)
               tower.hurt(this.thisHero.Getattack)
            }
            return true
        })
    }


    get influenceMaxheal(): any {
        return 0
    }

    get influenceAttack(): any {
        return 3
    }

    get influenceArrmor(): any {
        return 0
    }
    
    get influenceheal(): any {
        return 0
    }

}

/**
 * 免死甲
 */
@ca_register_modifiler()
export class item_force_field_modifiler extends CAModifiler{
    name: string = "item_force_field_modifiler";
    modifilertype: modifilertype = modifilertype.原始;
    duration: number = 9999;
    debuff: boolean = false;

    constructor(){
        super("item_force_field_modifiler")
        print("创造了装备的modifiler")
    }

    constructorinstance = item_force_field_modifiler

    register_hook_event() {
        this.setHookEvent(HOOK.死亡前,(thishero:Hero,source:Unit)=>{
            print("触动了免死金牌")
            if(thishero){
                thishero.heal = 1
                thishero.updateAttribute()
            }
            CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT",{uuid:thishero.UUID,paticle:"particles/units/heroes/hero_fairy/fairy_revive.vpcf",cameraOrigin:'0 300 0',lookAt:'0 0 0'})
            this.logoutHook()
            return true
        })
    }


    get influenceMaxheal(): any {
        return 0
    }

    get influenceAttack(): any {
        return 3
    }

    get influenceArrmor(): any {
        return 1
    }
    
    get influenceheal(): any {
        return 0
    }

}

/**
 * 复活甲
 */
@ca_register_modifiler()
export class item_aegis_modifiler extends CAModifiler{
    name: string = "item_aegis_modifiler";
    modifilertype: modifilertype = modifilertype.原始;
    duration: number =9999;
    debuff: boolean = false;
    preDeathIndex:number //死亡前的序号
    preDeathBrach:string //死亡前的场景名字

    constructor(){
        super("item_aegis_modifiler")
        print("创造了装备的modifiler")
    }

    constructorinstance = item_aegis_modifiler

    register_hook_event() {
        this.setHookEvent(HOOK.死亡前,(thishero:Hero,source:Unit)=>{
            print("记录了单位死亡的数据")
            let index = thishero.Index
            let SceneName = thishero.Scene.SceneName
            this.preDeathIndex = index
            this.preDeathBrach = SceneName
            return true
        })
        this.setHookEvent(HOOK.死亡后,(thishero:Hero,source:Unit)=>{
            print("触发了死亡后特效")
            Timers.CreateTimer(2,()=>{
                thishero.heal = this.thisHero.max_heal
                CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTRIBUTE",thishero.attribute)
                GameRules.SceneManager.change_secens(thishero.UUID,this.preDeathBrach,this.preDeathIndex,false)
                CustomGameEventManager.Send_ServerToAllClients("SC2_PLAY_EFFECT",{uuid:thishero.UUID,paticle:"particles/econ/items/wraith_king/wraith_king_arcana/wk_arc_reincarn_tombstone_ring_flames.vpcf",cameraOrigin:"0 400 0",lookAt:"0 0 0"})
                this.logoutHook()
            })
            return false
        })
    }


    get influenceMaxheal(): any {
        return 0
    }

    get influenceAttack(): any {
        return 3
    }

    get influenceArrmor(): any {
        return 1
    }
    
    get influenceheal(): any {
        return 0
    }

}




/**
 * 严寒灼烧
 */
 @ca_register_modifiler()
 export class abyssal_underlord_pit_of_malice_modifiler extends CAModifiler{
     name: string = "abyssal_underlord_pit_of_malice_modifiler";
     modifilertype: modifilertype = modifilertype.原始;
     duration: number = 1;
     debuff: boolean = false;
     preDeathIndex:number //死亡前的序号
     preDeathBrach:string //死亡前的场景名字
 
     constructor(){
         super("abyssal_underlord_pit_of_malice_modifiler")
         print("创造了装备的modifiler")
     }
 
     constructorinstance = item_force_field_modifiler
 
     register_hook_event() {
         this.setHookEvent(HOOK.创造时,()=>{
            this.duration = 1
            return false
         })
         this.setHookEvent(HOOK.死亡后,()=>{
             this.thisHero.removeModifiler(this.name)
             return true
         })
     }
 
 
     get influenceMaxheal(): any {
         return 0
     }
 
     get influenceAttack(): any {
         return 5
     }
 
     get influenceArrmor(): any {
         return 0
     }
     
     get influenceheal(): any {
         return 0
     }
 
 }


 /**
 * 通用眩晕1回合modifiler
 */
  @ca_register_modifiler()
  export class stund1round_modifiler extends CAModifiler{
      name: string = "stund1round_modifiler";
      modifilertype: modifilertype = modifilertype.晕眩;
      duration: number = 1;
      debuff: boolean = true;
  
      constructor(){
          super("stund1round_modifiler")
      }
  
      constructorinstance = stund1round_modifiler
  
      register_hook_event() {
          this.setHookEvent(HOOK.攻击前,(thishero:Unit)=>{
              return true
          })
      }
  
  
      get influenceMaxheal(): any {
          return 0
      }
  
      get influenceAttack(): any {
          return 0
      }
  
      get influenceArrmor(): any {
          return 0
      }
      
      get influenceheal(): any {
          return 0
      }
  
  }

  
 /**
 * 通用1回合伤害免疫modifiler
 */
  @ca_register_modifiler()
  export class shanghaimianyi_modifiler extends CAModifiler{
      name: string = "shanghaimianyi_modifiler";
      modifilertype: modifilertype = modifilertype.原始;
      duration: number = 1;
      debuff: boolean = true;
  
      constructor(){
          super("shanghaimianyi_modifiler")
      }
  
      constructorinstance = shanghaimianyi_modifiler
  
      register_hook_event() {
          this.setHookEvent(HOOK.被攻击前,(attack_type:"defualt"|"ability"|"purely",Source:Unit)=>{
              print("触发了攻击前特效=====守护天使")
              if(attack_type == 'purely'){
                  print("当前攻击为纯粹伤害,无法免伤")
                  this.thisHero.removeModifiler(this.name)
                  return false
              }
              this.thisHero.removeModifiler(this.name)
              return true
          })
      }
  
  
      get influenceMaxheal(): any {
          return 0
      }
  
      get influenceAttack(): any {
          return 0
      }
  
      get influenceArrmor(): any {
          return 0
      }
      
      get influenceheal(): any {
          return 0
      }
  
  }


   /**
 * 强攻modifiler
 */
@ca_register_modifiler()
export class qianggong_modifiler extends CAModifiler{
        name: string = "qianggong_modifiler";
        modifilertype: modifilertype = modifilertype.原始;
        duration: number = 1;
        debuff: boolean = false;
    
        constructor(){
            super("qianggong_modifiler")
        }
    
        constructorinstance = qianggong_modifiler
    
        register_hook_event() {
            let _modifiler:string
            this.setHookEvent(HOOK.创造时,(thishero:Unit)=>{
                const bool = thishero.isunableToAttack()
                for(const modifiler of thishero.Modifilers){
                   if(modifiler.modifilertype != modifilertype.原始){
                       _modifiler = modifiler.name
                   }
                }
                thishero.removeModifiler(_modifiler)
                return false
            })
        }
    
    
        get influenceMaxheal(): any {
            return 0
        }
    
        get influenceAttack(): any {
            return 4
        }
    
        get influenceArrmor(): any {
            return 0
        }
        
        get influenceheal(): any {
            return 0
        }
    
}


   /**
 * 强攻modifiler
 */
    @ca_register_modifiler()
    export class julang_modifiler extends CAModifiler{
        name: string = "qianggong_modifiler";
        modifilertype: modifilertype = modifilertype.原始;
        duration: number = 1;
        debuff: boolean = false;
    
        constructor(){
            super("julang_modifiler")
        }
    
        constructorinstance = julang_modifiler
    
        register_hook_event() {
        }
    
    
        get influenceMaxheal(): any {
            return 0
        }
    
        get influenceAttack(): any {
            return 4
        }
    
        get influenceArrmor(): any {
            return -2
        }
        
        get influenceheal(): any {
            return 0
        }
    
}


   /**
 * 幽灵船modifiler
 */
    @ca_register_modifiler()
    export class youlingchuan_modifiler extends CAModifiler{
        name: string = "youlingchuan_modifiler";
        modifilertype: modifilertype = modifilertype.原始;
        duration: number = 1;
        debuff: boolean = false;
    
        constructor(){
            super("youlingchuan_modifiler")
        }
    
        constructorinstance = youlingchuan_modifiler
    
        register_hook_event() {

        }
    
    
        get influenceMaxheal(): any {
            return 0
        }
    
        get influenceAttack(): any {
            return 0
        }
    
        get influenceArrmor(): any {
            return 2
        }
        
        get influenceheal(): any {
            return 0
        }
    
}




   /**
 * 魔晶的modifiler
 */
    @ca_register_modifiler()
    export class item_aghanims_shard_modifiler extends CAModifiler{
        name: string = "item_aghanims_shard_modifiler";
        modifilertype: modifilertype = modifilertype.原始;
        duration: number = 9999;
        debuff: boolean = false;
    
        constructor(){
            super("item_aghanims_shard_modifiler")
        }
    
        constructorinstance = item_aghanims_shard_modifiler
    
        register_hook_event() {
        }
    
        get influenceMaxheal(): any {
            return 0
        }
    
        get influenceAttack(): any {
            return 0
        }
    
        get influenceArrmor(): any {
            return 0
        }
        
        get influenceheal(): any {
            return 0
        }
    
        get faulty(){
            return 1
        }
}


   /**
 * 魔晶的modifiler
 */
    @ca_register_modifiler()
    export class item_ultimate_scepter_modifiler extends CAModifiler{
        name: string = "item_ultimate_scepter_modifiler";
        modifilertype: modifilertype = modifilertype.原始;
        duration: number = 9999;
        debuff: boolean = false;
    
        constructor(){
            super("item_ultimate_scepter_modifiler")
        }
    
        constructorinstance = item_ultimate_scepter_modifiler
    
        register_hook_event() {
        }
    
        get influenceMaxheal(): any {
            return 0
        }
    
        get influenceAttack(): any {
            return 0
        }
    
        get influenceArrmor(): any {
            return 0
        }
        
        get influenceheal(): any {
            return 0
        }
    
        get faulty(){
            return 1
        }
}

