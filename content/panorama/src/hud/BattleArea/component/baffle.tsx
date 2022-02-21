import React from "react";

export const Baffle = () =>{
    return <DOTAScenePanel className={"Baffle"} hittest={false} style={{zIndex:50,width:"1920px",height:"70%",y:'0px'}} map={"baffle"} renderdeferred={false} particleonly={true} antialias={true}>
        <Label text={"战争迷雾"} style={{fontSize:'50px',align:'center center'}}/>
    </DOTAScenePanel>
}