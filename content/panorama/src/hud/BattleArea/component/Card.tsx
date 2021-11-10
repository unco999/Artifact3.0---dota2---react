import React, { useEffect, useRef, useState } from "react";
import { useMachine } from '@xstate/react';
import { createMachine } from 'xstate';
import { useGameEvent, useNetTableKey } from "react-panorama";
import { JsonString2Array, JsonString2Arraystrt0 } from "../../../Utils";
import shortid from "shortid";

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
    initial:'heaps',
    states:{
        heaps:{
            entry:'heaps_entry',
            on:{toHAND:"hand"},
            exit:'heaps_exit'
        },
        hand:{
            entry:'hand_entry',
            on:{tohand:"discharge",tobattle:"battale",toequip:"equipment"}
        },
        discharge:{
            on:{tohand:"battale",tograve:"grave"}
        },
        battale:{
            on:{tograve:"grave"}
        },
        equipment:{
        },
        grave:{

        }
    }
})

 
export const Card = (props:{index:number,uuid:string,owner:number}) => {
    const prefix = props.owner == Players.GetLocalPlayer() ? "my_" : "you_"
    const ref = useRef<Panel|null>()
    const dummy = useRef<Panel|null>()
    const [state,setstate] = useState<{Name:string,Index:number,uuid:string}>({Name:'null',Index:-1,uuid:'null'})
    const [xstate,send] = useMachine(Machine,{
        actions:{
            heaps_entry:()=>{dummyoperate('add',prefix + 'Heaps');},
            heaps_exit:()=>{dummyoperate('remove',prefix + "Heaps")},
            hand_entry:()=>{
                const id = GameEvents.Subscribe("S2C_GET_CARD",(event)=>{
                    if(event.uuid != props.uuid) return; 
                    setstate(event)
                    dummyoperate('add',prefix + "Hand"+ event.Index)
                    GameEvents.Unsubscribe(id) 
                })
                GameEvents.SendCustomGameEventToServer("C2S_GET_CARD",{uuid:props.uuid})
            },
        }
    })

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

    return <>
            <Panel ref={Panel => dummy.current = Panel} onmouseover={()=>ref.current?.AddClass(prefix+"hover")} onmouseout={()=>ref.current?.RemoveClass(prefix+"hover")} className={prefix+"Carddummy"}/>
            <DOTAHeroImage ref={Panel => ref.current = Panel} heroimagestyle={'portrait'} heroid={1 as HeroID} className={prefix+'Card'}/>
           </>
}

export const CardContext = (props:{owner:number}) => {
    const [myheaps,setmyheaps] = useState<string[]>([])
    const [myhand,setmyhand] = useState<string[]>([])
    const team = useNetTableKey('Card_group_construction_phase','team')

    const prefix = props.owner == Players.GetLocalPlayer() ? "my_" : "you_"

    useEffect(()=>{                                                             
            const myCardheaps = CustomNetTables.GetTableValue('Scenes','Cardheaps' + props.owner)
            const Hand = CustomNetTables.GetTableValue('Scenes','Hand'+ props.owner)
            const myheaps = JsonString2Array(myCardheaps)
            $.Msg("打印我的heaps数组",myheaps)
            setmyheaps(myheaps)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
    },[])


    return <Panel hittest={false} className={"CardContext"}>
        {myheaps.map((uuid,index)=><Card owner={props.owner}  key={shortid.generate()} index={index} uuid={uuid}/>)}
    </Panel>
}