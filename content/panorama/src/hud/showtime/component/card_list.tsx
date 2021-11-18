import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNetTableKey } from "react-panorama";
import shortid from "shortid";
import { JsonString2Array, JsonString2Arraystrt0 } from "../../../Utils";
import {ShowCard} from './card'

export const CardList = () => {
    const maindata = useNetTableKey("Card_group_construction_phase",'herobrach') ?? {}
    const team = useNetTableKey('Card_group_construction_phase','team')
    const [mydata_brach0,setmydata_brach0] = useState<Array<number>>([])
    const [mydata_brach1,setmydata_brach1] = useState<Array<number>>([])
    const [mydata_brach2,setmydata_brach2] = useState<Array<number>>([])
    const [youdata_brach0,setyoudata_brach0] =  useState<Array<number>>([])
    const [youdata_brach1,setyoudata_brach1] =  useState<Array<number>>([])
    const [youdata_brach2,setyoudata_brach2] =  useState<Array<number>>([])

    useEffect(()=>{
        if(maindata[Players.GetLocalPlayer()] && maindata[Players.GetLocalPlayer()][0] && Object.values(maindata[Players.GetLocalPlayer()][0]).length > 0){
            setmydata_brach0(JsonString2Arraystrt0(maindata[Players.GetLocalPlayer()][0]))
            setmydata_brach1(JsonString2Arraystrt0(maindata[Players.GetLocalPlayer()][1]))
            setmydata_brach2(JsonString2Arraystrt0(maindata[Players.GetLocalPlayer()][2]))
            setyoudata_brach0(JsonString2Arraystrt0(maindata[Players.GetLocalPlayer() == team.red ? team.blue : team.red][0]))
            setyoudata_brach1(JsonString2Arraystrt0(maindata[Players.GetLocalPlayer() == team.red ? team.blue : team.red][1]))
            setyoudata_brach2(JsonString2Arraystrt0(maindata[Players.GetLocalPlayer() == team.red ? team.blue : team.red][2]))
        }
    },[maindata,team])

    $.Msg(maindata)
    
    return <> 
        <Panel className={"RedCardList"}>  
        {youdata_brach0.map(value=><ShowCard key={shortid.generate()} heroid={value} delay={3}/>)}
        {youdata_brach1.map(value=><ShowCard key={shortid.generate()} heroid={value} delay={1}/>)}
        {youdata_brach2.map(value=><ShowCard key={shortid.generate()} heroid={value} delay={3}/>)}
        </Panel>
        <Panel className={"BlueCardList"}>  
        {mydata_brach0.map(value=><ShowCard key={shortid.generate()} heroid={value} delay={3}/>)}
        {mydata_brach1.map(value=><ShowCard key={shortid.generate()} heroid={value} delay={1}/>)}
        {mydata_brach2.map(value=><ShowCard key={shortid.generate()} heroid={value} delay={3}/>)}
        </Panel> 
         </>
}