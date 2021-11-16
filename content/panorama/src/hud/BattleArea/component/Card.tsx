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
            on:{toHAND:"hand",toHEAPS:"heaps",toMIDWAY:"midway",toGOUP:"goup",toLAIDDOWN:"laiddown",toABILITY:'ability'},
            exit:"hand_exit"
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
            entry:'laiddown_entry',
            on:{toHAND:"hand",toHEAPS:"heaps",toMIDWAY:"midway",toGOUP:"goup",toLAIDDOWN:"laiddown"},
            exit:"laiddown_exit"
        },
        ability:{
            entry:"ability_entry",
            on:{toGRAVE:'grave'},
            exit:"ability_exit"
        },
        equipment:{
        },
        grave:{
            entry:"grave_entry",
            exit:"grave_exit"
        }
    }
})

 
export const Card = (props:{index:number,uuid:string,owner:number}) => {
    const prefix = useMemo(()=> props.owner == Players.GetLocalPlayer() ? "my_" : "you_",[props])
    const ref = useRef<Panel|null>()
    const dummy = useRef<Panel|null>()
    const preindex = useRef<number>(-1) //板子的上一次索引
    const [state,setstate] = useState<{Id:string,Index:number,uuid:string,Scene?:string,type?:string,playerid?:PlayerID}>({Id:'null',Index:-1,uuid:'null'})
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
                preindex.current = state.Index
                dummyoperate('add',prefix + 'Midway' + state.Index);
            },
            midway_exit:()=>{
                dummyoperate('remove',prefix + 'Midway' + preindex.current );
            },
            goup_entry:()=>{
                preindex.current = state.Index
                dummyoperate('add',prefix + 'Goup' + state.Index );
            },
            goup_exit:()=>{
                dummyoperate('remove',prefix + 'Goup' + preindex.current);
            },
            laiddown_entry:()=>{
                preindex.current = state.Index
                dummyoperate('add',prefix + 'Laiddown' + state.Index);
            },
            laiddown_exit:()=>{
                dummyoperate('remove',prefix + 'Laiddown' + preindex.current);
            },
            heaps_entry:()=>{
                preindex.current = state.Index
                dummyoperate('add',prefix + 'Heaps');
            },
            heaps_exit:()=>{
                dummyoperate('remove',prefix + "Heaps")
            },
            hand_entry:()=>{ 
                preindex.current = state.Index
                dummyoperate('add',prefix + "Hand"+ state.Index)
            },
            hand_exit:()=>{ dummyoperate('remove',prefix + "Hand"+ preindex.current)
            },
            ability_entry:()=>{
                $.Msg("进入了魔法阶段")
                disposablePointing()
                dummyoperate('add',prefix + "ability")
            },
            ability_exit:()=>{
                dummyoperate('remove',prefix + "ability")
                hidedisposablePointing()
            },
            grave_entry:()=>{
                $.Msg("进入了分厂")
            }
        }
    })

    useEffect(()=>{
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
        setstate(event)
        $.Msg("收到了卡牌改变规则",event)
    },[setstate,xstate])

    //drag事件
    useEffect(()=>{
        if(xstate.value == 'hand' && props.owner == Players.GetLocalPlayer()){
            $.RegisterEventHandler( 'DragStart', dummy.current!, OnDragStart );
            $.RegisterEventHandler( 'DragEnd',dummy.current!, OnDragEnd);
        }
        if(xstate.value == 'midway' || xstate.value == 'goup' || xstate.value == 'laiddown'){
            $.RegisterEventHandler( 'DragDrop', ref.current!, OnDragDrop );
            $.RegisterEventHandler( 'DragEnter', ref.current!, OnDragEnter );
        }
    },[props.owner,xstate.value])

    //改变index事件
    useGameEvent("S2C_SEND_INDEX",(event)=>{
        const keys = Object.keys(event)
        if(keys[0] == props.uuid && xstate.value == 'hand'){
            $.Msg("更新index",event[keys[0]])
            dummyoperate('remove',prefix + "Hand"+ preindex.current)
            preindex.current = event[keys[0]]
            dummyoperate('add',prefix + "Hand"+ event[keys[0]])
        }
    },[xstate])

    const OnDragStart = (panelId:any, dragCallbacks:any) =>{
        isdrag.current = true
        ref.current?.AddClass('drag')
        const displayPanel = $.CreatePanel( "Panel", $.GetContextPanel(), "cache" ) as HeroImage
        displayPanel.Data().uuid = state.uuid
        dragCallbacks.displayPanel = displayPanel;
        dragCallbacks.offsetX = 0; 
        dragCallbacks.offsetY = 0;
        changeCoordinates()
        state.type == 'Unit' && splitOptionalPrompt()
        $.Msg("OnDragStart")
    }

    const OnDragEnd = (panelId:any, dragCallbacks:any) =>{
        ref.current?.RemoveClass('drag')
        dragCallbacks.DeleteAsync( 0 );
        isdrag.current = false
        const container = ConpoentDataContainer.Instance.NameGetNode("arrow_tip").current
        container.close()
        state.type == 'Unit' && closeOptionalPrompt()
    }

    /**打开分路可选提示器 */
    const splitOptionalPrompt = () =>{
        GameEvents.SendCustomGameEventToServer("C2S_GET_CANSPACE",{})
    }

    /**关闭分路可选提示器 */
    const closeOptionalPrompt = () =>{
        const containeise = ConpoentDataContainer.Instance.NameGetGrap("Card_container").current
        containeise.forEach(container=>{
            container.close()
        })
    }

    //**打开指引提示器 */
    const changeCoordinates = () => {
        //
       const container = ConpoentDataContainer.Instance.NameGetNode("arrow_tip").current
       cb()
       container.open()
       function cb(){
             if(!ref.current?.actualxoffset) return;
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

    const disposablePointing = () => {
        const container = ConpoentDataContainer.Instance.NameGetNode("arrow_tip").current
        function cb(){
           const mouse:arrow_data = {
            1:{start:{x:ref.current!.actualxoffset,y:ref.current!.actualyoffset,},end:{x:500,y:600}},
            2:{start:{x:ref.current!.actualxoffset,y:ref.current!.actualyoffset,},end:{x:700,y:600}},
            3:{start:{x:ref.current!.actualxoffset,y:ref.current!.actualyoffset,},end:{x:900,y:600}},
            4:{start:{x:ref.current!.actualxoffset,y:ref.current!.actualyoffset,},end:{x:1100,y:600}},
            5:{start:{x:ref.current!.actualxoffset,y:ref.current!.actualyoffset,},end:{x:1300,y:600}},
            6:{start:{x:ref.current!.actualxoffset,y:ref.current!.actualyoffset,},end:{x:1450,y:600}},
            7:{start:{x:ref.current!.actualxoffset,y:ref.current!.actualyoffset,},end:{x:1600,y:600}},
            8:{start:{x:ref.current!.actualxoffset,y:ref.current!.actualyoffset,},end:{x:1850,y:600}},
            }
            container.SetKeyAny("data",mouse)
        }
        $.Schedule(1,cb)
        container.open()
    }

    const hidedisposablePointing = () => {
        const container = ConpoentDataContainer.Instance.NameGetNode("arrow_tip").current
        container.close()
    }

    const OnDragEnter = () =>{
        $.Msg("OnDragEnter")
    }

    const OnDragDrop = (panelId:any, dragCallbacks:any) => {
        $.Msg('attach',dragCallbacks.Data().uuid)
        $.Msg('my',props.uuid)
        GameEvents.SendCustomGameEventToServer("C2S_actingOnCard",{attach:dragCallbacks.Data().uuid,my:props.uuid})
    }

    const OnDragLeave = () =>{
        $.Msg("OnDragDrop")
    }

    const Unit = () => {
        return <>
         <Panel draggable={true} ref={Panel => dummy.current = Panel} onmouseover={()=>ref.current?.AddClass(prefix+"hover")} onmouseout={()=>ref.current?.RemoveClass(prefix+"hover")} className={prefix+"Carddummy"}/>
        <Panel ref={Panel => ref.current = Panel}  className={prefix+'Card'} >
              <DOTAHeroImage heroimagestyle={'portrait'} heroid={1 as HeroID} />
              <Panel className={"threeDimensional"}>
            <Panel className={"attack"}>
                <Label text={1}/>
            </Panel>
            <Panel className={"arrmor"}>
                <Label text={2}/>
            </Panel>
            <Panel className={"heal"}>
                <Label text={3}/>
            </Panel>
        </Panel>
        </Panel>
        </>
    }

    const Heaps = () => {
        return <>
         <Panel draggable={true} ref={Panel => dummy.current = Panel} onmouseover={()=>ref.current?.AddClass(prefix+"hover")} onmouseout={()=>ref.current?.RemoveClass(prefix+"hover")} className={prefix+"Carddummy"}/>
        <Panel ref={Panel => ref.current = Panel}  className={prefix+'Card'} >
              <DOTAHeroImage heroimagestyle={'portrait'} heroid={1 as HeroID} />
              <Panel className={"threeDimensional"}>
            <Panel className={"attack"}>
                <Label text={1}/>
            </Panel>
            <Panel className={"arrmor"}>
                <Label text={2}/>
            </Panel>
            <Panel className={"heal"}>
                <Label text={3}/>
            </Panel>
        </Panel>
        </Panel>
        </>
    }

    
    const Ability = () => {
        return <>
         <Panel draggable={true} ref={Panel => dummy.current = Panel} onmouseover={()=>ref.current?.AddClass(prefix+"hover")} onmouseout={()=>ref.current?.RemoveClass(prefix+"hover")} className={prefix+"Carddummy"}/>
        <Panel ref={Panel => ref.current = Panel}  className={prefix+'Card'} >
              <DOTAAbilityImage abilityname={"elder_titan_echo_stomp"}/>
              <Panel className={"threeDimensional"}>

        </Panel>
        </Panel>
        </>
    }


    const card_type = () =>{
        if(state.Scene == 'HEAPS'){
            return Heaps()
        }
        if(state.type == 'Unit'){
            return Unit()
        }
        if(state.type == 'SmallSkill' || state.type == 'TrickSkill'){
            return Ability()
        }
    }

    return <>
            {card_type()}
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