export class TowerGeneralControl{
    TowerDate = new Map()

    constructor(){
        this.TowerDate.set(GameRules.Blue.GetPlayerID() + 1,new Tower(GameRules.Blue,1))
        this.TowerDate.set(GameRules.Blue.GetPlayerID() + 2,new Tower(GameRules.Blue,2))
        this.TowerDate.set(GameRules.Blue.GetPlayerID() + 3,new Tower(GameRules.Blue,3))
        this.TowerDate.set(GameRules.Red.GetPlayerID() + 1,new Tower(GameRules.Red,1))
        this.TowerDate.set(GameRules.Red.GetPlayerID() + 2,new Tower(GameRules.Red,2))
        this.TowerDate.set(GameRules.Red.GetPlayerID() + 3,new Tower(GameRules.Red,3))
    }


    getPlayerTower(player:CDOTAPlayer,index:number){
      return this.TowerDate.get(player.GetPlayerID() + index)
    }


}

export class Tower{
    Player:CDOTAPlayer
    branch:number
    maxheal:number = 30
    cuurentheal:number = 30
    state:"death"|"defualt"

    constructor(player:CDOTAPlayer,branch:number){
        this.Player = player
        this.branch = branch
        this.reigster_gamevent()
    }
    
    reigster_gamevent(){
        CustomGameEventManager.RegisterListener("C2S_GET_TOWER",(_,event)=>{
            if(this.branch == event.index){
                CustomGameEventManager.Send_ServerToPlayer(this.Player,"S2C_SEND_TOWER",{heal:this.cuurentheal,state:this.state})
            }
        })
        CustomGameEventManager.RegisterListener("C2S_ATTACK_TOWER",(_,event)=>{
            if(this.Player.GetPlayerID() == event.PlayerID && this.branch == event.index){
                this.hurt(event.damage)
            }
        })
    }

    hurt(damage:number){
        if(this.cuurentheal -damage <= 0){
            this.cuurentheal = 0
            this.state = 'death'
            CustomGameEventManager.Send_ServerToPlayer(this.Player,"S2C_SEND_TOWER",{heal:this.cuurentheal,state:this.state})
            return
        }
        this.cuurentheal -= damage
        CustomGameEventManager.Send_ServerToPlayer(this.Player,"S2C_SEND_TOWER",{heal:this.cuurentheal,state:this.state})
    }

    reply(heal:number){
        if(this.cuurentheal + heal >= this.maxheal){
            this.cuurentheal = this.maxheal
            CustomGameEventManager.Send_ServerToPlayer(this.Player,"S2C_SEND_TOWER",{heal:this.cuurentheal,state:this.state})
            return
        }
        this.cuurentheal += heal
        CustomGameEventManager.Send_ServerToPlayer(this.Player,"S2C_SEND_TOWER",{heal:this.cuurentheal,state:this.state})
    }

    



}