import React, { useEffect } from "react";
import { useInstance } from "../../useUUID.tsx/useInstance";
import useUuid from "../../useUUID.tsx/useUuid";

export type arrow_data = {
    [keys:number]:{start:{x:number,y:number},end:{x:number,y:number}}
}



export const Arrow_tip = () => {
    const uuid = useUuid()
    const container = useInstance("arrow_tip",uuid,{},undefined)

    useEffect(()=>{
       if(container?.switch){
            $("#arrow_tip").RemoveClass("hide")
       }else{
            container?.SetKeyAny("data",{})
            $("#arrow_tip").AddClass("hide")
       }
    },[container?.switch])

    useEffect(()=>{
        $.Schedule(0.01,()=>{
            const arrow_data = container?.getKeyString<arrow_data>("data")
            if(arrow_data){
                for(const index in arrow_data){
    
                    ($("#arrow_tip") as ScenePanel).FireEntityInput(`line_${index}`,"SetControlPoint",`0: ${arrow_data[index].start.y / (Game.GetScreenHeight() / 1080) - 540} ${arrow_data[index].start.x / (Game.GetScreenWidth() / 1920) - 960} 0`);
                    //end   
                    ($("#arrow_tip") as ScenePanel).FireEntityInput(`line_${index}`,"SetControlPoint",`3: ${arrow_data[index].end.y / (Game.GetScreenHeight() / 1080) - 540} ${arrow_data[index].end.x / (Game.GetScreenWidth() / 1920) - 960} 0`);
                }
            }
        })
    },[container?.getKeyString("data")])


    return  <DOTAScenePanel className={"my_Arrow_tip"} hittest={false} id={"arrow_tip"} style={{zIndex:10,width:"100%",height:"100%"}} map={"particle"} renderdeferred={false} particleonly={true} antialias={true}/>
}