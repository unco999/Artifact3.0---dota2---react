import React from 'react';
import { render } from 'react-panorama';
import { ReactLogo } from './components/react_panorama';
import { Test } from './components/test/main';

render(<Test />, $.GetContextPanel()); // 默认在中间渲染的红色REACT-PANORAMA标志，从这里开始修改为你自己喜欢的

(() => {
    $.Msg("asdsasdasdsadadsa")
    // GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_TOP_HEROES, false); // 你也可以按你之前喜欢的方式写代码
    // GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_TOP_TIMEOFDAY, false);
})();
