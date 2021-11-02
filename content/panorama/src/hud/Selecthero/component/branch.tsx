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
//
    useEffect(()=>{
        $.RegisterEventHandler( 'DragEnter', main.current!, OnDragEnter );
        $.RegisterEventHandler( 'DragDrop', main.current!, OnDragDrop );
        $.RegisterEventHandler( 'DragLeave', main.current!, OnDragLeave );
    },[])

    useEffect(()=>{
        if(branchok && branchok[Players.GetLocalPlayer()]){
            $.RegisterEventHandler( 'DragEnter', main.current!, ()=>{} );
            $.RegisterEventHandler( 'DragDrop', main.current!, ()=>{} );
            $.RegisterEventHandler( 'DragLeave', main.current!, ()=>{} );
        }
    },[branchok])


    useEffect(()=>{
        const container = ConpoentDataContainer.Instance.NameGetNode("Branch").current
        if(container){
            container.register_monitor(setmotion)
        }
    })

    useEffect(()=>{
        $.Msg('激活了一次brach')
        const container = ConpoentDataContainer.Instance.NameGetNode("Branch").current
        if(!container) return;
        const table = container.getKeyString<Record<number,number[]>>("branch")
        setarray(table[props.index])
    },[motion])

    const OnDragEnter = (panelId:any, dragCallbacks:any) => {
        $.Msg(dragCallbacks.heroid)
    }
    
    const OnDragDrop = (panelId:any, dragCallbacks:HeroImage) => {
        const heroid = dragCallbacks.heroid
        const container = ConpoentDataContainer.Instance.NameGetNode("Branch").current
        const table = container.getKeyString<Record<number,number[]>>("branch")
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
        container.immediatelyupdate()
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
    const container = useInstance("Branch",uuid,{},undefined)
    const main = useRef<Panel|null>()

    useEffect(()=>{
        container?.SetKeyAny("branch",{0:[-1,-1],1:[-1],2:[-1,-1]})
    },[container])
    
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
