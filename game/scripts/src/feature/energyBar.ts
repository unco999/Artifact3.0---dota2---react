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
        this.register_gamevent()
    }

    register_gamevent(){
        CustomGameEventManager.RegisterListener("C2S_GET_INIT_ENRGY",(_,event)=>{
            const data = this.enrgyBarData[event.PLAYER.toString() + event.brach.toString()]
            print("服务器发送能量请求")
            CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(event.PlayerID),"S2C_SEND_INIT_ENRGY",{brach:data.brach,max_enrgy:data.max_energy,current_enrgy:data.current_energy,uuid:data.uuid,cuurent_max:data.current_max,playerid:data.player.GetPlayerID()})
        }
        )
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
        CustomGameEventManager.RegisterListener("C2S_GET_ENRGY",(_,event)=>{
            if(event.uuid != this.uuid) return;
            CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ENRGY",{cuurent_max:this.current_max,uuid:this.uuid,current_enrgy:this.current_energy,max_enrgy:this.max_energy})
        })
    }

    /** 增加最大能量值 */
    add_cuurent_max_reply(count:number){
        this.max_energy += count
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ENRGY",{cuurent_max:this.current_max,uuid:this.uuid,current_enrgy:this.current_energy,max_enrgy:this.max_energy})
    }

    /***操作当前能量 */
    add_cuurent_energy(count:number){
        this.current_energy += count
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ENRGY",{cuurent_max:this.current_max,uuid:this.uuid,current_enrgy:this.current_energy,max_enrgy:this.max_energy})
    }


    /**增加当前能量上线*/
    current_max_enrygy_add(count:number){
        this.current_max += count
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ENRGY",{cuurent_max:this.current_max,uuid:this.uuid,current_enrgy:this.current_energy,max_enrgy:this.max_energy})
    }
}