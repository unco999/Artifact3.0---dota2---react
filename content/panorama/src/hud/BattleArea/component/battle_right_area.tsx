import React from "react";
import { Card_container } from "./card_container";

export const Battle_right_area = (props:{red:number,blue:number,owner:number}) =>{
  const prefix = (props.owner == Players.GetLocalPlayer() ? "my_" : 'you_' )

  return <Panel className={prefix +  "battle_right_area_main"}>
            <Panel className={prefix + "Card_container_parent"}>
            <Card_container onwer={props.owner} index={0} brach={2} className={"Card_container_center_1"}/>
            <Card_container onwer={props.owner} index={1} brach={2} className={"Card_container_center_2"}/>
            <Card_container onwer={props.owner} index={2} brach={2} className={"Card_container_center_3"}/>
            <Card_container onwer={props.owner} index={3} brach={2} className={"Card_container_center_4"}/>
            <Card_container onwer={props.owner} index={4} brach={2} className={"Card_container_center_5"}/>
            </Panel>
        </Panel>
}