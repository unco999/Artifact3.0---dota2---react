declare interface CustomNetTableDeclarations {
    Card_group_construction_phase:{   //轮选极端
        playerHasChosen:Record<string,number[]> //每个玩家拥有英雄
        heroThatCanChooseOnTheCurrentField:number[] //当前场上可选英雄
        selectloop:{timeLeft:number,currentteam:string,optionalnumber:number,remainingOptionalQuantity:number}
        team:{red:number,blue:number}
        heroSelected:Array<number>
    }
    game_timer: {
        game_timer: {
            current_time: number;
            current_state: 1 | 2 | 3 | 4 | 5;
            current_round: number;
        };
    };
    hero_list: {
        hero_list: Record<string, string> | string[];
    };
    custom_net_table_1: {
        key_1: number;
        key_2: string;
    };
    custom_net_table_3: {
        key_1: number;
        key_2: string;
    };
}
