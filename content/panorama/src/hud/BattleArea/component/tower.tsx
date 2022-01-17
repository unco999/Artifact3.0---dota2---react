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
    const ref = useRef<Panel|null>() 

    useGameEvent("S2C_SEND_TOWER",(event)=>{
        if(uuid.current != event.uuid) return
        setstate(event)
    },[prefix])


    const OnDragDrop = (_:any,dragCallbacks:any) => {
        const id = dragCallbacks.Data().id
        const cardid = dragCallbacks.Data().cardid
        GameEvents.SendCustomGameEventToServer("C2S_SPELL_TOWER",{uuid:cardid,abilityname:dragCallbacks.Data().id,towerPlayer:props.owner.toString(),towerindex:props.index})
    }


    useGameEvent("S2C_HIGH_TOWER",(event)=>{
        $.Msg("收到高亮")
        if(state?.uuid != event.uuid) return
        $.Msg("上路塔高亮了")
        ref.current?.AddClass("high")
        $.RegisterEventHandler( 'DragDrop', ref.current!, OnDragDrop );
    },[state?.uuid])

    useGameEvent("S2C_OFF_HIGH_TOWER",(event)=>{
        if(state?.uuid != event.uuid) return
        ref.current?.RemoveClass("high")
        $.RegisterEventHandler( 'DragDrop', ref.current!, ()=>{} );
    },[state?.uuid])



    useEffect(()=>{
        const id = GameEvents.Subscribe("S2C_TOWER_INIT",(event)=>{
            if(event.brach != props.index) return
            if(event.playerid != props.owner) return;
            setstate({...event,state:"defualt"})
            uuid.current = event.uuid
            return () => GameEvents.Unsubscribe(id)
        })
        GameEvents.SendCustomGameEventToServer("C2S_TOWER_INIT",{owner:props.owner as PlayerID,brach:props.index})
    },[prefix])

    useEffect(()=>{
        GameEvents.SendCustomGameEventToServer("C2S_GET_TOWER",{index:props.index})
    },[prefix])

    return <Panel ref={panel=>ref.current = panel} className={prefix + "tower" + props.index}> 
        <Label text={state?.heal} />
    </Panel>
}
