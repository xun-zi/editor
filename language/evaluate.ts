import { ASTkind, node,Statement,Expression, infixExpression, LetStatement, IdnetExpression, IntegerExpression, IfExpression, forExpression } from "./ast";
import { Environment, Integer, Null, NULL, Obj } from "./object";




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
        case ASTkind.IfExpression:
            return evalIfExpression(node,environment);
        case ASTkind.forExpression:
            return evalForExpression(node,new Environment(environment));
        case ASTkind.codeBlockExpression:
            return evalProgram(node.value,environment);
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

function evalIfExpression(expression:IfExpression,environment:Environment):Obj{
    const condition = evaluate(expression.condition,environment);

    if(isTrue(condition))evaluate(expression.ifTrue,environment);
    else if(expression.ifFalse)evaluate(expression.ifFalse,environment);
    
    return NULL
}

function evalForExpression(expression:forExpression,environment:Environment):Obj{
    const {head,body} = expression
    if(head[0])evaluate(head[0],environment);
    while(!head[1] || isTrue(evaluate(head[1],environment))){
        evaluate(body,environment);
        if(head[2])evaluate(head[2],environment);
    }
    return NULL;
}

function isTrue(obj:Obj){
    return !(obj instanceof Integer && obj.value === 0)
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