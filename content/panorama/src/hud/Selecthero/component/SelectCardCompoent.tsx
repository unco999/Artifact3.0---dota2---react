import React, { useEffect, useRef } from "react";
import { ConpoentDataContainer } from "../../ConpoentDataContainer";

export const Card = ({...args}) =>{
    const ref = useRef<Panel|null>()

    useEffect(()=>{
        const isselect = ConpoentDataContainer.Instance?.NameGetNode("Pool")?.current?.getKeyString<[number,number]>(Players.GetLocalPlayer() + "isselect")
        let bool = false
        for(const key in isselect){
           if(isselect[key] === args.id){
               bool = true
           }
        }   
        bool ? ref.current?.AddClass("highlight") : ref.current?.RemoveClass("highlight")
    })


    useEffect(()=>{
       if(args?.filter === 0){
            ref.current?.AddClass("disable")
       }
       ref.current?.RemoveClass("highlight")
    },[args?.filter])

    const tip = (panel:Panel) => {
        const tip = ConpoentDataContainer.Instance.NameGetNode("")
    }

    
    return <DOTAHeroMovie onmouseover={(panel)=>tip(panel)} onmouseout={panel=>$.DispatchEvent("DOTAHideTextTooltip",panel)} ref={panel => ref.current = panel} {...args} onload={args.onload} heroid={args.id}  className={'Card'}>
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
        </DOTAHeroMovie>
}