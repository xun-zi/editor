export enum ASTkind{
    //Statement
    Let='LET',
    
    //Expression
    prefixExpression='PREFIXEXPRESSION',
    infixExpression='INFIXEXPRESSION',
    Integer='INTEGER',
    Ident="IDENT",
    Program="PROGRAM",
    IfExpression="IFEXPRESSION",
    codeBlockExpression='CODEBLOCKEXPRESSION',
    forExpression='FOREXPRESSION',
    functionExpresssion='FUNCTIONEXPRESSION',
    functionUseExpression='FUNCTIONUSEEXPRESSION',
    returnStatement='RETURNSTATEMENT',
    classExpression='ClASSEXPRESSION',
    classUseExpression='CLASSUSEEXPRESSION',
    keyValuePair='KEYVALUEPAIR',
    ArrayExpression='ARRAYEXPRESSION',
    ArrayUseExpression='ARRAYUSEEXPRESSION',
}

export type node = Expression | Statement | Program;

export type Statement = 
    |LetStatement
    |Expression
    |returnStatement

export type Expression = 
    |prefixExpression
    |infixExpression
    |IntegerExpression
    |Ident
    |IfExpression
    |codeBlockExpression
    |forExpression
    |functionExpresssion
    |functionUseExpression
    |classExpression
    |classUseExpression
    |keyValuePair
    |ArrayExpression
    |ArrayUseExpression

export type Program = {
    ASTkind:ASTkind.Program
    value:Statement[];
}

export type LetStatement ={
    ASTkind:ASTkind.Let
    Ident:Ident
    value?:Expression
}

export type prefixExpression = {
    ASTkind:ASTkind.prefixExpression
    operator:string
    right:Expression
}

export type infixExpression = {
    ASTkind:ASTkind.infixExpression
    left:Expression
    operator:string
    right:Expression
}

export type IntegerExpression = {
    ASTkind:ASTkind.Integer
    value:number
}

export type IdnetExpression = {
    ASTkind:ASTkind.Ident,
    value:string,
}

export type Ident = {
    ASTkind:ASTkind.Ident
    value:string
}

export type IfExpression = {
    ASTkind:ASTkind.IfExpression,
    condition:Expression,
    ifTrue:Statement
    ifFalse?:Statement
}

export type headPar = Statement | null;

export type forExpression = {
    ASTkind:ASTkind.forExpression
    head:headPar[]
    body:Statement
}

export type codeBlockExpression = {
    ASTkind:ASTkind.codeBlockExpression
    value:Statement[]
}

export type functionExpresssion = {
    ASTkind:ASTkind.functionExpresssion,
    Ident:Ident,
    paramter:Expression[],
    body?:codeBlockExpression,
}

export type functionUseExpression = {
    ASTkind:ASTkind.functionUseExpression,
    Ident:Ident
    paramter:Expression[]
}

export type returnStatement = {
    ASTkind:ASTkind.returnStatement
    value:Expression
}

export type keyValuePair = {
    ASTkind:ASTkind.keyValuePair
    Ident:Ident
    value?:Expression;
}

export type classExpression = {
    ASTkind:ASTkind.classExpression
    Ident:Ident
    props:keyValuePair[]
    methods:functionExpresssion[]
}

export type classUseExpression = {
    ASTkind:ASTkind.classUseExpression
    Ident:Ident
    props:Expression[];
}

export type ArrayExpression = {
    ASTkind:ASTkind.ArrayExpression
    value:Expression[]
}

export type ArrayUseExpression = {
    ASTkind:ASTkind.ArrayUseExpression
    Ident:Ident
    value:Expression
}
