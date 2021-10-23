import React from "react";
import { Hand_Card } from "./hand_card";

export const Hand_area = ({...args}) =>{
    
    return <Panel {...args}>
            <Hand_Card index={1} max={5}/>
            <Hand_Card index={2} max={5}/>
            <Hand_Card index={3} max={5}/>
            <Hand_Card index={4} max={5}/>
            <Hand_Card index={5} max={5}/>
        </Panel>
}