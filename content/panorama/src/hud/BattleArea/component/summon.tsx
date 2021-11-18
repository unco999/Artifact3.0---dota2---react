import React, { useMemo } from "react";

export const Summon = (props:{index:number,uuid:string,owner:number}) =>{
    const prefix = useMemo(()=> props.owner == Players.GetLocalPlayer() ? "my_" : "you_",[props])
    return <Panel className={prefix + "summon"}/>
}