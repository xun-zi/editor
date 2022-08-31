import { Fn, NULL, Obj } from "./object";

type BuiltFnExpression = (props:Obj[]) => Obj; 
let putText = ``;
export const initPutText = () => {
    putText = ``;
}

export const getPutText = () => {
    return putText
}

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
        putText += `${obj.inspect()}\n`
    }
    return NULL;
}

export const BuiltInFn:{[key:string]:FnClass} = {
    ['puts']:new FnClass(puts),
}