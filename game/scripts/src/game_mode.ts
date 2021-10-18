import { reloadable } from "./lib/tstl-utils";
import { AbilityFactory } from "./System/Ability";
import { CenterScene } from "./System/centerScenes";
import { KV } from "./System/KV";

const heroSelectionTime = 10;

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
        GameRules.CenterScene = new CenterScene()
        GameRules.AbilityFactory = new AbilityFactory()
    }

    constructor() {
        this.configure();
        ListenToGameEvent("game_rules_state_change", () => this.game_rules_state_change(), undefined);
    }

    private configure(): void {
        GameRules.SetCustomGameTeamMaxPlayers(DOTATeam_t.DOTA_TEAM_GOODGUYS, 3);
        GameRules.SetCustomGameTeamMaxPlayers(DOTATeam_t.DOTA_TEAM_BADGUYS, 3);

        GameRules.SetShowcaseTime(0);
        GameRules.SetHeroSelectionTime(heroSelectionTime);
    }

    private game_rules_state_change() {
        let newState = GameRules.State_Get();
        if (newState == DOTA_GameState.DOTA_GAMERULES_STATE_GAME_IN_PROGRESS) {
        }
        if (newState == DOTA_GameState.DOTA_GAMERULES_STATE_CUSTOM_GAME_SETUP) {
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
        }
}


    public Reload() {
        print("Script reloaded!");
    }
}