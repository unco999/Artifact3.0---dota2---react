import { Card, CardParameter, professionalMagicCard } from "./Card";
import { ICAScene } from "./Scenes";

/**职业魔法卡实例 */
export class professionalAbilityCard extends Card implements professionalMagicCard{

    constructor(CardParameter:CardParameter,Scene:ICAScene){
        super(CardParameter,Scene)
    }

    SPEEL_ABILITY(uuid: string) {
        throw new Error("Method not implemented.");
    }
    SPEEL_TARGET(target_uuid: string) {
        throw new Error("Method not implemented.");
    }
    SPEEL_SCNECE(scene_name: string) {
        throw new Error("Method not implemented.");
    }

}