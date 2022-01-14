declare interface CustomNetTableDeclarations {
    Card_group_construction_phase:{   //轮选
        playerHasChosen:Record<string,number[]> //每个玩家拥有英雄
        heroThatCanChooseOnTheCurrentField:number[] //当前场上可选英雄
        selectloop:{timeLeft:number,currentteam:string,optionalnumber:number,remainingOptionalQuantity:number}
        team:{red:number,blue:number}
        heroSelected:Array<number>
        brachisok:{[key:number]:boolean}
        herobrach:{[key :number ]:{0:Array<number>,1:Array<number>,2:Array<number>}}; // 已确定的分路信息
    }
    GameMianLoop:{
        currentLoopName:{current:string}
        smallCycle:{current:string}
        RemainingTime:{cuurent:string}
        thisRoundOfBluefield:{option:number,skip:number} //option false 未操作 true 已操作  skip 已跳过
        thisRoundOfRedfield:{option:number,skip:number} //option false 未操作 true 已操作  skip 已跳过
        uplineSettlement:{cuurent:string}, //上路结算情况
        midCircuitSettlement:{cuurent:string},//中路结算情况
        lowerSettlement:{cuurent:string}//下路结算情况
        current_operate_playerid:{cuurent:string} //当前操作的playerid
        current_operate_brach:{cuurent:string} //当前策略的路线
        current_battle_brach:{cuurent:string} //当前战斗结算的路线
        option_mask_state:{cuurent:number} //当前全局状态操作掩码
        red_gold:{cuurent:number} //红色的金币
        blue_gold:{cuurent:number} // 蓝色的金币
        effect_view_stage:{cuurent:number} // 1是正在播放特效 0是没有播放
    }
    Scenes:{
        [string:string]:Record<number,string>
    }
}
