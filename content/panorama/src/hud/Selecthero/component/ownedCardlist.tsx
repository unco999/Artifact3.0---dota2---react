import React from "react";
import { useNetTableKey, useNetTableValues } from "react-panorama";
import shortid from "shortid";
import { JsonString2Array } from "../../../Utils";
import { OwendCard } from "./ownedCard";

export const OwendCardList = ({...args}) => {
    const playerHasChosen = useNetTableKey("Card_group_construction_phase",'playerHasChosen')
    
    const instance = () => {
        let jsx:JSX.Element[] = []
        if(playerHasChosen){
           const arraycode = JsonString2Array(playerHasChosen[1])
           jsx = arraycode.map(code => <OwendCard key={shortid.generate()} heroid={code} {...args} num={1}/>)
        }
        return jsx
    }

    return<Panel onactivate={()=>instance()} className={"OwendCardlistparent"}>
        <Panel className={"OwendCardlist"}>
            {instance()}
        </Panel>
        </Panel>

}