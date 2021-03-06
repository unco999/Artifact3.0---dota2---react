import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNetTableKey } from "react-panorama";
import { ConpoentDataContainer } from "../../ConpoentDataContainer";
import { useInstance } from "../../useUUID.tsx/useInstance";
import useUuid from "../../useUUID.tsx/useUuid";

export const Okbutton = (props:{playerteam:{red:number,blue:number},loopdata: {
    timeLeft: number;
    currentteam: string;
    optionalnumber: number;
    remainingOptionalQuantity: number;
},gameloopname:{current:string}}) => {
    const uuid = useUuid()
    const {conponent,up} = useInstance("okbutton",uuid,{},undefined)
    const panel = useRef<Panel|null>()
    const branchok = useNetTableKey('Card_group_construction_phase','brachisok') ?? false
    const [motion,setmotion] = useState(0)

    useEffect(()=>{
        panel.current?.RemoveClass("hight")
    },[props?.loopdata?.currentteam])

    useEffect(()=>{
       $.Schedule(1,()=>{
        const container = ConpoentDataContainer.Instance.NameGetNode("Pool").current
        container.register_monitor(setmotion)
       })
    },[])

    useEffect(()=>{
        const container = ConpoentDataContainer.Instance.NameGetNode("Pool").current
        if(!container) return
        const isselect = container.getKeyString<[number,number]>(Players.GetLocalPlayer() + "isselect")
        const isok = container.getKeyString(Players.GetLocalPlayer() + "isok")
        if(isok){
            panel.current?.AddClass("hight")
        }
    },[motion])


    const button = () => {
        if(branchok && branchok[Players.GetLocalPlayer()]) return;
        const Pool = ConpoentDataContainer.Instance.NameGetNode('Pool').current
        const loop = CustomNetTables.GetTableValue("GameMianLoop","currentLoopName")?.current
        if(loop == 'branch'){
            const Branch = ConpoentDataContainer.Instance.NameGetNode('Branch').current
            const data = Branch.getKeyString<{1:Array<number>,2:Array<number>,3:Array<number>}>("branch")
            $.Msg("打印当前分路选择",data)
            const newdata:Record<number,number[]> = {}
            for(const key in data){
               for(const index in data[+key as 1 | 2 | 3]){
                   if(!newdata[+key]) newdata[+key] = []
                   if(data[+key as 1 | 2 | 3][index] != -1){
                       newdata[+key].push(data[+key as 1 | 2 | 3][index])
                   }
               }
            }
            GameEvents.SendCustomGameEventToServer("HERO_BRANCH_OVER",{branch:data})
            return
        }
        if(!Pool) return
        const isselect = Pool.getKeyString<[number,number]>(Players.GetLocalPlayer() + "isselect")
        if(isselect[0] == undefined){
            isselect[0] = -1
        }
        if(isselect[1] == undefined){
            isselect[1] = -1
        }
        if(props.playerteam.blue == Players.GetLocalPlayer()){  
            GameEvents.SendCustomGameEventToServer("BLUE_SELECT_HERO_CARD",{array:isselect})
        }else{  
            GameEvents.SendCustomGameEventToServer("RED_SELECT_HERO_CARD",{array:isselect})
        }
    }

    return <Panel ref={Panel=>panel.current = Panel} className={"Okbutton" + " " + conponent?.className} onactivate={()=>button()}>
        <Label text={"确定选择"}/>
            </Panel>
}