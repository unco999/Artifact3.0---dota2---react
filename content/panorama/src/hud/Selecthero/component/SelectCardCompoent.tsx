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
       if(args?.filter == 0){
            ref.current?.AddClass("disable")
            return;
       }
       if(args?.filter == 1){
           ref.current?.RemoveClass("disable")
           return;
       }
       ref.current?.RemoveClass("highlight")
    })

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