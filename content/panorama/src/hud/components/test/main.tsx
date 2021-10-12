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

    const indead = () => {
        const b = ConpoentDataContainer.Instance.NameGetNode("TEST").current
        b.csstable = {x:"100px",y:"100px"}
        let time = 0
        $.Schedule(Game.GetGameFrameTime(),function cb(){
            time += Game.GetGameFrameTime()
            b.csstable.x = `${d3.easeBackInOut(time) * 100}px`
            setupdate(value => !value)
            if(time > 1){
                return;
            }
            $.Schedule(Game.GetGameFrameTime(),cb)
        })//
    }
    
    const container = useInstance("TEST",uuid,{x:'0px'},[
        new State(CardState.怎么都死不了状态,test,test,test),
        new State(CardState.攻击状态,indead,test,test),
        new State(CardState.施法状态,test,test,test),
        new State(CardState.死了又活过来又死了状态,test,test,test),
        new State(CardState.死去活来状态,test,test,test)
    ])

    useEffect(()=>{
        $.Schedule(10,()=>{container?.switchState(CardState.怎么都死不了状态)})
        $.Schedule(20,()=>{container?.switchState(CardState.怎么都死不了状态)})
        $.Schedule(30,()=>{container?.switchState(CardState.怎么都死不了状态)})
        $.Schedule(40,()=>{container?.switchState(CardState.怎么都死不了状态)})
        $.Schedule(50,()=>{container?.switchState(CardState.怎么都死不了状态)})
    },[container])


    return(
        <Panel onactivate={()=>container?.Statenext()} style={{...container?.csstable,width:'500px',height:'500px',align:"center center",backgroundColor:"black"}}>
        <Label text={state} style={{color:"white",fontSize:"30px"}}/>
        </Panel>
    )
}
