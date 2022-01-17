import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGameEvent, useNetTableKey } from "react-panorama";
import short from 'shortid'

export const Main = () =>{
    const team = useNetTableKey("Card_group_construction_phase","team")

    return <>
    <Information key={short.generate()} owned={Players.GetLocalPlayer() == team.red ? team.blue : team.red}/>
    <Information key={short.generate()} owned={Players.GetLocalPlayer()}/>
    </>
}

export const Information = (props:{owned:number}) =>{
    const prefix = useMemo(()=> props.owned == Players.GetLocalPlayer() ? "my_" : "you_",[props])
    const [str,setstr] = useState("")
    const ref = useRef<Panel|null>()
    const [state,usestate] = useState(false)

    useGameEvent("S2C_INFORMATION",(event)=>{
        setstr(event.information)
        usestate(value => !value)
    },[])

    useEffect(()=>{
        ref.current?.RemoveClass("labelanimtion")
        $.Schedule(1,()=>{
            ref.current?.AddClass("labelanimtion")
        })
    },[state])
    
    return <Label hittest={false} text={str} ref={panel => ref.current = panel} className={prefix + "information"}/>
}