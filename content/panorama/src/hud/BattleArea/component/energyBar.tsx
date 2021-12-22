import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGameEvent } from "react-panorama";
import shortid from "shortid";

export const EnergyBarManager = (props:{owner:number,brach:number}) =>{
    const uuid = useRef("")
    const [state,setstate] = useState<{max_enrgy:number,current_enrgy:number,uuid:string,cuurent_max:number}>()
    const prefix = useMemo(()=> props.owner == Players.GetLocalPlayer() ? "my_" + props.brach : "you_" + props.brach,[props])

    // consume消耗   notOwned未拥有  beUsable可使用
    const list = useMemo(() => {
        const _list = []
        let index = state?.current_enrgy ?? 0
        let current_max = state?.cuurent_max ?? 0
        let max = state?.max_enrgy ?? 0
        $.Msg(state)
        for(let count = 0 ; count < 10 ; count++){
            let _state_string:"consume"|"notOwned"|"beUsable" = 'notOwned';
            if(count < max && count > index && count <= current_max){
                _state_string = 'consume'
            }
            else if(count > current_max){
                _state_string = 'notOwned'
            }
            else if(count <= index){
                _state_string = 'beUsable'
            }
            _list.push(<EnergyBaratom prefix={prefix} state={_state_string} key={_state_string + count}  index={count}/>)
        }
        return _list
    },[state])

    $.Msg("字符缓冲",prefix)


    useGameEvent("S2C_SEND_INIT_ENRGY",(event)=>{
        if(event.brach == props.brach && event.playerid == props.owner){
            $.Msg("hasjkdhadkj")
            uuid.current = event.uuid
            setstate(event)
        }
    },[prefix])

    useGameEvent("S2C_SEND_ENRGY",(event)=>{
        if(event.uuid != uuid.current) return
        $.Msg(event)
        setstate(event)
    },[prefix])

    useEffect(()=>{
        GameEvents.SendCustomGameEventToServer("C2S_GET_INIT_ENRGY",{brach:props.brach,PLAYER:props.owner})
        $.Msg("发送了初始化请求")
    },[prefix])

    $.Msg("当前路线状态")
    $.Msg(state)

    return <>
    <Panel className={prefix + "energyBarmain"}>
            <Panel className={prefix + "energyBlock"}>
            </Panel>
        </Panel>
        {list}
    </>
}

export const EnergyBaratom = (props:{state:"consume"|"notOwned"|"beUsable",prefix:string,index:number}) => {
    const [prestate,setprestate] = useState(props.state)
    const panel = useRef<ImagePanel|null>()

    useEffect(()=>{
        panel.current?.RemoveClass(prestate)
        setprestate(props.state)
    },[props.state])

    useEffect(()=>{//
       prestate && panel.current?.AddClass(prestate)
    },[prestate])

    return <Image ref={Panel=> panel.current = Panel} className={props.prefix + "energy" + props.index}/>
}

