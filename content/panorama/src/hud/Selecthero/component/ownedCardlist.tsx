import React, { useMemo, useRef } from "react";
import { useNetTableKey, useNetTableValues } from "react-panorama";
import shortid from "shortid";
import { JsonString2Array } from "../../../Utils";
import { OwendCard } from "./ownedCard";

export const OwendCardList = ({...args}) => {
    const playerHasChosen = useNetTableKey("Card_group_construction_phase",'playerHasChosen')
    const loopdata = useNetTableKey("Card_group_construction_phase",'selectloop')
    const reduuid =  useRef([shortid.generate(),shortid.generate(),shortid.generate(),shortid.generate(),shortid.generate(),shortid.generate()])
    const blueuuid = useRef([shortid.generate(),shortid.generate(),shortid.generate(),shortid.generate(),shortid.generate(),shortid.generate()])
    
    const instance = useMemo(() => {
        let jsx:JSX.Element[] = []
        if(playerHasChosen){
           const arraycode = JsonString2Array(playerHasChosen[args.player == 'red' ? "RedSelectstage" : "BlueSelectstage"])
            jsx = arraycode.map((code,index) => <OwendCard key={args.player == 'red' ? reduuid.current[index] : blueuuid.current[index]} heroid={code} {...args} num={index + 1}/>)
        }else{
            const arraycode = [-1,-1,-1,-1,-1,-1]
            jsx = arraycode.map((code,index) => <OwendCard key={args.player == 'red' ? reduuid.current[index] : blueuuid.current[index]} heroid={code} {...args} num={index + 1}/>)
        }
        return jsx
    },[playerHasChosen])

    return<Panel onactivate={()=>instance} className={"OwendCardlistparent"}>
        <Panel className={"OwendCardlist"}>
            {instance}
        </Panel>
        </Panel>

}