export class energyBarManager{
    //采用玩家ID+指定路线数字ID为KEY
    enrgyBarData:Record<string,energyBar> = {}
    constructor(){
        this.enrgyBarData[GameRules.Blue.GetPlayerID() + "1"] = new energyBar(1,GameRules.Blue)  //上路能量条
        this.enrgyBarData[GameRules.Blue.GetPlayerID() + "2"] = new energyBar(2,GameRules.Blue)  //中能量条
        this.enrgyBarData[GameRules.Blue.GetPlayerID() + "3"] = new energyBar(3,GameRules.Blue)  //下路能量条
        this.enrgyBarData[GameRules.Red.GetPlayerID() + "1"] = new energyBar(1,GameRules.Red)  //上路能量条
        this.enrgyBarData[GameRules.Red.GetPlayerID() + "2"] = new energyBar(2,GameRules.Red)  //中路能量条
        this.enrgyBarData[GameRules.Red.GetPlayerID() + "3"] = new energyBar(3,GameRules.Red)  //下路能量条
    }

}

export class energyBar{
    player:CDOTAPlayer
    init_energy:number
    max_energy:number
    current_max:number
    current_energy:number
    brach:number
    uuid = DoUniqueString(GetSystemTime())

    constructor(brach:number,player:CDOTAPlayer){
        this.brach = brach;
        this.init_energy = 5;
        this.current_max = this.init_energy
        this.max_energy = 10
        this.current_energy = this.init_energy;
        this.player = player
        this.register_gamevent()
    }

    
    register_gamevent(){
        CustomGameEventManager.RegisterListener("C2S_GET_INIT_ENRGY",(_,event)=>{
           print("123收到事件",event)
           DeepPrintTable(event)
           if(event.brach != this.brach) return
           if(event.playerid != this.player.GetPlayerID()) return;
           const player = PlayerResource.GetPlayer(event.playerid)         
           print("服务端1收到初始化事件",event)                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
           CustomGameEventManager.Send_ServerToPlayer(player,"S2C_SEND_INIT_ENRGY",{cuurent_max:this.current_max,uuid:this.uuid,brach:this.brach,current_enrgy:this.current_energy,max_enrgy:this.max_energy,playerid:player.GetPlayerID()})
        })
        CustomGameEventManager.RegisterListener("C2S_GET_ENRGY",(_,event)=>{
            if(event.uuid != this.uuid) return;
            CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ENRGY",{cuurent_max:this.current_max,uuid:this.uuid,current_enrgy:this.current_energy,max_enrgy:this.max_energy})
        })
    }

    roundReply(count:number){
        this.max_energy += count
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ENRGY",{cuurent_max:this.current_max,uuid:this.uuid,current_enrgy:this.current_energy,max_enrgy:this.max_energy})
    }

    reduceEnergy(count:number){
        this.max_energy -= count
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ENRGY",{cuurent_max:this.current_max,uuid:this.uuid,current_enrgy:this.current_energy,max_enrgy:this.max_energy})
    }

    current_max_enrygy_add(count:number){
        this.current_max += count
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ENRGY",{cuurent_max:this.current_max,uuid:this.uuid,current_enrgy:this.current_energy,max_enrgy:this.max_energy})
    }
}