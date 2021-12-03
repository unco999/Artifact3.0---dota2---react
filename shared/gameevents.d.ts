declare interface CustomGameEventDeclarations {
    "CARD_CHANGE_SCENES": { change: string; };
    "HERO_BRANCH_OVER": any;
    "AUTO_SELECT_BRACH": any;
    "C2S_CARD_CHANGE_SCENES": { to_scene: string, uuid: string, index: number; };
    "S2C_CARD_CHANGE_SCENES": {
        Id: string;
        Index: number;
        uuid: string;
        Scene: string;
        type:string;
        playerid:PlayerID;
    };
    "BLUE_SELECT_HERO_CARD": any;
    "RED_SELECT_HERO_CARD": any;
    "S2C_CARD_TO_HAND": string[]; //卡牌到手牌  返回值是要到达的场景 一个uuid的数组
    "C2S_GET_SCENES": { get: string; };
    "S2C_GET_SCENES": string[];
    "S2C_GET_CARD": { Id: string, Index: number, uuid: string, Scene: string, type: string,playerid:PlayerID };
    "C2S_GET_CARD": { uuid: string; };
    "C2S_GET_CANSPACE": {}; //查询我方可占空格
    "S2C_SEND_CANSPACE": Record<string, string[]>;
    "C2C_CLOSE_MY_BRACH_TIP": {};
    "C2S_actingOnCard": { attach: string, my: string; };
    "S2C_cast_Ability":{uuid:string};
    "C2S_GET_INDEX":{uuid:string}
    "S2C_SEND_INDEX":{[keys:string]:number}
    "C2S_BRUSH_SOLIDER":{}
    "S2C_BRUSH_SOLIDER":{}
    "TEST_C2S_DEATH":{uuid:string}
    "TEST_C2S_CALL_CENTER":{}
    "C2S_GET_TOWER":{index:number}
    "S2C_SEND_TOWER":{heal:number,state:"death"|"defualt"}
    "C2S_ATTACK_TOWER":{damage:number,Attackplayerid:PlayerID,index:number}
}
