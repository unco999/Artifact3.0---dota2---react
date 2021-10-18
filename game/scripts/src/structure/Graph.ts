import { reloadable } from "../lib/tstl-utils";

/**
 * @param T 是节点中存储的内容
 * @param V 是节点边中的权重
 */
@reloadable
export class Graph<T> {
    vertexCollection:Map<T,Vertex<T>> = new Map()
    edgeCollection:Set<Edge<T>> = new Set()
    city:Map<number,true> = new Map()
    floyddata:any

    constructor(){

    }

    print(){
        this.vertexCollection.forEach(value=>{
           for(let i of value.out_edges){
              print("v: " + value.value + ":" + i + " weight:" + i.weight +"\r\n")
           }
        })
    }

    /**
     * 传一个节点对象Key
     * 
    */
    searchShortestPath(valuekeys:T){
        const begin = this.vertexCollection.get(valuekeys)
        if(begin == null) return;

        const selectionpath = new Map<T,number>()
        const paths = new Map<Vertex<T>,number>()
        const allpath:Map<T,pathinfo<T>> = new Map() 
        begin.out_edges.forEach(path=>{
            paths.set(path.to,path.weight)
            const _pathinfo = new pathinfo<T>()
            _pathinfo.addPath(begin.value,path.weight)
            allpath.set(path.to.value,_pathinfo)
        })
        while(paths.size != 0){
            const minpath = this.getMinPath(paths)
            selectionpath.set(minpath.minvertex.value,minpath.minweight)
            paths.delete(minpath.minvertex)
            for(let edge of minpath.minvertex.out_edges){
                if(selectionpath.get(edge.to.value) != null || edge.to.value === begin.value) continue
                   const newweight = minpath.minweight + edge.weight
                   const oldweight = +paths.get(edge.to)
               if(oldweight == null ||  oldweight > newweight){
                  if(allpath.get(edge.to.value) == null){
                      const _pathinfo = new pathinfo<T>()
                     _pathinfo.addPath(edge.form.value,newweight)
                      allpath.set(edge.to.value,_pathinfo)
                  }else{
                     allpath.get(edge.to.value).addPath(minpath.minvertex.value,newweight)
                  }
                  print(edge.weight)
                  print("以上是更新的权值")
                  paths.set(edge.to,newweight)
                  print(edge.to.value,edge.weight)
              }
            }
        }
        allpath.forEach((_pathinfo,value)=>{
            print(value,_pathinfo)
        })
        return selectionpath
    }

    floyd(){
        const n = this.vertexCollection.size + 30
        print("顶点数",n)
        const matrix:Array<number[]> = []
        const path:Array<number[]> = []
        for(let i = 1 ; i < n + 1  ; i++){
            matrix[i-1] = []
            path[i-1] = []
            for(let j = 0 ; j < n + 1; j++){
               path[i-1][j-1] = j
               if(i==j){
                  matrix[i-1][j-1] = 0
               }else{
                  matrix[i-1][j-1] = 999999
               }
            }
        }
        this.edgeCollection.forEach(edge=>{
          if(typeof(edge.form.value)=='number' && typeof(edge.to.value)=='number'){
              print("form",edge.form.value,"to",edge.to.value)
              matrix[edge.form.value-1][edge.to.value - 1] = edge.weight
          }
        })
        for(let k = 1 ; k < n + 1 ; k++){
          for(let i = 1 ; i < n + 1 ; i++){
            for(let j = 1 ; j < n + 1 ; j++){
                if(matrix[i-1][k-1]+matrix[k-1][j-1] < matrix[i-1][j-1]){
                    matrix[i-1][j-1] = matrix[i-1][k-1]+matrix[k-1][j-1]
                    path[i - 1][j - 1] = path[i - 1][k - 1]
              }
            }
          }
        }
        // for(let i = 1 ; i < n + 1 ; i ++){
        //     for(let j = 1 ; j < n + 1; j++){
        //         print(`${i} => ${j} : ` + matrix[i-1][j-1])
        //     }
        //     print("换行")
        // }
        this.floyddata = path
    }

    getfloydpath(from:T,to:T){
      const path:Array<string> = []
      path.push("path_"+from)
      let k = this.floyddata[from][to]
      path.push("path_"+k)
      while( k != to){
          k = this.floyddata[k][to]
          path.push("path_"+k)
      }
      return path
  }

    private getMinPath(paths:Map<Vertex<T>,number>){ 
        let minweight:number = null
        let minvertex:Vertex<T> = null
          paths.forEach((weight,vertex)=>{
              if(minweight == null){
                minvertex = vertex  
                minweight = weight
              }
              if(weight < minweight){
                minvertex = vertex  
                minweight = weight
              }
          })
        return {minvertex:minvertex,minweight:minweight}
    }


    addVertex(value:T){
        if(!this.vertexCollection.has(value)){
            this.vertexCollection.set(value,new Vertex(value))
        }
        return this.vertexCollection.get(value)
    }

    addEdge(from:T,to:T,weight:number,unhappy?:boolean){
        let fromVertex = this.vertexCollection.get(from)
        if(fromVertex == null){
            fromVertex = new Vertex<T>(from)
            this.vertexCollection.set(from,fromVertex)
        }
        let toVertex = this.vertexCollection.get(to)
        if(toVertex == null){
            toVertex = new Vertex<T>(to)
            this.vertexCollection.set(to,toVertex)
        }
        let edge = new Edge<T>(fromVertex,toVertex) 
        edge.weight = weight
        fromVertex.out_edges.forEach((value)=>{
            if(value.equals(edge)){
              fromVertex.out_edges.delete(value)
              toVertex.in_edges.delete(value)
              this.edgeCollection.delete(value)
            }
        })
        fromVertex.out_edges.add(edge)
        toVertex.in_edges.add(edge)
        this.edgeCollection.add(edge)
        if(unhappy){
          const counteredge = new Edge(edge.to,edge.form)
          counteredge.weight = edge.weight;
          fromVertex.in_edges.add(counteredge)
          toVertex.out_edges.add(counteredge)
          this.edgeCollection.add(counteredge)
        }
        return edge
    }

    removeEdge(from:T,to:T){
        const fromVertex = this.vertexCollection.get(from)
        if(!fromVertex) return;
        const toVertex = this.vertexCollection.get(to)
        if(!toVertex) return;
        const edge = new Edge(fromVertex,toVertex)
        fromVertex.out_edges.forEach((value)=>{
          if(value.equals(edge)){
            fromVertex.out_edges.delete(value)
            toVertex.in_edges.delete(value)
            this.edgeCollection.delete(value)
          }
        })
    }

    removeVertex(value:T){
        const vertex = this.vertexCollection.get(value)
        if(vertex == null) return;
        this.vertexCollection.delete(value)
        vertex.out_edges.forEach(edge=>{
            this.edgeCollection.delete(edge)
            edge.to.in_edges.delete(edge)
        })
        vertex.in_edges.forEach(edge=>{
          this.edgeCollection.delete(edge)
          edge.form.out_edges.delete(edge)
      })
    }

    get verticesSize(){
       return this.vertexCollection.size
    }

    get edgeSize(){
      return this.edgeCollection.size
    }
}

export class pathinfo<T>{
    pathlist:Array<{prev:T,weight:number}> = []

    addPath(prev:T,weight:number){
      this.pathlist.push({prev,weight})
    }

    toString(){
        return json.encode(this.pathlist)
    }
}

export class Vertex<T>{
    value:T
    in_edges:Set<Edge<T>> = new Set()
    out_edges:Set<Edge<T>> = new Set()
    
    constructor(value:T){
      this.value = value
    }

    toString(){
      return this.value
    }
}

export class Edge<T>{
    weight:number
    to:Vertex<T>
    form:Vertex<T>

    constructor(fromVertex:Vertex<T>,toVertex:Vertex<T>){
      this.to = toVertex
      this.form = fromVertex
    }

    equals(edge:Edge<T>):boolean{
       return edge.form === this.form && edge.to === this.to
    }

    toString(){
        return `${this.form} -> ${this.to}`
    }
}