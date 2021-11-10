import React from "react";
import { Card_container } from "./card_container";

export const Battle_right_area = (props:{red:number,blue:number,owner:number}) =>{
  const prefix = (props.owner == Players.GetLocalPlayer() ? "my_" : 'you_' )

  return <Panel className={prefix +  "battle_right_area_main"}>
            <Panel className={prefix + "Card_container_parent"}>
            <Card_container className={"Card_container_right_1"}/>
            <Card_container className={"Card_container_right_2"}/>
            <Card_container className={"Card_container_right_3"}/>
            <Card_container className={"Card_container_right_4"}/>
            <Card_container className={"Card_container_right_5"}/>
            </Panel>
        </Panel>
}