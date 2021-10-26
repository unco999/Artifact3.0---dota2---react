import React, { useEffect, useRef } from "react";
import { ConpoentDataContainer } from "../../ConpoentDataContainer";

export const Card = ({...args}) =>{
    const ref = useRef<Panel|null>()

    useEffect(()=>{
        const isselect = ConpoentDataContainer.Instance?.NameGetNode("Pool")?.current?.getKeyString<[number,number]>(Players.GetLocalPlayer() + "isselect")
        let bool = false
        for(const key in isselect){
           if(isselect[key] === args.id){
               bool = true
           }
        }
        bool ? ref.current?.AddClass("highlight") : ref.current?.RemoveClass("highlight")
    })

    useEffect(()=>{
        return ()=>ref.current?.RemoveClass("born")
    },[])
    
    return <DOTAHeroMovie ref={panel => ref.current = panel} {...args} onload={args.onload} heroid={args.id}  className={'Card'}/>
}