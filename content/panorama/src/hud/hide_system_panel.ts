 export function hide_system_panel(){
    const hudRoot = $.GetContextPanel()
    .GetParent()!
    .GetParent()!
    .GetParent()!;
    function HideHudElements(name: string) {
        var element = hudRoot.FindChildTraverse(name);
        if (element != null) {
            element.style.visibility = "collapse";
        }
    }
    HideHudElements("quickstats");
    HideHudElements("ToggleScoreboardButton");
    HideHudElements("GlyphScanContainer");
    HideHudElements("inventory_tpscroll_container");
    HideHudElements("inventory_neutral_slot_container");
    HideHudElements("quickstats");
    HideHudElements("KillCam");
    HideHudElements("stash");
    HideHudElements("stackable_side_panels");
    HideHudElements("SpectatorItemsButton");
    HideHudElements("GoldGraphButton");
    HideHudElements("XPGraphButton");
    HideHudElements("WinGraphButton");
    HideHudElements("SpectatorOptionsButton");
    HideHudElements("SpectatorGraph");
    HideHudElements("RoshanTimerContainer");
    HideHudElements("DisconnectButton");
    HideHudElements("spectator_game_stats");
    HideHudElements("spectator_quickstats");
    HideHudElements("minimap_container");
    HideHudElements("lower_hud");
    HideHudElements("topbar")
 }
 
