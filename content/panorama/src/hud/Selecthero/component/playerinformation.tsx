import React from "react";

export const Playerinformation = ({...args}) => {
    return <Panel className={`${args.player}Playerinformation`}>
            <Label text={args.player} style={{fontSize:'50px'}}/>
        </Panel>
}