export enum TokenType{
    add="+",
    minus="-",
    asterisk="*",
    slash='/',
    
    Lparen="(",
    Rparen=")",
    LBrace='{',
    RBrace='}',
    LBracket='[',
    RBracket=']',
    integer="INTEGER",
    Ident="IDENT",
    Assign="=",
    EOF='EOF',
    Comma=',',
    Semicolon = ";",
    lessThan='<',
    lessEqual='<=',
    greaterThan='>',
    greaterEqual='>=',
    Equal='==',
    

    //keyword
    Let="LET",
    if='IF',
    else="ELSE",
    for='FOR',
    fn='FUNCTION',
    return='RETURN',
}

export type Token = {
    TokenType:TokenType,
    value:string,
}
 
const keywords:{[keywords:string]:TokenType} = {
    ['let']:TokenType.Let,
    ['if']:TokenType.if,
    ['else']:TokenType.else,
    ['for']:TokenType.for,
    ['fn']:TokenType.fn,
    ['return']:TokenType.return,
}

export function lookupIdentify(identify:string){
    return keywords[identify] || TokenType.Ident
}