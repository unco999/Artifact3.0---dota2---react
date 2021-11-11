declare interface CustomGameEventDeclarations {
    "CARD_CHANGE_SCENES":{change:string}
    "HERO_BRANCH_OVER":any
    "AUTO_SELECT_BRACH":any
    "C2S_CARD_CHANGE_SCENES":{to_scene:string,uuid:string}
    "S2C_CARD_CHANGE_SCENES":{to_scene:string,uuid:string}
    "BLUE_SELECT_HERO_CARD":any
    "RED_SELECT_HERO_CARD":any
    "S2C_CARD_TO_HAND":string[] //卡牌到手牌  返回值是要到达的场景 一个uuid的数组
    "C2S_GET_SCENES":{get:string}
    "S2C_GET_SCENES":string[]
    "S2C_GET_CARD":{Name:string,Index:number,uuid:string,Scene:string}
    "C2S_GET_CARD":{uuid:string}
}
