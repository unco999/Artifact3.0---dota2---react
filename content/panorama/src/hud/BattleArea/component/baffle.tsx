import React, { useEffect, useRef } from "react";
import { useNetTableKey } from "react-panorama";

export const Baffle = () =>{
    const ref = useRef<Panel|null>()
    const smallCycle = useNetTableKey("GameMianLoop",'smallCycle')?.current

    useEffect(()=>{
        if(smallCycle == '0'){
            ref.current?.RemoveClass("hide")
        }else{
            ref.current?.AddClass("hide")
        }
    },[smallCycle])

    return <DOTAScenePanel  ref={panel=>ref.current = panel} className={"Baffle"} hittest={false} style={{zIndex:50,width:"1920px",height:"70%",y:'0px'}} map={"baffle"} renderdeferred={false} particleonly={true} antialias={true}>
        <Label text={"战争迷雾"} style={{fontSize:'50px',align:'center center'}}/>
    </DOTAScenePanel>
}