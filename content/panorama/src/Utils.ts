export function JsonString2Array(json:any){
    const list:Array<any> = []
    const keys = Object.keys(json)
    for(const key in json){
        if(json[key])
        list[+key-1] = json[key]
    }
    return list
}