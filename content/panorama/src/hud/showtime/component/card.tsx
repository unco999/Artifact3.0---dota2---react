import React, { useEffect, useLayoutEffect, useRef } from "react";
import shortid from "shortid";
import useUuid from "../../useUUID.tsx/useUuid";

export const ShowCard = (props:{heroid:number,index:number}) =>{
    const uuid = useRef(shortid.generate())
    const panel = useRef<Panel|null>()
    
    useEffect(()=>{
        $.Schedule(props.index,()=>$(`#${uuid.current}`).AddClass("show"))
    },[])


    return <DOTAHeroImage id={uuid.current} hittest={false} heroid={props.heroid as HeroID}  heroimagestyle={"portrait"} className={"Card"}/>
}