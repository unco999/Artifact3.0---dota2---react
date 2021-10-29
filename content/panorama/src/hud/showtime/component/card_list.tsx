import React from "react";
import {Card} from './card'

export const CardList = () => {
    const owendSelectHeroCard = CustomNetTables.GetTableValue("Card_group_construction_phase","playerHasChosen")

    return <> 
        <Panel className={"RedCardList"}>  
        <Card heroid={owendSelectHeroCard?.RedSelectstage["1"] ?? -1}/>
        <Card heroid={owendSelectHeroCard?.RedSelectstage["2"] ?? -1}/>
        <Card heroid={owendSelectHeroCard?.RedSelectstage["3"] ?? -1}/>
        <Card heroid={owendSelectHeroCard?.RedSelectstage["4"] ?? -1}/>
        <Card heroid={owendSelectHeroCard?.RedSelectstage["5"] ?? -1}/>
        </Panel>
        <Panel className={"BlueCardList"}>  
        <Card heroid={owendSelectHeroCard?.BlueSelectstage["1"] ?? -1}/>
        <Card heroid={owendSelectHeroCard?.BlueSelectstage["2"] ?? -1}/>
        <Card heroid={owendSelectHeroCard?.BlueSelectstage["3"] ?? -1}/>
        <Card heroid={owendSelectHeroCard?.BlueSelectstage["4"] ?? -1}/>
        <Card heroid={owendSelectHeroCard?.BlueSelectstage["5"] ?? -1}/>
        </Panel>
        </>
}