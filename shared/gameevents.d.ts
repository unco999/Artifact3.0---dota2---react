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
        data:any
    };
    "BLUE_SELECT_HERO_CARD": any;
    "RED_SELECT_HERO_CARD": any;
    "S2C_CARD_TO_HAND": string[]; //卡牌到手牌  返回值是要到达的场景 一个uuid的数组
    "C2S_GET_SCENES": { get: string; };
    "S2C_GET_SCENES": string[];
    "S2C_GET_CARD": { Id: string, Index: number, uuid: string, Scene: string, type: string,playerid:PlayerID,data:any};
    "C2S_GET_CARD": { uuid: string; };
    "C2S_GET_CANSPACE": {uuid:string}; //查询我方可占空格
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
    "S2C_SEND_TOWER":{heal:number,state:"death"|"defualt",brach:number,playerid:PlayerID,uuid:string}
    "C2S_ATTACK_TOWER":{damage:number,Attackplayerid:PlayerID,index:number}
    "C2S_GET_ATTRIBUTE":{uuid:string}
    "S2C_SEND_ATTRIBUTE":{uuid:string,attack:number,arrmor:number,heal:number}
    "TEST_C2S_CALL_ATTACK":{}
    "S2C_SEND_DEATH_ANIMATION":{uuid:string},
    "S2C_SEND_ATTACK":{uuid:string},
    "C2S_CALL_ATTACK":{},
    "C2S_SEATCH_TARGET_OPEN":{magic_brach:number,magic_range:number,has_hero_ability:string,magic_team:number},
    "C2S_SEATCH_TARGET_OFF":{magic_brach:number,magic_range:number,has_hero_ability:string,magic_team:number},
    "S2C_SEATCH_TARGET_OPEN":{uuid:string},
    "S2C_SEATCH_TARGET_OFF":{uuid:string},
    "S2C_SKILL_READY":{uuid:string},
    "S2C_SKILL_OFF":{uuid:string},
    "C2S_SPELL_SKILL":{SKILL_ID:string},
    "S2C_HURT_DAMAGE":{particle:string,uuid:string}
    "S2C_TOWER_INIT":{playerid:PlayerID,uuid:string,brach:number,heal:number},
    "C2S_TOWER_INIT":{owner:PlayerID,brach:number}
    "C2S_GET_ENRGY":{uuid:string}
    "S2C_SEND_ENRGY":{uuid:string,max_enrgy:number,current_enrgy:number,cuurent_max:number},
    "C2S_GET_INIT_ENRGY":{brach:number,PLAYER:number},
    "S2C_SEND_INIT_ENRGY":{playerid:PlayerID,brach:number,max_enrgy:number,current_enrgy:number,uuid:string,cuurent_max:number},
    "C2S_TEST_REDUCE":{},
    "C2S_TEST_MAX_REDUCE":{},
    "C2S_SEND_up_equiment":{index:number,uuid:string,item:string}
    "S2C_SEND_UP_EQUIMENT_SHOW":{uuid:string,index:number,item:string}
    "C2S_TEST_RANDOM_EQUIP":{}
    "S2C_INFORMATION":{information:string}
    "C2S_GET_EQUIP":{uuid:string}
    "S2C_SEND_EQUIP":{data:Record<string,string>,uuid:string}
    "SC2_PLAY_EFFECT":{uuid:string,paticle:string,cameraOrigin:string,lookAt:string}
    "C2S_CLICK_SKIP":{}
    "C2S_SEND_TEST":{}
    "C2S_TEST_STATE":{state:string}
    "C2S_TEST_SCENE_LINK":{SCENE:string}
    "C2S_GET_GRAVE_ARRAY":{}
    "S2C_SEND_GRAVE_ARRAY":string[]
    "C2S_BUY_ITEM":{itemname:string}
    "S2C_BRUSH_ITEM":{}
    "S2C_BRUSH_ABILITY":{}
}
