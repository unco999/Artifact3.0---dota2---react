import React, { useEffect, useRef, useState } from "react";
import { useMachine } from '@xstate/react';
import { createMachine } from 'xstate';
import { useGameEvent, useNetTableKey } from "react-panorama";
import { JsonString2Array } from "../../../Utils";
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
    const [xstate,send] = useMachine(Machine,{
        actions:{
            heaps_entry:()=>{ref.current?.AddClass('MyHeaps')},
            hand_entry:()=>{$.Msg("進入了手牌模式");ref.current?.AddClass('Hand' + props.index)},
        }
    })

    useGameEvent("S2C_CARD_CHANGE_SCENES",(event)=>{
        $.Msg("傳來數據",event.uuid)
        $.Msg(event.uuid.indexOf(props.uuid))
        if(props.uuid != event.uuid) return
        $.Msg("有牌可以操作")
        send("to"+event)
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
        $.Msg("打印數組")
        $.Msg(myheaps)
        setmyheaps(myheaps)
    },[])

    useEffect(()=>{
        $.Msg("面板創建時間")
    },[])

    return <Panel>
        {myheaps.map((uuid,index)=><Card key={shortid.generate()} index={index} uuid={uuid}/>)}
    </Panel>
}