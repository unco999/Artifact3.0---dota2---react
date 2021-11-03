import { Card }from './Card'
import { HandHeapsCardbuilder } from './Scenesbuilder';
import { Cardheaps, ICAScene,ICASceneManager, ScenesManager }from './Scenes'

DeepPrintTable(GameRules.Cardheaps.getAll())
print("打印出兑")
DeepPrintTable(GameRules.Cardheaps.dequeue())