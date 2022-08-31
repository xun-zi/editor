import { Fn, NULL, Obj } from "./object";

type BuiltFnExpression = (props:Obj[]) => Obj; 

export class FnClass implements Obj{
    callFn:BuiltFnExpression
    constructor(Fn:BuiltFnExpression){
        this.callFn = Fn;
    }

    Call(props: Obj[]): Obj {
        return this.callFn(props);
    }

    inspect(): string {
        return `BuiltinFunction`
    }
}

const puts:BuiltFnExpression = (props:Obj[]) => {
    for(const obj of props){
        console.log(obj.inspect());
    }
    return NULL;
}

export const BuiltInFn:{[key:string]:FnClass} = {
    ['puts']:new FnClass(puts),
}