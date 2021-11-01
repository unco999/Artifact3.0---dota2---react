import React from "react";
import {ShowCard} from './card'

export const CardList = () => {
    const owendSelectHeroCard = CustomNetTables.GetTableValue("Card_group_construction_phase","playerHasChosen")


    $.Msg(owendSelectHeroCard)

    return <> 
        <Panel className={"RedCardList"}>  
        <ShowCard heroid={owendSelectHeroCard?.RedSelectstage["1"] ?? -1} index={1}/>
        <ShowCard heroid={owendSelectHeroCard?.RedSelectstage["2"] ?? -1} index={2}/>
        <ShowCard heroid={owendSelectHeroCard?.RedSelectstage["3"] ?? -1} index={3}/>
        <ShowCard heroid={owendSelectHeroCard?.RedSelectstage["4"] ?? -1} index={4}/>
        <ShowCard heroid={owendSelectHeroCard?.RedSelectstage["5"] ?? -1} index={5}/>
        </Panel>
        <Panel className={"BlueCardList"}>  
        <ShowCard heroid={owendSelectHeroCard?.BlueSelectstage["1"] ?? -1} index={1}/>
        <ShowCard heroid={owendSelectHeroCard?.BlueSelectstage["2"] ?? -1} index={2}/>
        <ShowCard heroid={owendSelectHeroCard?.BlueSelectstage["3"] ?? -1} index={3}/>
        <ShowCard heroid={owendSelectHeroCard?.BlueSelectstage["4"] ?? -1} index={4}/>
        <ShowCard heroid={owendSelectHeroCard?.BlueSelectstage["5"] ?? -1} index={5}/>
        </Panel>
        </>
}