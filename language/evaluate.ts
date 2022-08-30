import { ASTkind, node,Statement,Expression, infixExpression, LetStatement, IdnetExpression, IntegerExpression, IfExpression, forExpression, functionExpresssion, functionUseExpression } from "./ast";
import { Environment, Fn, Integer, Null, NULL, Obj } from "./object";
const clone = require('clone');




export function evaluate(node:node,environment:Environment):Obj{

    switch(node.ASTkind){
        case ASTkind.Program:
            return evalProgram(node.value,environment);
        case ASTkind.Integer:
            return evalInteger(node);
        case ASTkind.prefixExpression:
            return evalPrefix(node.operator,node.right,environment);
        case ASTkind.infixExpression:
            return evalInfix(node,environment);
        case ASTkind.Let:
            return evalLet(node,environment);
        case ASTkind.Ident:
            return evalIdent(node.value,environment);
        case ASTkind.IfExpression:
            return evalIf(node,environment);
        case ASTkind.forExpression:
            return evalFor(node,new Environment(environment));
        case ASTkind.codeBlockExpression:
            return evalProgram(node.value,environment);
        case ASTkind.functionExpresssion:
            return evalFunction(node,environment);
        case ASTkind.functionUseExpression:
            return evalFunctionUse(node,environment);
    }
    throw new Error(`你这个表达式有点问题`)
}


function evalProgram(statements:Statement[],environment:Environment){
    const res = statements.map((statement) => {
        const state = evaluate(statement,environment);
        console.log(state.inspect());
    })
    return NULL;
}

function evalIf(expression:IfExpression,environment:Environment):Obj{
    const condition = evaluate(expression.condition,environment);

    if(isTrue(condition))evaluate(expression.ifTrue,environment);
    else if(expression.ifFalse)evaluate(expression.ifFalse,environment);
    
    return NULL
}

function evalFor(expression:forExpression,environment:Environment):Obj{
    const {head,body} = expression
    if(head[0])evaluate(head[0],environment);
    while(!head[1] || isTrue(evaluate(head[1],environment))){
        evaluate(body,environment);
        if(head[2])evaluate(head[2],environment);
    }
    return NULL;
}

function evalFunction(expression:functionExpresssion,enviroment:Environment):Obj{
    const {Ident,paramter,body} = expression;
    const value = new Fn(paramter,enviroment,body);
    enviroment.statement(Ident.value,value);
    return value;
}

function evalFunctionUse(expression:functionUseExpression,enviroment:Environment):Obj{
    const {Ident,paramter} = expression;
    const fn = enviroment.get(Ident.value);
    if(!(fn instanceof Fn))throw new Error(`${Ident.value}不是一个函数`);
    const props:Obj[] = [];
    paramter.forEach((exp) => {
        props.push(evaluate(exp,enviroment));
    })
    const fnEnviroment = new Environment(fn.enviroment);
    fn.paramters.forEach((par,index) => {
        if(index >= props.length)return;
        fnEnviroment.statement(par.value,clone(props[index]));
    })
    if(fn.body)evaluate(fn.body,fnEnviroment)
    return NULL
}

function isTrue(obj:Obj){
    return !(obj instanceof Integer && obj.value === 0)
}

function evalInteger(expression:IntegerExpression):Integer{
    return new Integer(expression.value);
}

function evalPrefix(operator:string,expression:Expression,environment:Environment):Obj{

    return NULL
}

function evalInfix(expression:infixExpression,environment:Environment):Obj{
    if(['+','-','*','/'].includes(expression.operator))return evalInfixCalculate(expression,environment);
    if(expression.operator === '=')return evalInfixAssign(expression,environment);

    return NULL
}

function evalInfixAssign(expression:infixExpression,environment:Environment):Obj{
    const {left,right} = expression;
    if(left.ASTkind !== ASTkind.Ident)throw new Error(`赋值的左边不是标识符`);
    const leftValue = left.value;
    const value = evaluate(right,environment);
    environment.assign(leftValue,value);
    return value;
}

function evalInfixCalculate(expression:infixExpression,environment:Environment):Obj{
    const {left,operator,right} = expression;
    const leftExpress = evaluate(left,environment);
    const rightExpress = evaluate(right,environment);
    if(!(leftExpress instanceof Integer) || !(rightExpress instanceof Integer))throw new Error(`${expression}运算中没有表达`);
    switch(operator){
        case '+':
            return new Integer(leftExpress.value + rightExpress.value);
        case '-':
            return new Integer(leftExpress.value - rightExpress.value);
        case '*':
            return new Integer(leftExpress.value * rightExpress.value);
        case '/':
            return new Integer(leftExpress.value / rightExpress.value);
    }
    return NULL
}



function evalIdent(key:string,environment:Environment):Obj{
    return environment.get(key);
}

function evalLet(LetStatement:LetStatement,environment:Environment):Obj{
    const Ident = LetStatement.Ident.value;
    let expression:Obj;
    if(LetStatement.value)expression = evaluate(LetStatement.value,environment);
    else expression = NULL;
    environment.statement(Ident,expression);
    return expression;
}