import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNetTableKey, useNetTableValues } from "react-panorama";
import shortid from "shortid";
import { JsonString2Array } from "../../../Utils";
import { ConpoentDataContainer } from "../../ConpoentDataContainer";
import { useInstance } from "../../useUUID.tsx/useInstance";
import useUuid from "../../useUUID.tsx/useUuid";
import { OwendCard } from "./ownedCard";
import { teamState } from "./pool";

export const OwendCardList = ({...args}) => {
    const id = useUuid()
    const container = useInstance(args.player + "OwendCardList",id,{},undefined)
    const reduuid =  useRef([shortid.generate(),shortid.generate(),shortid.generate(),shortid.generate(),shortid.generate()])
    const blueuuid = useRef([shortid.generate(),shortid.generate(),shortid.generate(),shortid.generate(),shortid.generate()])
    const panel = useRef<Panel|null>()

    const instance = () => {
        let jsx:JSX.Element[] = []
        if(args.playerHasChosen){
            const arraycode = JsonString2Array(args.playerHasChosen[args.player == 'red' ? "RedSelectstage" : "BlueSelectstage"])
            jsx = arraycode.map((code,index) => <OwendCard key={args.player == 'red' ? reduuid.current[index] : blueuuid.current[index]} heroid={code} {...args} num={index + 1}/>)
        }else{
            const arraycode = [-1,-1,-1,-1,-1]
            jsx = arraycode.map((code,index) => <OwendCard key={args.player == 'red' ? reduuid.current[index] : blueuuid.current[index]} heroid={code} {...args} num={index + 1}/>)
        }
        return jsx
    }


    return<Panel  className={"OwendCardlistparent"}>
        <Panel className={"OwendCardlist"}>
            {instance()}
        </Panel>
        </Panel>

}