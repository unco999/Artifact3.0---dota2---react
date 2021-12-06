import { CAModifiler, modifilertype } from "../instance/Modifiler";

export class testmodifler extends CAModifiler{
    constructor(){
        super(
            "test_modifiler",modifilertype.冻结,3,true
        )
    }

    override get influenceArrmor(){
        return -10
    }

}