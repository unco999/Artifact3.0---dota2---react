import React, { useCallback, useEffect, useState } from "react";
import { CardState, ConpoentDataContainer, State } from "../../ConpoentDataContainer";
import { useInstance } from "../../useUUID.tsx/useInstance";
import useUuid from "../../useUUID.tsx/useUuid";
import * as d3 from 'd3-ease'

export const Test = () => {
    const uuid = useUuid()
    const [state,setstate] = useState(0)
    const [update,setupdate] = useState(false)

    const test = () =>{
        setstate(value => value + 1)
    }
//
    const indead = () => {
        return new Promise((res,rej)=>{
            const b = ConpoentDataContainer.Instance.NameGetNode("TEST").current
            b.csstable = {x:"100px",y:"100px"}
            let time = 0
            $.Schedule(Game.GetGameFrameTime(),function cb(){
                time += Game.GetGameFrameTime()
                b.csstable.x = `${d3.easeBackInOut(time) * 100}px`
                setupdate(value => !value)
                if(time > 1){
                    res(true)
                    return;
                }
                $.Schedule(Game.GetGameFrameTime(),cb)
            })
        })
    }
    
    const container = useInstance("TEST",uuid,{x:'0px'},[
        new State(CardState.怎么都死不了状态,test,indead,test),
        new State(CardState.攻击状态,test,indead,test),
        new State(CardState.施法状态,test,indead,test),
        new State(CardState.死了又活过来又死了状态,test,indead,test),
        new State(CardState.死去活来状态,test,indead,test)
    ])

    const track = () => {

        let time = 0
        $.Schedule(Game.GetGameFrameTime(),function cb(){
            time += Game.GetGameFrameTime();
            ($("#uuid1") as ScenePanel).FireEntityInput("test","SetControlPoint",`3: ${(GameUI.GetCursorPosition()[1]) / (Game.GetScreenHeight() / 1080) - 540} ${(GameUI.GetCursorPosition()[0]) / (Game.GetScreenWidth() / 1920) - 960} 0`);//
            $.Schedule(Game.GetGameFrameTime(),cb)//
        })
    }


    return(//
        <>
        <Panel style={{width:'100%',height:'100%',backgroundColor:"white"}}/>
        <Panel onactivate={()=>{track()}} style={{...container?.csstable,width:'100px',height:'100px',align:"center center",backgroundColor:"black"}}>
        <Label text={state} style={{color:"white",fontSize:"30px"}}/>
        </Panel>
        <DOTAScenePanel hittest={false} id={"uuid1"} style={{width:"100%",height:"100%"}} map={"particle"} renderdeferred={false} particleonly={true} antialias={true}/>
        </>
    )
}
