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
            on:{toHAND:"hand"}
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

 
export const Card = (props:{index:number,uuid:string}) => {
    const ref = useRef<Panel|null>()//
    const [state,setstate] = useState<{Name:string,Index:number,uuid:string}>({Name:'null',Index:-1,uuid:'null'})
    const [xstate,send] = useMachine(Machine,{
        actions:{
            heaps_entry:()=>{ref.current?.AddClass('MyHeaps')},
            hand_entry:()=>{
                const id = GameEvents.Subscribe("S2C_GET_CARD",(event)=>{
                    setstate(event)
                    $.Msg("当前卡牌状态",state)
                    ref.current?.AddClass("MyHand"+ state.Index)
                    GameEvents.Unsubscribe(id)
                })
                GameEvents.SendCustomGameEventToServer("C2S_GET_CARD",{uuid:props.uuid})
            
            },
        }
    })


    useGameEvent("S2C_CARD_CHANGE_SCENES",(event)=>{
        if(props.uuid != event.uuid) return
        $.Msg("有牌可以操作")
        $.Msg(event.uuid,"uuid要去",event.to_scene)
        send("to"+event.to_scene)
    },[])

    return <DOTAHeroImage ref={Panel => ref.current = Panel} heroimagestyle={'portrait'} heroid={1 as HeroID} className={'MyCard'}/>
}

export const CardContext = () => {
    const [myheaps,setmyheaps] = useState<string[]>([])
    const [myhand,setmyhand] = useState<string[]>([])
    const team = useNetTableKey('Card_group_construction_phase','team')

    useEffect(()=>{                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
        const myCardheaps = CustomNetTables.GetTableValue('Scenes','Cardheaps'+ team.red)
        const Hand = CustomNetTables.GetTableValue('Scenes','Hand'+Players.GetLocalPlayer())
        const myheaps = JsonString2Array(myCardheaps)
        setmyheaps(myheaps)
    },[])


    return <Panel>
        {myheaps.map((uuid,index)=><Card key={shortid.generate()} index={index} uuid={uuid}/>)}
    </Panel>
}