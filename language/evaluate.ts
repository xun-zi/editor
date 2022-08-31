import { ASTkind, node, Statement, Expression, infixExpression, LetStatement, IdnetExpression, IntegerExpression, IfExpression, forExpression, functionExpresssion, functionUseExpression } from "./ast";
import { BuiltInFn, FnClass } from "./BuiltIn";
import { Environment, Fn, Integer, Null, NULL, Obj, ReturnVal } from "./object";
const clone = require('clone');




export function evaluate(node: node, environment: Environment): Obj {

    switch (node.ASTkind) {
        case ASTkind.Program:
            return evalProgram(node.value, environment);
        case ASTkind.Integer:
            return evalInteger(node);
        case ASTkind.prefixExpression:
            return evalPrefix(node.operator, node.right, environment);
        case ASTkind.infixExpression:
            return evalInfix(node, environment);
        case ASTkind.Let:
            return evalLet(node, environment);
        case ASTkind.Ident:
            return evalIdent(node.value, environment);
        case ASTkind.IfExpression:
            return evalIf(node, environment);
        case ASTkind.forExpression:
            return evalFor(node, new Environment(environment));
        case ASTkind.codeBlockExpression:
            return evalProgram(node.value, environment);
        case ASTkind.functionExpresssion:
            return evalFunction(node, environment);
        case ASTkind.functionUseExpression:
            return evalFunctionUse(node, environment);
        case ASTkind.returnStatement:
            return new ReturnVal(evaluate(node.value, environment));
    }
    throw new Error(`你这个表达式有点问题${node}`)
}


function evalProgram(statements: Statement[], environment: Environment): ReturnVal|Null {
    let returnVal: Null|ReturnVal = NULL;
    for (const statement of statements) {
        const state = evaluate(statement, environment);
        if (state instanceof ReturnVal) {
            returnVal = state;
            break;
        }
    }

    return returnVal;
}

function evalIf(expression: IfExpression, environment: Environment): Obj {
    const condition = evaluate(expression.condition, environment);
    let result:Obj = NULL
    if (isTrue(condition))result = evaluate(expression.ifTrue, environment);
    else if (expression.ifFalse)result = evaluate(expression.ifFalse, environment);

    return result
}

function evalFor(expression: forExpression, environment: Environment): Obj {
    const { head, body } = expression
    let result:Obj = NULL;
    if (head[0]) evaluate(head[0], environment);
    while (!head[1] || isTrue(evaluate(head[1], environment))) {
        result = evaluate(body, environment);
        if(result instanceof ReturnVal)break;
        if (head[2])result = evaluate(head[2], environment);
    }
    return result;
}

function evalFunction(expression: functionExpresssion, enviroment: Environment): Obj {
    const { Ident, paramter, body } = expression;
    const value = new Fn(paramter, enviroment, body);
    enviroment.statement(Ident.value, value);
    return value;
}

function evalFunctionUse(expression: functionUseExpression, enviroment: Environment): Obj {
    const { Ident, paramter } = expression;
    const fn = evaluate(Ident,enviroment);
    if (!(fn instanceof FnClass || fn instanceof Fn)) throw new Error(`${Ident.value}不是一个函数`);

    const props: Obj[] = [];
    paramter.forEach((exp) => {
        props.push(evaluate(exp, enviroment));
    })

    // const fnEnviroment = new Environment(fn.enviroment);
    // fn.paramters.forEach((par, index) => {
    //     if (index >= props.length) fnEnviroment.statement(par.value, NULL);
    //     else fnEnviroment.statement(par.value, clone(props[index]));
    // })

    // let result:Obj = NULL;
    // if (fn.body)result = evaluate(fn.body, fnEnviroment)
    // return result
    return fn.Call(props);
}

function isTrue(obj: Obj) {
    return !(obj instanceof Integer && obj.value === 0)
}

function evalInteger(expression: IntegerExpression): Integer {
    return new Integer(expression.value);
}

function evalPrefix(operator: string, expression: Expression, environment: Environment): Obj {

    return NULL
}

function evalInfix(expression: infixExpression, environment: Environment): Obj {
    if (['+', '-', '*', '/'].includes(expression.operator)) return evalInfixCalculate(expression, environment);
    if (expression.operator === '=') return evalInfixAssign(expression, environment);

    return NULL
}

function evalInfixAssign(expression: infixExpression, environment: Environment): Obj {
    const { left, right } = expression;
    if (left.ASTkind !== ASTkind.Ident) throw new Error(`赋值的左边不是标识符`);
    const leftValue = left.value;
    const value = evaluate(right, environment);
    environment.assign(leftValue, value);
    return value;
}

function evalInfixCalculate(expression: infixExpression, environment: Environment): Obj {
    const { left, operator, right } = expression;
    const leftExpress = evaluate(left, environment);
    const rightExpress = evaluate(right, environment);
    if (!(leftExpress instanceof Integer) || !(rightExpress instanceof Integer)) throw new Error(`${expression}运算中没有表达`);
    switch (operator) {
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



function evalIdent(key: string, environment: Environment): Obj {
    let res:Obj = BuiltInFn[key] || NULL;
    if(res instanceof Null)res = environment.get(key);
    
    return res;
}

function evalLet(LetStatement: LetStatement, environment: Environment): Obj {
    const Ident = LetStatement.Ident.value;
    let expression: Obj;
    if (LetStatement.value) expression = evaluate(LetStatement.value, environment);
    else expression = NULL;
    environment.statement(Ident, expression);
    return expression;
}