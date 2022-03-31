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

    return <Panel  ref={panel=>ref.current = panel} className={"Baffle"} hittest={false} style={{zIndex:50,width:"1920px",height:"50%",y:'0px'}}>
        <DOTAScenePanel  hittest={false} style={{zIndex:50,width:"90%",height:"90%",y:'0px',align:'center center'}} map={"baffle"} renderdeferred={false} particleonly={true} antialias={true}>
        <Label text={"对手正在密谋"} style={{color:"white",textShadow:'0px 0px 0px 3.0 black',fontSize:'50px',align:'center center'}}/>
     </DOTAScenePanel>
    </Panel>
}

{/* <DOTAScenePanel  ref={panel=>ref.current = panel} className={"Baffle"} hittest={false} style={{zIndex:50,width:"1920px",height:"70%",y:'0px'}} map={"baffle"} renderdeferred={false} particleonly={true} antialias={true}>
        <Label text={"战争迷雾"} style={{fontSize:'50px',align:'center center'}}/>
    </DOTAScenePanel> */}