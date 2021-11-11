import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMachine } from '@xstate/react';
import { createMachine } from 'xstate';
import { useGameEvent, useNetTableKey } from "react-panorama";
import { JsonString2Array, JsonString2Arraystrt0 } from "../../../Utils";
import shortid from "shortid";
import { ConpoentDataContainer } from "../../ConpoentDataContainer";
import { arrow_data } from "./arrow_tip";

export enum state{
    牌堆,
    手牌,
    施放,
    战场,    
    坟墓,
    装备,
}

const Machine = createMachine({
    id:'Card',
    initial:'defualt',
    states:{
        defualt:{
            entry:"defualt_entry",
            on:{toHAND:"hand",toHEAPS:"heaps",toMIDWAY:"midway",toGOUP:"goup",toLAIDDOWN:"laiddown"},
            exit:"defualt_exit"
        },
        heaps:{
            entry:'heaps_entry',
            on:{toHAND:"hand"},
            exit:'heaps_exit'
        },
        hand:{
            entry:'hand_entry',
            on:{toHAND:"hand",toHEAPS:"heaps",toMIDWAY:"midway",toGOUP:"goup",toLAIDDOWN:"laiddown"},
        },
        midway:{
            entry:'midway_entry',
            on:{toHAND:"hand",toHEAPS:"heaps",toMIDWAY:"midway",toGOUP:"goup",toLAIDDOWN:"laiddown"},
            exit:"midway_exit"
        },
        goup:{
            entry:'goup_entry',
            on:{toHAND:"hand",toHEAPS:"heaps",toMIDWAY:"midway",toGOUP:"goup",toLAIDDOWN:"laiddown"},
            exit:"goup_exit"
        },
        laiddown:{
            entry:'laidown_entry',
            on:{toHAND:"hand",toHEAPS:"heaps",toMIDWAY:"midway",toGOUP:"goup",toLAIDDOWN:"laiddown"},
            exit:"laiddown_exit"
        },
        discharge:{
        },
        equipment:{
        },
        grave:{

        }
    }
})

 
export const Card = (props:{index:number,uuid:string,owner:number}) => {
    const prefix = useMemo(()=> props.owner == Players.GetLocalPlayer() ? "my_" : "you_",[props])
    const ref = useRef<Panel|null>()
    const dummy = useRef<Panel|null>()
    const [state,setstate] = useState<{Name:string,Index:number,uuid:string,Scene?:string}>({Name:'null',Index:-1,uuid:'null'})
    const isdrag = useRef<boolean>(false)
    const [xstate,send] = useMachine(Machine,{
        actions:{
            defualt_entry:()=>{
                const id = GameEvents.Subscribe("S2C_GET_CARD",(event)=>{
                    if(event.uuid != props.uuid) return; 
                    setstate(event)
                    GameEvents.Unsubscribe(id) 
                })
                GameEvents.SendCustomGameEventToServer("C2S_GET_CARD",{uuid:props.uuid})
            },
            defualt_exit:()=>{

            },
            midway_entry:()=>{
                $.Msg("有牌去了中路")
                dummyoperate('add',prefix + 'Midway');
            },
            midway_exit:()=>{
                dummyoperate('remove',prefix + 'Midway');
            },
            goup_entry:()=>{
                dummyoperate('add',prefix + 'Goup');
            },
            goup_exit:()=>{
                dummyoperate('remove',prefix + 'Goup');
            },
            laiddown_entry:()=>{
                dummyoperate('add',prefix + 'Laiddown');
            },
            laiddown_exit:()=>{
                dummyoperate('remove',prefix + 'Laiddown');
            },
            heaps_entry:()=>{dummyoperate('add',prefix + 'Heaps');},
            heaps_exit:()=>{dummyoperate('remove',prefix + "Heaps")},
            hand_entry:useCallback(()=>{ dummyoperate('add',prefix + "Hand"+ state.Index)},[state]),
        }
    })

    useEffect(()=>{
        $.Msg(state)
        state.Scene && send("to" + state.Scene)
    },[state])

    /**每次本体动 马甲跟着动 */
    const dummyoperate  = (action:"remove"|"add",classname:string) => {
        if(action == 'add'){
            ref.current?.AddClass(classname)
            dummy.current?.AddClass(classname)
        }else{
            ref.current?.RemoveClass(classname)
            dummy.current?.RemoveClass(classname)
        }
    }

    useGameEvent("S2C_CARD_CHANGE_SCENES",(event)=>{
        if(props.uuid != event.uuid) return
        $.Msg("有牌可以操作")
        $.Msg(event.uuid,"uuid要去",event.to_scene)
        send("to"+event.to_scene)
    },[])

    //drag事件
    useEffect(()=>{
        if(xstate.value == 'hand' && props.owner == Players.GetLocalPlayer()){
            $.Msg("给板子注册了事件")
            $.Msg(dummy.current)
            $.RegisterEventHandler( 'DragEnter', dummy.current!, OnDragEnter );
            $.RegisterEventHandler( 'DragDrop', dummy.current!, OnDragDrop );
            $.RegisterEventHandler( 'DragLeave', dummy.current!, OnDragLeave );
            $.RegisterEventHandler( 'DragStart', dummy.current!, OnDragStart );
            $.RegisterEventHandler( 'DragEnd',dummy.current!, OnDragEnd);
        }
    },[props.owner,xstate.value])

    const OnDragStart = (panelId:any, dragCallbacks:any) =>{
        isdrag.current = true
        ref.current?.AddClass('drag')
        const displayPanel = $.CreatePanel( "Panel", $.GetContextPanel(), "cache" ) as HeroImage
        dragCallbacks.displayPanel = displayPanel;
        dragCallbacks.offsetX = 0; 
        dragCallbacks.offsetY = 0;
        changeCoordinates()
        $.Msg("OnDragStart")
    }

    const OnDragEnd = (panelId:any, dragCallbacks:any) =>{
        ref.current?.RemoveClass('drag')
        dragCallbacks.DeleteAsync( 0 );
        isdrag.current = false
        const container = ConpoentDataContainer.Instance.NameGetNode("arrow_tip").current
        container.close()
        
    }

    const changeCoordinates = () => {
        //
       const container = ConpoentDataContainer.Instance.NameGetNode("arrow_tip").current
       cb()
       container.open()
       function cb(){
             const cursor = GameUI.GetCursorPosition()
             const mouse:arrow_data = {
             0:{start:{x:ref.current!.actualxoffset!,y:ref.current!.actualyoffset,},end:{x:cursor[0],y:cursor[1]}}
             }
             container.SetKeyAny("data",mouse)
             if(isdrag.current){
                $.Schedule(Game.GetGameFrameTime(),cb)
             }
       }
    }

    const OnDragEnter = () =>{
        $.Msg("OnDragEnter")
    }

    const OnDragDrop = () => {
        $.Msg("OnDragDrop")
    }

    const OnDragLeave = () =>{
        $.Msg("OnDragDrop")
    }

    return <>
            <Panel draggable={true} ref={Panel => dummy.current = Panel} onmouseover={()=>ref.current?.AddClass(prefix+"hover")} onmouseout={()=>ref.current?.RemoveClass(prefix+"hover")} className={prefix+"Carddummy"}/>
            <DOTAHeroImage ref={Panel => ref.current = Panel}  heroimagestyle={'portrait'} heroid={1 as HeroID} className={prefix+'Card'}>
            </DOTAHeroImage>
           </>
}

export const CardContext = (props:{owner:number}) => {
    const [myheaps,setmyheaps] = useState<string[]>([])
    const [myhand,setmyhand] = useState<string[]>([])
    const team = useNetTableKey('Card_group_construction_phase','team')

    const prefix = props.owner == Players.GetLocalPlayer() ? "my_" : "you_"

    useEffect(()=>{                                                             
            $.Schedule(0.5,()=>{
                const all = CustomNetTables.GetTableValue('Scenes','ALL' + props.owner)
                const all_array = JsonString2Array(all)
                setmyheaps(all_array)    
            })                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
    },[])


    return <Panel hittest={false} className={"CardContext"}>
        {myheaps.map((uuid,index)=><Card owner={props.owner}  key={shortid.generate()} index={index} uuid={uuid}/>)}
    </Panel>
}