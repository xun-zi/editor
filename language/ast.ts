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
}

export type node = Expression | Statement | Program;

export type Statement = 
    |LetStatement
    |Expression

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
    ifTrue:Expression
    ifFalse?:Expression
}

export type headPar = Statement | null;

export type forExpression = {
    ASTkind:ASTkind.forExpression
    head:headPar[]
    body:Expression
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

