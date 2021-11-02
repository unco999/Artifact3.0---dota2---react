import React, { useEffect, useRef } from "react";
import shortid from "shortid";
import useUuid from "../../useUUID.tsx/useUuid";

export const Tit = (props:{text:string,classname:string,delay:number})=>{
    const uuid = useRef(shortid.generate())

    useEffect(()=>{
        $.Schedule(props.delay,()=>$(`#${uuid.current}`).AddClass("show"))
    },[])


    return <Label id={uuid.current} text={props.text} className={props.classname}/>
}