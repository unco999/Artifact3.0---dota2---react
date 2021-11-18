import React, { useEffect, useRef } from "react";
import { useInstance } from "../../useUUID.tsx/useInstance";
import useUuid from "../../useUUID.tsx/useUuid";

export const Gloabtip = () => {
    const uuid = useUuid()
    const container = useInstance("Gloabtip",uuid,{},undefined)
    const main = useRef<Panel|null>()

    useEffect(()=>{
        if(container?.switch){
            main.current?.AddClass("show")
        }else{
            main.current?.RemoveClass("show")
        }
    },[container?.switch])
    

    return <Panel ref={panel=>main.current = panel} className={'gloabtip'} style={{...container?.csstable}}/>
}