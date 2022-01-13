import React, { useEffect, useRef, useState } from "react";
import { ConpoentDataContainer } from "../../ConpoentDataContainer";

export const Card = ({...args}) =>{
    const ref = useRef<Panel|null>()
    const [motion,setmotion] = useState(0)

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
        if(isselect[0] == args.id || isselect[1] == args.id){
            ref.current?.AddClass("highlight")
        }else{
            ref.current?.RemoveClass("highlight")
        }
        const list = container.getKeyString<string[]>(Players.GetLocalPlayer() + "okselect")
        if(!list) return;
        for(const heroid of list){
            if(heroid == args.id){
                ref.current?.AddClass("disable")
            }
        }
     },[motion])
 

    const tip = (panel:Panel) => {
        const tip = ConpoentDataContainer.Instance.NameGetNode("")
    }

    //@ts-ignore
    return <DOTAHeroMovie heroname={GameUI.CustomUIConfig().CardHero?.CardGame[args.id]?.name ?? "" } onmouseover={(panel)=>tip(panel)} onmouseout={panel=>$.DispatchEvent("DOTAHideTextTooltip",panel)} ref={panel => ref.current = panel} {...args} onload={args.onload}  className={'Card'}>
            <Panel className={"threeDimensional"}>
                <Panel className={"attack"}>
                    <Label text={(GameUI?.CustomUIConfig() as any)?.CardHero?.CardGame[args.id]?.attack ?? ""}/>
                </Panel>
                <Panel className={"arrmor"}>
                    <Label text={(GameUI?.CustomUIConfig() as any)?.CardHero?.CardGame[args.id]?.arrmor ?? ""}/>
                </Panel>
                <Panel className={"heal"}>
                    <Label text={(GameUI?.CustomUIConfig() as any)?.CardHero?.CardGame[args.id]?.health ?? ""}/>
                </Panel>
            </Panel>
        </DOTAHeroMovie>
}