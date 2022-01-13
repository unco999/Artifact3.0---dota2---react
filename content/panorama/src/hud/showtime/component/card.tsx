import React, { useEffect, useLayoutEffect, useRef } from "react";
import shortid from "shortid";
import useUuid from "../../useUUID.tsx/useUuid";

export const ShowCard = (props:{heroid:number,delay:number}) =>{
    const uuid = useRef(shortid.generate())
    const panel = useRef<Panel|null>()
    
    useEffect(()=>{
        $.Schedule(props.delay,()=>$(`#${uuid.current}`).AddClass("show"))
    },[])



    return <DOTAHeroMovie id={uuid.current} hittest={false} heroname={(GameUI?.CustomUIConfig() as any).CardHero?.CardGame[props.heroid]?.name ?? ""}  className={"Card"}/>
}