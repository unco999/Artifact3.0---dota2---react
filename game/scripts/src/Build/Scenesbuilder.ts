import Queue from "../structure/Queue";
import { Card, uuid } from "../instance/Card";
import { Ability, Cardheaps, GoUp, Grave, Hand, ICAScene, IHeapsCardbuilder, LaidDown, Midway, Scenes, ScenesManager } from "../instance/Scenes";
import { Hero } from "../instance/Unit";
import { SmallSkill, TrickSkill } from "../instance/Ability";

/** 负责构造牌堆 */
export class ScenesBuildbehavior {

    static fitler(option:string,PlayerID:PlayerID){
        switch(option){
            case "0":{
                return GameRules.SceneManager.GetGoUpScene(PlayerID)
            }
            case "1":{
                return GameRules.SceneManager.GetMidwayScene(PlayerID)
            }
            case "2":{
                return GameRules.SceneManager.GetLaidDownScene(PlayerID)
            }
        }
    }

    static ScenesBuild(){
        GameRules.SceneManager = new ScenesManager()
        const blue_Cardheaps = new Cardheaps(GameRules.Blue.GetPlayerID(),GameRules.SceneManager)
        const red_Cardheaps = new Cardheaps(GameRules.Red.GetPlayerID(),GameRules.SceneManager)
        GameRules.SceneManager.SetCardheapsScene(blue_Cardheaps)
        GameRules.SceneManager.SetCardheapsScene(red_Cardheaps)
        const blue_Hand = new Hand(GameRules.Blue.GetPlayerID(),GameRules.SceneManager)
        const red_Hand = new Hand(GameRules.Red.GetPlayerID(),GameRules.SceneManager)
        GameRules.SceneManager.SetHandsScene(blue_Hand)
        GameRules.SceneManager.SetHandsScene(red_Hand)
        const blue_mid = new Midway(GameRules.Blue.GetPlayerID(),GameRules.SceneManager)
        const red_mid = new Midway(GameRules.Red.GetPlayerID(),GameRules.SceneManager)
        GameRules.SceneManager.SetMidwayScene(blue_mid)
        GameRules.SceneManager.SetMidwayScene(red_mid)
        const blue_goup = new GoUp(GameRules.Blue.GetPlayerID(),GameRules.SceneManager)
        const red_goup = new GoUp(GameRules.Red.GetPlayerID(),GameRules.SceneManager)
        GameRules.SceneManager.SetGoUpScene(blue_goup)
        GameRules.SceneManager.SetGoUpScene(red_goup)
        const blue_laiddown = new LaidDown(GameRules.Blue.GetPlayerID(),GameRules.SceneManager)
        const red_laiddown = new LaidDown(GameRules.Red.GetPlayerID(),GameRules.SceneManager)
        GameRules.SceneManager.SetLaidDownScene(blue_laiddown)
        GameRules.SceneManager.SetLaidDownScene(red_laiddown)
        const blue_Ability = new Ability(GameRules.Blue.GetPlayerID(),GameRules.SceneManager)
        const red_Ability = new Ability(GameRules.Red.GetPlayerID(),GameRules.SceneManager)
        GameRules.SceneManager.SetAbilityScene(blue_Ability)
        GameRules.SceneManager.SetAbilityScene(red_Ability)
        const blue_Grave = new Grave(GameRules.Blue.GetPlayerID(),GameRules.SceneManager)
        const red_Grave = new Grave(GameRules.Red.GetPlayerID(),GameRules.SceneManager)
        GameRules.SceneManager.SetGraveScene(blue_Grave)
        GameRules.SceneManager.SetGraveScene(red_Grave)
        print("初始化場景完毕")
    }

    static HeapsBuild(PlayerID:PlayerID){
        for(let i = 0 ; i < 25 ; i++){
            const SamallSkillcard = new SmallSkill({"Index":i,Id:i.toString() + ((math.random() > 0.2) ? "trick" : 2),'PlayerID':PlayerID},GameRules.SceneManager.GetCardheapsScene(PlayerID))
            const TrickSkillcard = new TrickSkill({"Index":i,Id:i.toString() + ((math.random() > 0.2) ? "trick" : 2),'PlayerID':PlayerID},GameRules.SceneManager.GetCardheapsScene(PlayerID))
            GameRules.SceneManager.global_add(SamallSkillcard.UUID,SamallSkillcard)
            GameRules.SceneManager.global_add(TrickSkillcard.UUID,TrickSkillcard)
        }
        const _table = CustomNetTables.GetTableValue("Card_group_construction_phase",'herobrach')[PlayerID.toString()]
        for(const brach in _table){
            for(const index in _table[brach]){
                const hero = new Hero({Id:_table[brach][index],Index:-1,PlayerID:PlayerID},GameRules.SceneManager.GetCardheapsScene(PlayerID))
                GameRules.SceneManager.global_add(hero.UUID,hero)
                GameRules.SceneManager.change_secens(hero.UUID,this.fitler(brach,PlayerID).SceneName);
                (hero.Scene as GoUp).AutoAddCard(hero,hero.Index)
            }
        }
        
    }


    


}