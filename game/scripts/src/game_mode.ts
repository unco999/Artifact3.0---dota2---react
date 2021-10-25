import { Timers } from "./lib/timers";
import { reloadable } from "./lib/tstl-utils";
import { AbilityFactory } from "./System/Ability";
import { CenterScene } from "./System/centerScenes";
import { KV } from "./System/KV";

const heroSelectionTime = 999999;

declare global {
    interface CDOTAGamerules {
        Addon: GameMode;
        CenterScene: CenterScene;
        KV:KV
        AbilityFactory:AbilityFactory
        Red:CDOTAPlayer //红队
        Blue:CDOTAPlayer //蓝队
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
        GameRules.AbilityFactory = new AbilityFactory()
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
        if( newState == DOTA_GameState.DOTA_GAMERULES_STATE_HERO_SELECTION){
            Timers.CreateTimer(7,()=>{
                print("当前选择结束")
                Tutorial.SelectHero("npc_dota_hero_bounty_hunter")
                Tutorial.ForceGameStart()
            })
            Timers.CreateTimer(1,()=>{
                CustomNetTables.SetTableValue("Card_group_construction_phase",'playerHasChosen',{1:["-1","-1","-1","-1","-1","-1"]})
                return 5
            })
            Timers.CreateTimer(1,()=>{
                print(GameRules.State_Get())
                return 1
            })
        }
        if (newState == DOTA_GameState.DOTA_GAMERULES_STATE_GAME_IN_PROGRESS) {
            for (let i: PlayerID = 0; i <= 24; ++i) {
                let player = PlayerResource.GetPlayer(i as PlayerID);
                if (player) {
                    if(!GameRules.Red){
                        GameRules.Red = player
                        continue
                    }
                    if(!GameRules.Blue){
                        GameRules.Blue = player
                        continue 
                    }
                }
            }
            GameRules.CenterScene = new CenterScene()
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