import { Card } from "./Card";
import { GoUp, LaidDown, Midway } from "./Scenes";

export class TowerGeneralControl{
    TowerDate = new Map()
    whetherTheFirstTowerDie:Record<number,boolean> = {[GameRules.Red.GetPlayerID()]:false,[GameRules.Blue.GetPlayerID()]:false} //记录是否第一个塔死亡了

    constructor(){
        this.TowerDate.set(GameRules.Blue.GetPlayerID() + "1",new Tower(GameRules.Blue,1))
        this.TowerDate.set(GameRules.Blue.GetPlayerID() + "2",new Tower(GameRules.Blue,2))
        this.TowerDate.set(GameRules.Blue.GetPlayerID() + "3",new Tower(GameRules.Blue,3))
        this.TowerDate.set(GameRules.Red.GetPlayerID() + "1",new Tower(GameRules.Red,1))
        this.TowerDate.set(GameRules.Red.GetPlayerID() + "2",new Tower(GameRules.Red,2))
        this.TowerDate.set(GameRules.Red.GetPlayerID() + "3",new Tower(GameRules.Red,3))
    }

    foeatch(cb:Function){
        this.TowerDate.forEach((value,key)=>{
            cb(value)
        })
    }

    getPlayerTower(player:CDOTAPlayer,index:number):Tower{
        print("找到的塔位置",player.GetPlayerID(),index)
        return this.TowerDate.get(player.GetPlayerID().toString() + index.toString())
    }

    /**通过卡的场景找到对方塔的位置 */
    getCardScenceTower(player:CDOTAPlayer,Card:Card):Tower{
        if(Card.Scene instanceof Midway){
            print("找到中路的塔")
            return this.TowerDate.get(player.GetPlayerID() == GameRules.Blue.GetPlayerID() ? GameRules.Red.GetPlayerID() + "2": GameRules.Blue.GetPlayerID() + "2")
        }
        if(Card.Scene instanceof GoUp){
            print("找到上路的塔")
            return this.TowerDate.get(player.GetPlayerID() == GameRules.Blue.GetPlayerID() ? GameRules.Red.GetPlayerID() + "1": GameRules.Blue.GetPlayerID() + "1")
        }
        if(Card.Scene instanceof LaidDown){
            print("找到下路的塔")
            return this.TowerDate.get(player.GetPlayerID() == GameRules.Blue.GetPlayerID() ? GameRules.Red.GetPlayerID() + "3": GameRules.Blue.GetPlayerID() + "3")
        }
    }


}

export class Tower{
    Player:CDOTAPlayer
    branch:number
    maxheal:number = 40
    cuurentheal:number = 40
    state:"death"|"defualt"
    uuid = DoUniqueString(GetSystemTime())
    isbase:boolean = false

    constructor(player:CDOTAPlayer,branch:number){
        this.Player = player
        this.branch = branch
        this.reigster_gamevent()
    }
    
    reigster_gamevent(){
        CustomGameEventManager.RegisterListener("C2S_TOWER_INIT",(_,event)=>{
            if(this.branch == event.brach && this.Player.GetPlayerID() == event.owner){
                CustomGameEventManager.Send_ServerToAllClients("S2C_TOWER_INIT",{heal:this.cuurentheal,playerid:this.Player.GetPlayerID(),brach:this.branch,uuid:this.uuid,isbase:this.isbase})
            }
        })
        CustomGameEventManager.RegisterListener("C2S_ATTACK_TOWER",(_,event)=>{
            if(this.Player.GetPlayerID() == event.PlayerID && this.branch == event.index){
                this.hurt(event.damage)
            }
        })
    }

    high(player:PlayerID){
        CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(player),"S2C_HIGH_TOWER",{uuid:this.uuid}) 
    }

    off_high(player:PlayerID){
        CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(player),"S2C_OFF_HIGH_TOWER",{uuid:this.uuid}) 
    }

    hurt(damage:number){
        print("执行了塔受伤程序")
        if(this.cuurentheal - damage <= 0){
            if(!GameRules.TowerGeneralControl.whetherTheFirstTowerDie[this.Player.GetPlayerID()]){
                this.cuurentheal = 60
                this.isbase = true;
                GameRules.TowerGeneralControl.whetherTheFirstTowerDie[this.Player.GetPlayerID()] = true
                CustomGameEventManager.Send_ServerToAllClients("S2C_CHANGE_BASE",{uuid:this.uuid})
                CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_TOWER",{heal:this.cuurentheal,state:this.state,playerid:this.Player.GetPlayerID(),brach:this.branch,uuid:this.uuid})
                return 
            }
            if(GameRules.TowerGeneralControl.whetherTheFirstTowerDie[this.Player.GetPlayerID()]){
                GameRules.SetGameWinner(this.Player == GameRules.Red ? GameRules.Blue.GetTeam() : GameRules.Red.GetTeam() )
            }

            this.cuurentheal = 0
            this.state = 'death'
            if(this.isbase){
                GameRules.SetGameWinner(this.Player == GameRules.Red ? GameRules.Blue.GetTeam() : GameRules.Red.GetTeam() )
            }
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