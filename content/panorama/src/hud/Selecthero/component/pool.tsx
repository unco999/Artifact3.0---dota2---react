import React from "react";
import shortid from "shortid";
import { Card } from "./SelectCardCompoent";

export const Pool = () => {
    const heroid = [1,2,3,4]

    return <Panel className={"Pool"}>
        {heroid.map(value=><Card key={shortid.generate()} id={value}/>)}
    </Panel>
}