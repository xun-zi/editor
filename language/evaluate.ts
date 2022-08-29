import { ASTkind, node,Statement,Expression, infixExpression, LetStatement, IdnetExpression, IntegerExpression } from "./ast";
import { Environment, Integer, NULL, Obj } from "./object";




export function evaluate(node:node,environment:Environment):Obj{

    switch(node.ASTkind){
        case ASTkind.Program:
            return evalProgram(node.value,environment);
        case ASTkind.Integer:
            return evalInteger(node);
        case ASTkind.prefixExpression:
            return evalPrefixExpression(node.operator,node.right,environment);
        case ASTkind.infixExpression:
            return evalInfixExpression(node,environment);
        case ASTkind.Let:
            return evalLet(node,environment);
        case ASTkind.Ident:
            return evalIdent(node.value,environment);
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

function evalInteger(expression:IntegerExpression):Integer{
    return new Integer(expression.value);
}

function evalPrefixExpression(operator:string,expression:Expression,environment:Environment):Obj{

    return NULL
}

function evalInfixExpression(expression:infixExpression,environment:Environment):Obj{
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