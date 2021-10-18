import { Effect } from "./modifier";

export class Tower{
    owner:PlayerID
    route:number //线路
    modifiler:Effect[] = [] //该塔拥有的modifier
    constructor(owner:PlayerID,route:number){
        this.owner = owner
        this.route = route
    }

    addmodifer(Effect:Effect){
        this.modifiler.push(Effect)
    }
}