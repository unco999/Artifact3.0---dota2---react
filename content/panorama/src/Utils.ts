export function JsonString2Array(json:any){
    const list:Array<any> = []
    if(!json) return list
    const keys = Object.keys(json)
    for(const key in json){
        if(json[key])
        list[+key-1] = json[key]
    }
    return list
}

export function JsonString2Arraystrt0(json:any){
    const list:Array<any> = []
    if(!json) return list
    const keys = Object.keys(json)
    for(const key in json){
        if(json[key])
        list[+key] = json[key]
    }
    return list
}