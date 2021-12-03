import React, { useEffect, useMemo, useState } from "react";
import { useGameEvent } from "react-panorama";

export const Tower = (props:{owner:number,index:number}) =>{
    const prefix = useMemo(()=> props.owner == Players.GetLocalPlayer() ? "my_" : "you_",[props])
    const [state,setstate] = useState<{
        heal: number;
        state: "death" | "defualt";
    }>() 

    useGameEvent("S2C_SEND_TOWER",(event)=>{
        $.Msg("收到event",event)
        setstate(event)
    },[prefix])

    useEffect(()=>{
        GameEvents.SendCustomGameEventToServer("C2S_GET_TOWER",{index:props.index})
    },[prefix])

    return <Panel className={prefix + "tower" + props.index}> 
        <Label text={state?.heal}/>
    </Panel>
}
