import React, { useEffect, useMemo, useRef } from "react";
import { useNetTableKey } from "react-panorama";

export const Turnbased = (props:{owend:number}) =>{
    const RemainningTime = useNetTableKey("GameMianLoop","RemainingTime") ?? 0
    const current_oparation = useNetTableKey("GameMianLoop","current_operate_playerid") ?? {cuurent:""}
    const prefix = useMemo(()=> props.owend == Players.GetLocalPlayer() ? "my_" : "you_",[props])
    const ref = useRef<Panel|null>()

    const not =  "NOT"

    const label = props.owend == Players.GetLocalPlayer() ? RemainningTime?.cuurent : not

    useEffect(()=>{
        if(current_oparation.cuurent == "" ) return;
        if(parseInt(current_oparation.cuurent) == Players.GetLocalPlayer() && props.owend == Players.GetLocalPlayer()){
            ref.current?.AddClass("high")
        }else{
            ref.current?.RemoveClass("high")
        }
    },[current_oparation])

    const memo = () => {
        if(current_oparation.cuurent == "" ) return ()=>{$.Msg("还没有到你的回合大哥")} ;
        if(parseInt(current_oparation.cuurent) == Players.GetLocalPlayer() && props.owend == Players.GetLocalPlayer()){
            return ()=>{GameEvents.SendCustomGameEventToServer("C2S_CLICK_SKIP",{})}
        }
        return ()=>{$.Msg("还没有到你的回合大哥")}
    }


    return <Panel className={prefix + "Turnbased"}>
        <Panel className={"defualt time"} onmouseover={panel=>$.DispatchEvent("DOTAShowTextTooltip",panel,"倒数计时")} onmouseout={panel=>$.DispatchEvent('DOTAHideTextTooltip')}>
        <Label text={label}/>
        </Panel>
        <Panel className={"defualt coin"} onmouseover={panel=>$.DispatchEvent("DOTAShowTextTooltip",panel,"你的金币呀大傻子")} onmouseout={panel=>$.DispatchEvent('DOTAHideTextTooltip')}>
        <Label text={54}/>
        </Panel>
        <Panel className={"defualt frame"}>
            <Panel className={"defualt skip "} onmouseover={panel=>$.DispatchEvent("DOTAShowTextTooltip",panel,"商店")} onmouseout={panel=>$.DispatchEvent('DOTAHideTextTooltip')}>
             <Label text={"SHOP"}/>
             </Panel>
             <Panel ref={panel => ref.current = panel} className={"defualt skip" } 
             onmouseover={panel=>$.DispatchEvent("DOTAShowTextTooltip",panel,"跳过回合")} onmouseout={panel=>$.DispatchEvent('DOTAHideTextTooltip')}
             onactivate={()=>memo()()}
             >
             <Label text={"SKIP"}/>
             </Panel>
             <Panel className={"defualt skip"} onmouseover={panel=>$.DispatchEvent("DOTAShowTextTooltip",panel,"暂时还不知道是什么")} onmouseout={panel=>$.DispatchEvent('DOTAHideTextTooltip')}>
             <Label text={"unknown"}/>
             </Panel>
        </Panel>
    </Panel>
}