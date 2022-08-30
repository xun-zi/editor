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
    Semicolon = ";",
    

    //keyword
    Let="LET",
    if='IF',
    else="ELSE",
    for='FOR',
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
}

export function lookupIdentify(identify:string){
    return keywords[identify] || TokenType.Ident
}