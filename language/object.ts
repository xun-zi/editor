import { ASTkind, classUseExpression, codeBlockExpression, Expression, functionExpresssion, Ident, infixExpression, keyValuePair } from "./ast"
import { evaluate } from "./evaluate"

export interface Obj {
    inspect(): string
}



export class Environment {
    outer: Environment | undefined
    store: Map<string, Obj>

    constructor(outer?: Environment) {
        this.store = new Map<string, Obj>()
        this.outer = outer
    }

    has(key: string): boolean {
        if (this.store.has(key) || this.outer?.has(key)) return true;
        return false;
    }

    get(key: string): Obj {
        if (!this.has(key)) throw new Error(`不能在未声明${key} 前取值`);
        let res = this.store.get(key) || this.outer?.get(key) || NULL;
        return res;
    }

    assign(key: string, value: Obj) {
        if (!this.has(key)) throw new Error(`${key}没有声明`);
        if (this.store.has(key)) this.store.set(key, value);
        else this.outer?.assign(key, value);
        return value;
    }

    statement(key: string, value: Obj): Obj {
        if (this.store.has(key)) throw new Error(`${key}发生重定义`)
        this.store.set(key, value);
        return value;
    }
}


export class Integer implements Obj {
    value: number;
    constructor(value: number) {
        this.value = value;
    }
    inspect(): string {
        return `${this.value}`
    }
}


export class Fn implements Obj {
    enviroment: Environment
    body?: codeBlockExpression
    paramters: Ident[];
    constructor(paramters: Expression[] = [], environment: Environment, body?: codeBlockExpression) {
        this.enviroment = environment;
        this.body = body;
        paramters.forEach((paramter) => {
            if (paramter.ASTkind === ASTkind.Ident) return;
            throw Error(`函数参数写法有问题`)
        })
        this.paramters = paramters as Ident[];
        this.Call = this.Call.bind(this);
    }

    setbody(body: codeBlockExpression) {
        this.body = body
    }

    Call(props: Obj[],thisVal?:ClassInit):Obj{
        const fnEnviroment = new Environment(this.enviroment);
        fnEnviroment.statement('this',thisVal || NULL);
        this.paramters.forEach((par, index) => {
            if (index >= props.length) fnEnviroment.statement(par.value, NULL);
            else fnEnviroment.statement(par.value, props[index]);
        })
        let result: Obj = NULL;
        if (this.body) result = evaluate(this.body, fnEnviroment);
        return result;
    }

    inspect(): string {
        return `Function`
    }
}

export class ClassObj implements Obj {
    keyvaluePair:{[key:string]:Obj} = {};
    methods:{[key:string]:Obj} = {};
    environmnet:Environment;
    constructor(props:keyValuePair[],methods:functionExpresssion[],environment:Environment,){
        this.environmnet = environment;
        methods.forEach((method) => {
            this.methods[method.Ident.value] = evaluate(method,environment,{methods:true});
        })
        props.forEach((prop) => {
            this.keyvaluePair[prop.Ident.value] = prop.value ? evaluate(prop.value,environment) : NULL
        })
    }

    newClass(props:Obj[]):ClassInit{
        const classEnvironmnet = new Environment(this.environmnet);
        
        for(const key in this.methods)classEnvironmnet.statement(key,this.methods[key]);
        for(const key in this.keyvaluePair)classEnvironmnet.statement(key,this.keyvaluePair[key]);
        const newClassObj = new ClassInit(classEnvironmnet);
        const evalconstructor = this.methods['constructor'];
        if(evalconstructor instanceof Fn)evalconstructor.Call(props,newClassObj);
        return newClassObj;
    }

    inspect(): string {
        return `ClassObj`
    }
}

export class ClassInit implements Obj{
    environment:Environment;
    constructor(environment:Environment){
        this.environment = environment;
    }

    Dot(){
        return this.environment;
    }

    inspect(): string {
        return `ClassInit`
    }
}


export class ReturnVal implements Obj {
    value: Obj;
    constructor(obj: Obj) {
        this.value = obj
    }

    inspect(): string {
        return this.value.inspect();
    }
}

export class Null implements Obj {
    value: null
    constructor() {
        this.value = null
    }
    inspect(): string {
        return `null`;
    }
}

export const NULL = new Null();