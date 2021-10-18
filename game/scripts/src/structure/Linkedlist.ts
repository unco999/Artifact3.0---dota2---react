import { reloadable } from '../lib/tstl-utils';

@reloadable
export class Node<T> {
    _data:T
    _prev:Node<T>
    _next:Node<T>
    constructor(data:T){
        this._data = data
        this._prev = undefined
        this._next = undefined
    }
}

@reloadable
export class Linkedlist<T> {
    private _head:Node<T>
    private _tail:Node<T>
    private _length:number;

    constructor(){
        this._head = undefined;
        this._tail = undefined;
        this._length = 0
    }

    append(data:T):boolean{
        let new_node = new Node(data)
        if(this._head == undefined){
            this._head = new_node
            this._tail = new_node
            this._head._prev = undefined
            this._tail._next = undefined
        }else{
            this._tail._next = new_node
            new_node._prev = this._tail
            this._tail = this._tail._next
        }
        this._length++
        return true
    }

    get len(){
        return this._length
    }

    insert(index:number,data:T):boolean{
        if(index == this._length){
            return this.append(data)
        }else{
            let insert_index = 1;
            let cur_node = this._head;
            while(insert_index < index){
                cur_node = cur_node._next
                insert_index++
            }
            let next_node = cur_node._next
            let new_node = new Node(data)
            cur_node._next = new_node
            cur_node._next._prev = cur_node
        }
        this._length++
        return true;
    }

    remove(index:number):Node<T>{
        if(index < 0 || index > this._length){
            return null
        }else{
            let del_node = undefined
            if(index == 0){
                del_node = this._head
                this._head = this._head._next
            }else{
                let del_index = 0;
                let pre_node = undefined
                let cur_node = this._head
                while(del_index < index){
                    del_index++
                    cur_node = cur_node._next;
                }
                del_node = cur_node
                cur_node._next._prev = cur_node._prev
                cur_node = null
            }
            if(index == this._length){
                this._tail._prev._next = null
                this._tail = this._tail._prev
            }
            this._length--
            return del_node
        }
    }

    get(index:number){
        if(index == 0){
            return this._head
        }
        let cur_node = this._head
        let cur_index = 1
        while(cur_index < index){
            cur_node = cur_node._next
            cur_index++
        }
        return cur_node
    }
}