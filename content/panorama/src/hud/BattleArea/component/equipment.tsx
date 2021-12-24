import React, { useEffect, useRef, useState } from "react";
import { useGameEvent } from "react-panorama";
import useUuid from "../../useUUID.tsx/useUuid";

export const EquipmentManager = (props:{uuid:string}) =>{
    return <Panel className={"EquipmentManager"} hittest={false}>
        <Equipment index={1} uuid={props.uuid}/>
        <Equipment index={2} uuid={props.uuid}/>
        <Equipment index={3} uuid={props.uuid}/>
    </Panel>
}

export const Equipment = (props:{index:number,uuid:string}) =>{
    const uuid = useUuid()
    const ref = useRef<Panel|null>()
    const EQUIPshowName = useRef("")
    
    useGameEvent("S2C_SEND_UP_EQUIMENT_SHOW",(event)=>{
        if(event.index != props.index || event.uuid != props.uuid) return;
        EQUIPshowName.current = event.item 
    },[])

    useGameEvent("S2C_SEND_EQUIP",(event)=>{
        if(event.uuid != props.uuid) return;
        const obj = Object.keys(event.data)
        obj.forEach(key=>{
            if(props.index.toString() == key){
                EQUIPshowName.current = event.data[key]
            }
        })
    },[])

    useEffect(()=>{
        GameEvents.SendCustomGameEventToServer("C2S_GET_EQUIP",{uuid:props.uuid})
    },[])

    const registrationCanBeHitInTheEvent = (open:boolean) => {
        $.Msg(ref.current)
        open ? $.RegisterEventHandler( 'DragDrop', ref.current!, OnDragDrop ) : $.RegisterEventHandler( 'DragDrop', ref.current!, ()=>{} );
        open ? $.RegisterEventHandler( 'DragEnter', ref.current!, OnDragEnter ) : $.RegisterEventHandler( 'DragEnter', ref.current!, ()=>{});
        open ? $.RegisterEventHandler('DragLeave',ref.current!,OnDragLeave) :  $.RegisterEventHandler( 'DragLeave', ref.current!, ()=>{});
    }

    useEffect(()=>{
        registrationCanBeHitInTheEvent(true)
    },[ref])

    const OnDragDrop = (dragCallbacks:Panel,callbacks:Panel) =>{
       const data = callbacks.Data().data
       GameEvents.SendCustomGameEventToServer("C2S_SEND_up_equiment",{index:props.index,uuid:props.uuid,item:data})
       $.Msg({index:props.index,uuid:props.uuid,item:data})
    }

    const OnDragEnter = (panelId:any, dragCallbacks:Panel) =>{
        ref.current?.AddClass("select")
        $.Msg("进入了")
    }

    const OnDragLeave = () =>{
        ref.current?.RemoveClass("select")
        $.Msg("出去了")
    }


    return <Panel  ref={Panel => ref.current = Panel} draggable={true} className={"Equipment"}  hittest={true}>
        <DOTAItemImage  key={uuid} id={uuid}  itemname={EQUIPshowName.current} className={'beEquipped'} showtooltip={true} />
    </Panel>
}