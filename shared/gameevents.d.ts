declare interface CustomGameEventDeclarations {
    "CARD_CHANGE_SCENES":{change:string}
    "HERO_BRANCH_OVER":any
    "AUTO_SELECT_BRACH":any
    "C2S_CARD_CHANGE_SCENES":{to_scene:string,uuid:string}
    "S2C_CARD_CHANGE_SCENES":{to_scene:string,uuid:string}
    "BLUE_SELECT_HERO_CARD":any
    "RED_SELECT_HERO_CARD":any
    "S2C_CARD_TO_HAND":{[UUID:string]:string} //卡牌到手牌  返回值是要到达的场景
}