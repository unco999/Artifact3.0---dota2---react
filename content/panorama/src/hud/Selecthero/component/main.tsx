import React from "react";
import { useNetTableKey } from "react-panorama";
import { BaseBoard } from "./baseboard";
import { Branch } from "./branch";
import { Gloabtip } from "./gloabtip";
import { Okbutton } from "./okbutton";
import { Ownedpool } from "./ownedpool";
import { Pool } from "./pool";
import { Tip } from "./tip";

export const Main = () => {
    const playerHasChosen = useNetTableKey("Card_group_construction_phase",'playerHasChosen')
    const loopdata = useNetTableKey("Card_group_construction_phase",'selectloop')
    const playerteam = useNetTableKey('Card_group_construction_phase','team')
    const gameloopname = useNetTableKey("GameMianLoop",'currentLoopName')

    const filter = () => {
        return gameloopname?.current === 'selectherocard' ||  gameloopname?.current === "branch" 
    }

    return <> 
        {
        filter() &&
        <BaseBoard>
        <Pool loopdata={loopdata} playerteam={playerteam} gameloop={gameloopname?.current}/>
        <Ownedpool player={"red"} loopdata={loopdata} playerHasChosen={playerHasChosen} playerteam={playerteam}/>
        <Ownedpool player={"blue"} loopdata={loopdata} playerHasChosen={playerHasChosen} playerteam={playerteam}/>
        
        {playerteam.red == Players.GetLocalPlayer() && <Branch gameloop={gameloopname?.current}/>}
        {playerteam.blue == Players.GetLocalPlayer() && <Branch gameloop={gameloopname?.current}/>}
        <Tip loopdata={loopdata}/>
        <Okbutton playerteam={playerteam} loopdata={loopdata} gameloopname={gameloopname}/>
        <Gloabtip/>
    </BaseBoard>
    }
    </>
}