declare interface CustomNetTableDeclarations {
    Card_group_construction_phase:{   //轮选极端
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
        smallCycle:{current:number}
    }
    Scenes:{
        [string:string]:Record<number,string>
    }
}
