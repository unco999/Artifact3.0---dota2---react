import React from "react";

export const Card = (props:{heroid:number}) =>{
    return <DOTAHeroImage hittest={false} heroid={props.heroid as HeroID}  heroimagestyle={"portrait"} className={"Card"}/>
}