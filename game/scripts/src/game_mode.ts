import { HandHeapsCardbuilder } from "./Build/Scenesbuilder";
import { Cardheaps, Hand, ScenesManager } from "./instance/Scenes";
import { Timers } from "./lib/timers";
import { reloadable } from "./lib/tstl-utils";
import { BattleGameLoop } from "./Manager/BattleGameLoop";
import { ChooseHeroCardLoop, RedSelectstage } from "./System/ChooseHeroCard";
import { KV } from "./System/KV";

const heroSelectionTime = 0;

declare global {
    interface CDOTAGamerules {
        Addon: GameMode;
        KV:KV
        ChooseHeroCardLoop:ChooseHeroCardLoop
        Red:CDOTAPlayer //红队
        Blue:CDOTAPlayer //蓝队
        gamemainloop:BattleGameLoop
        SceneManager:ScenesManager
    }
}

@reloadable
export class GameMode {
    public static Precache(this: void, context: CScriptPrecacheContext) {
        PrecacheResource("particle", "particles/units/heroes/hero_meepo/meepo_earthbind_projectile_fx.vpcf", context);
        PrecacheResource("soundfile", "soundevents/game_sounds_heroes/game_sounds_meepo.vsndevts", context);
    }

    public static Activate(this: void) {
        GameRules.Addon = new GameMode();
        GameRules.KV = new KV();
    }

    constructor() {
        this.configure();
        ListenToGameEvent("game_rules_state_change", () => this.game_rules_state_change(), undefined);
    }

    private configure(): void {
        GameRules.SetCustomGameTeamMaxPlayers(DOTATeam_t.DOTA_TEAM_GOODGUYS, 1);
        GameRules.SetCustomGameTeamMaxPlayers(DOTATeam_t.DOTA_TEAM_BADGUYS, 1);
        GameRules.SetShowcaseTime(0);
        GameRules.SetHeroSelectionTime(heroSelectionTime);
        const gameEntity = GameRules.GetGameModeEntity()
        gameEntity.SetHudCombatEventsDisabled(false)
        gameEntity.SetFogOfWarDisabled(false);
        gameEntity.SetSelectionGoldPenaltyEnabled(false);
        gameEntity.SetLoseGoldOnDeath(false);
        GameRules.SetHeroRespawnEnabled(false);
        GameRules.SetPreGameTime(3);
        GameRules.SetCustomGameSetupTimeout(-1)
        GameRules.SetSameHeroSelectionEnabled(true);
        // if (IsInToolsMode()) {
        //     GameRules.SetPreGameTime(0);
        // }
    }

    private game_rules_state_change() {
        let newState = GameRules.State_Get();
        if( newState == DOTA_GameState.DOTA_GAMERULES_STATE_PRE_GAME){
            for (let i: PlayerID = 0; i <= 24; ++i) {
                let player = PlayerResource.GetPlayer(i as PlayerID);
                if (player) {
                    if(!GameRules.Blue){
                        GameRules.Blue = player
                        continue
                    }
                    if(!GameRules.Red){
                        GameRules.Red = player
                        continue 
                    }
                }
            }
            CustomNetTables.SetTableValue("Card_group_construction_phase","team",{red:GameRules.Red.GetPlayerID(),blue:GameRules.Blue.GetPlayerID()})
            GameRules.ChooseHeroCardLoop = new ChooseHeroCardLoop() // 英雄轮询阶段
            GameRules.ChooseHeroCardLoop.SetcuurentsettingState = new RedSelectstage(1) // 暂时以红队开始选择  选牌次数为一次
            GameRules.SceneManager = new ScenesManager()
            const blue_Cardheaps = new Cardheaps(GameRules.Blue.GetPlayerID(),GameRules.SceneManager)
            const red_Cardheaps = new Cardheaps(GameRules.Red.GetPlayerID(),GameRules.SceneManager)
            blue_Cardheaps.Heapsinit(new HandHeapsCardbuilder(blue_Cardheaps,GameRules.Blue.GetPlayerID()))
            red_Cardheaps.Heapsinit(new HandHeapsCardbuilder(red_Cardheaps,GameRules.Red.GetPlayerID()))
            GameRules.SceneManager.SetCardheapsScene(blue_Cardheaps)
            GameRules.SceneManager.SetCardheapsScene(red_Cardheaps)
            const blue_Hand = new Hand(GameRules.Blue.GetPlayerID(),GameRules.SceneManager)
            const red_Hand = new Hand(GameRules.Red.GetPlayerID(),GameRules.SceneManager)
            GameRules.SceneManager.SetHandsScene(blue_Hand)
            GameRules.SceneManager.SetHandsScene(red_Hand)
        }
        if (newState == DOTA_GameState.DOTA_GAMERULES_STATE_GAME_IN_PROGRESS) {
        }
        if (newState == DOTA_GameState.DOTA_GAMERULES_STATE_CUSTOM_GAME_SETUP) {
            if(IsInToolsMode()){
                if(GameRules.Blue == undefined){
                    const bot = Tutorial.AddBot("","","",true)
                    let playerCount = PlayerResource.GetPlayerCount();
                    GameRules.Blue = PlayerResource.GetPlayer(playerCount as PlayerID)
                }
            }
        }
}


    public Reload() {
        print("Script reloaded!");
    }
}