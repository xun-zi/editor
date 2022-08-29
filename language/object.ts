export interface Obj{
    inspect():string
}



export class Environment{
    outer:Environment|undefined
    store:Map<string,Obj>

    constructor(outer?:Environment){
        this.store = new Map<string,Obj>()
        this.outer = outer
    }

    has(key:string):boolean{
        if(this.store.has(key) || this.outer?.has(key))return true;
        return false;
    }

    get(key:string):Obj{
        if(!this.has(key))throw new Error(`不能在未声明${key} 前取值`);
        let res = this.store.get(key) || this.outer?.get(key) || NULL;
        return res;
    }

    assign(key:string,value:Obj){
        if(!this.has(key))throw new Error(`${key}没有声明`);
        if(!this.store.has(key))this.outer?.assign(key,value);
        return value;
    }

    statement(key:string,value:Obj):Obj{
        if(this.store.has(key))throw new Error(`${key}发生重定义`)
        this.store.set(key,value);
        return value;
    }
}


export class Integer implements Obj{
    value:number;
    constructor(value:number){
        this.value = value;
    }
    inspect(): string {
        return `${this.value}`
    }
}


export class Null implements Obj{
    value:null
    constructor(){
        this.value = null
    }
    inspect(): string {
        return `null`;
    }
}

export const NULL = new Null();