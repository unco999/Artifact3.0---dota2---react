import React, { useEffect, useRef } from "react";
import { useInstance } from "../../useUUID.tsx/useInstance";
import useUuid from "../../useUUID.tsx/useUuid";

export const Gloabtip = () => {
    const uuid = useUuid()
    const {conponent,up} = useInstance("Gloabtip",uuid,{},undefined)
    const main = useRef<Panel|null>()

    useEffect(()=>{
        if(conponent?.switch){
            main.current?.AddClass("show")
        }else{
            main.current?.RemoveClass("show")
        }
    },[up])
    

    return <Panel ref={panel=>main.current = panel} className={'gloabtip'} style={{...conponent?.csstable}}/>
}