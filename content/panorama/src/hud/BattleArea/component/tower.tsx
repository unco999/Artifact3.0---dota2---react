import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGameEvent } from "react-panorama";

export const Tower = (props:{owner:number,index:number}) =>{
    const prefix = useMemo(()=> props.owner == Players.GetLocalPlayer() ? "my_" : "you_",[props])
    const uuid = useRef("")
    const [state,setstate] = useState<{
        heal: number;
        state: "death" | "defualt";
        brach: number;
        playerid: PlayerID;
        uuid: string;
    }>() 

    useGameEvent("S2C_SEND_TOWER",(event)=>{
        if(uuid.current != event.uuid) return
        $.Msg(props.owner,"玩家的",props.index,"uuid:"+uuid.current,"编号受到伤害!")
        setstate(event)
    },[prefix])

    useEffect(()=>{
        const id = GameEvents.Subscribe("S2C_TOWER_INIT",(event)=>{
            if(event.brach != props.index) return
            if(event.playerid != props.owner) return;
            setstate({...event,state:"defualt"})
            uuid.current = event.uuid
            $.Msg("塔的编号为",props.owner +","+ props.index,uuid)
            return () => GameEvents.Unsubscribe(id)
        })
        GameEvents.SendCustomGameEventToServer("C2S_TOWER_INIT",{owner:props.owner as PlayerID,brach:props.index})
    },[prefix])

    useEffect(()=>{
        GameEvents.SendCustomGameEventToServer("C2S_GET_TOWER",{index:props.index})
    },[prefix])

    return <Panel className={prefix + "tower" + props.index}> 
        <Label text={state?.heal} />
    </Panel>
}
