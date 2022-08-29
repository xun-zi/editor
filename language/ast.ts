export enum ASTkind{
    //Statement
    Let='LET',
    
    //Expression
    prefixExpression='PREFIXEXPRESSION',
    infixExpression='INFIXEXPRESSION',
    Integer='INTEGER',
    Ident="IDENT",
    Program="PROGRAM",
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