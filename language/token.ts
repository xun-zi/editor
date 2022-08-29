export enum TokenType{
    add="+",
    minus="-",
    asterisk="*",
    slash='/',
    Let="LET",
    Lparen="LPAREN",
    Rparen="Rparen",
    integer="INTEGER",
    Ident="IDENT",
    Assign="=",
    EOF='EOF',
    Semicolon = ";",
}

export type Token = {
    TokenType:TokenType,
    value:string,
}
 
const keywords:{[keywords:string]:TokenType} = {
    ['let']:TokenType.Let
}

export function lookupIdentify(identify:string){
    return keywords[identify] || TokenType.Ident
}