import { Card } from "./Card";
import { GoUp, LaidDown, Midway } from "./Scenes";

export class TowerGeneralControl{
    TowerDate = new Map()

    constructor(){
        this.TowerDate.set(GameRules.Blue.GetPlayerID() + "1",new Tower(GameRules.Blue,1))
        this.TowerDate.set(GameRules.Blue.GetPlayerID() + "2",new Tower(GameRules.Blue,2))
        this.TowerDate.set(GameRules.Blue.GetPlayerID() + "3",new Tower(GameRules.Blue,3))
        this.TowerDate.set(GameRules.Red.GetPlayerID() + "1",new Tower(GameRules.Red,1))
        this.TowerDate.set(GameRules.Red.GetPlayerID() + "2",new Tower(GameRules.Red,2))
        this.TowerDate.set(GameRules.Red.GetPlayerID() + "3",new Tower(GameRules.Red,3))
    }


    getPlayerTower(player:CDOTAPlayer,index:number){
      return this.TowerDate.get(player.GetPlayerID() + index)
    }

    /**通过卡的场景找到对方塔的位置 */
    getCardScenceTower(player:CDOTAPlayer,Card:Card){
        if(Card.Scene instanceof Midway){
            print("找到中路的塔")
            return this.TowerDate.get(player.GetPlayerID() == GameRules.Blue.GetPlayerID() ? GameRules.Red.GetPlayerID() + "2": GameRules.Blue.GetPlayerID() + "2")
        }
        if(Card.Scene instanceof GoUp){
            print("找到上路的塔")
            return this.TowerDate.get(player.GetPlayerID() == GameRules.Blue.GetPlayerID() ? GameRules.Red.GetPlayerID() + "2": GameRules.Blue.GetPlayerID() + "1")
        }
        if(Card.Scene instanceof LaidDown){
            print("找到下路的塔")
            return this.TowerDate.get(player.GetPlayerID() == GameRules.Blue.GetPlayerID() ? GameRules.Red.GetPlayerID() + "2": GameRules.Blue.GetPlayerID() + "3")
        }
    }


}

export class Tower{
    Player:CDOTAPlayer
    branch:number
    maxheal:number = 30
    cuurentheal:number = 30
    state:"death"|"defualt"
    uuid = DoUniqueString(GetSystemTime())

    constructor(player:CDOTAPlayer,branch:number){
        this.Player = player
        this.branch = branch
        this.reigster_gamevent()
    }
    
    reigster_gamevent(){
        CustomGameEventManager.RegisterListener("C2S_TOWER_INIT",(_,event)=>{
            if(this.branch == event.brach && this.Player.GetPlayerID() == event.owner){
                CustomGameEventManager.Send_ServerToAllClients("S2C_TOWER_INIT",{heal:this.cuurentheal,playerid:this.Player.GetPlayerID(),brach:this.branch,uuid:this.uuid})
            }
        })
        CustomGameEventManager.RegisterListener("C2S_ATTACK_TOWER",(_,event)=>{
            if(this.Player.GetPlayerID() == event.PlayerID && this.branch == event.index){
                this.hurt(event.damage)
            }
        })
    }

    hurt(damage:number){
        print("执行了塔受伤程序")
        if(this.cuurentheal - damage <= 0){
            this.cuurentheal = 0
            this.state = 'death'
            CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_TOWER",{heal:this.cuurentheal,state:this.state,playerid:this.Player.GetPlayerID(),brach:this.branch,uuid:this.uuid})
            return
        }
        this.cuurentheal -= damage
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_TOWER",{heal:this.cuurentheal,state:this.state,playerid:this.Player.GetPlayerID(),brach:this.branch,uuid:this.uuid})
    }

    reply(heal:number){
        if(this.cuurentheal + heal >= this.maxheal){
            this.cuurentheal = this.maxheal
            CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_TOWER",{heal:this.cuurentheal,state:this.state,playerid:this.Player.GetPlayerID(),brach:this.branch,uuid:this.uuid})
            return
        }
        this.cuurentheal += heal
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_TOWER",{heal:this.cuurentheal,state:this.state,playerid:this.Player.GetPlayerID(),brach:this.branch,uuid:this.uuid})
    }

    



}