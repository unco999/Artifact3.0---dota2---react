import React, { useEffect, useRef, useState } from "react";
import shortid from "shortid";
import { ConpoentDataContainer } from "../../ConpoentDataContainer";
import { useInstance } from "../../useUUID.tsx/useInstance";
import useUuid from "../../useUUID.tsx/useUuid";

export const BranchCard = (props:{index:number}) => {
    const main = useRef<Panel|null>()
    const [array,setarray] = useState<Array<number>>([])
    const [motion,setmotion] = useState(0)

    useEffect(()=>{
        $.RegisterEventHandler( 'DragEnter', main.current!, OnDragEnter );
        $.RegisterEventHandler( 'DragDrop', main.current!, OnDragDrop );
        $.RegisterEventHandler( 'DragLeave', main.current!, OnDragLeave );
    },[])

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
        table[props.index].push(heroid)
        setarray(table[props.index])
        container.immediatelyupdate()
        $.Msg(table)
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
        container?.SetKeyAny("branch",{1:[],2:[],3:[]})
    },[container])
    
    useEffect(()=>{
        if(props.gameloop === 'branch'){
            main.current?.AddClass("show")
        }else{
            main.current?.RemoveClass("show")
        }
    },[props.gameloop])

    return<>
         <Panel ref={panel=>main.current = panel} className={'branch'}>
               <BranchCard index={1}/>
               <BranchCard index={2}/>
               <BranchCard index={3}/>
        </Panel>
        </>
}
