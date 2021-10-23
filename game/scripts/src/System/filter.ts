const filtrationTable = [
    "city",
    'eventname'
]

export function filter(str:string){
    let bool = true
    filtrationTable.forEach(value=>{
        if(str.indexOf(value) > -1){
            bool = false
        } 
    })
    return bool
}
