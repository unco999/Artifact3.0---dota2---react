import React, { useEffect, useRef, useState } from "react";
import { useGameEvent, useNetTableKey } from "react-panorama";
import shortid from "shortid";
import { ConpoentDataContainer } from "../../ConpoentDataContainer";
import { useInstance } from "../../useUUID.tsx/useInstance";
import useUuid from "../../useUUID.tsx/useUuid";

export const BranchCard = (props:{index:number}) => {
    const main = useRef<Panel|null>()
    const [array,setarray] = useState<Array<number>>([])
    const [motion,setmotion] = useState(0)
    const max = props.index == 1 || props.index == 3 ? 2 : 1
    const branchok = useNetTableKey('Card_group_construction_phase','brachisok') ?? false


    useEffect(()=>{
        $.RegisterEventHandler( 'DragEnter', main.current!, OnDragEnter );
        $.RegisterEventHandler( 'DragDrop', main.current!, OnDragDrop );
        $.RegisterEventHandler( 'DragLeave', main.current!, OnDragLeave );
    },[])



    useEffect(()=>{
        const conponent = ConpoentDataContainer.Instance.NameGetNode("Branch").current
        if(conponent){
            conponent.register_monitor(setmotion)
        }
    },[])

    useEffect(()=>{
        const conponent = ConpoentDataContainer.Instance.NameGetNode("Branch").current
        if(!conponent) return;
        const table = conponent.getKeyString<Record<number,number[]>>("branch")
        setarray(table[props.index])
    },[motion])

    const OnDragEnter = (panelId:any, dragCallbacks:any) => {
        
    }
    
    const OnDragDrop = (panelId:any, dragCallbacks:HeroImage) => {
        const heroid = dragCallbacks.heroid
        $.Msg("拖拽进去的id是",heroid)
        const conponent = ConpoentDataContainer.Instance.NameGetNode("Branch").current
        const table = conponent.getKeyString<Record<number,number[]>>("branch")
        if(!table)return;
        for(const branch in table){
           for(const index in table[branch]){
               if(table[branch][index] == heroid){
                   table[branch][index] = -1
               }
           }
        }
        for(const key in table[props.index]){
               if(table[props.index][key] == -1){
                    table[props.index][key] = heroid
                    break;
               }
           }
        setarray(table[props.index])
        dragCallbacks.DeleteAsync(0)
    }

    const OnDragLeave = () => {
        
    }


    return <Panel className={"BranchCard"}>
            <Label text={$.Localize("branch_" + props.index)}/>
            <Panel ref={panel=>main.current = panel} className={"box"}>
            {array.map((value)=>value != -1 && <DOTAHeroImage key={shortid.generate()} heroid={value as HeroID} className={'optionhero'}/>)}
            </Panel>
        </Panel>
    
}

export const Branch = (props:{gameloop:string}) => {
    const uuid = useUuid()
    const {conponent,up} = useInstance("Branch",uuid,{},undefined)
    const main = useRef<Panel|null>()

    useEffect(()=>{
        conponent?.SetKeyAny("branch",{0:[-1,-1],1:[-1],2:[-1,-1]})
    },[conponent])
    
    useEffect(()=>{
        if(props.gameloop === 'branch'){
            main.current?.AddClass("show")
        }else{
            main.current?.RemoveClass("show")
        }
    },[props.gameloop])

    return <>
         <Panel ref={panel=>main.current = panel} className={'branch'}>
               <BranchCard index={0}/>
               <BranchCard index={1}/>
               <BranchCard index={2}/>
        </Panel>
        </>

}
