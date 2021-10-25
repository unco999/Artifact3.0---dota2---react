import React, { useEffect, useRef, useState } from "react";
import { CardState, ConpoentDataContainer, State } from "../../ConpoentDataContainer";
import { useInstance } from "../../useUUID.tsx/useInstance";
import useUuid from "../../useUUID.tsx/useUuid";
import * as d3 from 'd3-ease'
import { useMachine } from "@xstate/react";
import { actions, createMachine } from 'xstate';
import { useGameEvent } from "react-panorama";
const toggleMachine = createMachine({
    id: 'toggle',
    initial: 'inactive',
    context:{
        antiShake:true
    },
    states: {
      inactive: {
        entry:['default_init'],
        on:{
            TOGGLE:{
                target:"active"
            }
        }
      },
      active: {
        entry:['active'],
        exit:['mouseover_exit'],
        on: {INCTIVE:[
            {target:'inactive'}
        ],
            GOTO:{target:'ok'}
        }
      },
      ok:{
        entry:['putUp_init'],
        exit:['putUp_exit'],
        on: {INCTIVE:[
            {target:'inactive'}
        ],
      }
    }
}}
    );
  

export const Hand_Card = ({...args}) =>{
    const mainref = useRef<Panel|null>()
    const [update,setupdate] = useState(false)
    const uuid = useUuid()
    const [state,send] = useMachine(toggleMachine,{actions:{
        active:mouseover_init,
        default_init:default_init,
        mouseover_exit:mouseover_exit,
        putUp_init:putUp_init,
        putUp_exit:putUp_exit
    },
    })
    const container = useInstance("name",uuid,{},send,"Hand_Card")
    const id = useRef(Math.floor(Math.random() * 50 + 1))


    useGameEvent("SendCardState",(event)=>{
        if(event.uuid == uuid)
        send({type:event.send})
    },[send])

    function abc(){
        $.Msg("gogogo")
    }

    // card state 手牌默认状态 ========================================================================
    function default_init(context:any,event:any){
        $.Msg("进入默认状态")
    }

    function default_exit(){
        return new Promise((res,rej)=>{
            res(true)
        })
    }

    function default_run(){
    }

    // card state 选中状态 ========================================================================

    function mouseover_init(context:any,event:any){
        mainref.current?.AddClass("bounceUp")//
    }

    function mouseover_exit(){
        mainref.current?.RemoveClass("bounceUp")
    }

    function mouseover_run(){
    }

    // card state 置放状态 ========================================================================
    function putUp_init(){
        mainref.current?.AddClass("pos" + Math.floor(Math.random() * 5 + 1 ))//
    }

    function putUp_exit(){

    }

    function putUp_run(time:number){
    }

    useEffect(()=>{
        if(mainref.current){
            mainref.current.style.boxShadow = `black 4px 4px 8px 0px;`
            $.Schedule(Game.GetGameFrameTime(),()=>{setupdate(value=>!value)}) 
        }
    },[update])


    // useEffect(()=>{
    //     if(container){
    //         const max = args.max
    //         const index = args.index
    //         const scalar = index - max / 2 
    //         const scalar2 = Math.abs(scalar) // 位移
    //         container.default_css_table = {
    //         preTransformRotate2d:scalar * 3.1415926 + 'deg',
    //         x:800 + scalar * 100 +'px',
    //         y:`${400 + scalar2 * 20}px`
    //         }
    //         container.csstable = {
    //             preTransformRotate2d:scalar * 3.1415926 + 'deg',
    //             x:800 + scalar * 100 +'px',
    //             y:`${400 + scalar2 * 20}px`
    //         }
            
    //         setupdate(value=>!value)
    //     }
    // },[container])

    useEffect(()=>{
        // $.Schedule(1,()=>mainref.current?.AddClass("bounceUp"))
        // $.Schedule(2,()=>mainref.current?.AddClass("goto"))
        // $.Schedule(3,()=>mainref.current?.AddClass("dd"))
        // $.Schedule(4,()=>mainref.current?.RemoveClass("dd"))
        // $.Schedule(4,()=>mainref.current?.AddClass("pos"))
    },[])

    return <DOTAHeroImage heroid={id.current as HeroID} ref = { Panel=> mainref.current = Panel } onactivate={()=>container?.send('GOTO',{})} hittest={true} onmouseover={()=>{
        container?.send('TOGGLE',{})}}  onmouseout={()=>{container?.send('INCTIVE',{})}} style={{...container?.csstable}} className={"hand_index_1 hand_card test"} {...args}/>
}