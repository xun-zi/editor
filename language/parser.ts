import { ArrayExpression, ArrayUseExpression, ASTkind, classExpression, classUseExpression, codeBlockExpression, Expression, forExpression, functionExpresssion, functionUseExpression, headPar, IdnetExpression, IfExpression, infixExpression, IntegerExpression, keyValuePair, LetStatement, node, prefixExpression, Program, returnStatement, Statement } from "./ast";
import { Lexer } from "./lexer";
import { Token, TokenType } from "./token";


enum Precedence {
    Lowest,
    Assign,
    Bracket,
    Equal,
    inequation,
    sum,
    asteriskSlash,
    Dot,
}

type PrefixFunction = () => Expression;
type InfixFunction = (expression: Expression) => Expression;

const PrecedenceExpression: Partial<Record<TokenType, Precedence>> = {
    [TokenType.add]: Precedence.sum,
    [TokenType.minus]: Precedence.sum,
    [TokenType.asterisk]: Precedence.asteriskSlash,
    [TokenType.slash]: Precedence.asteriskSlash,
    [TokenType.Lparen]: Precedence.Bracket,
    [TokenType.Rparen]: Precedence.Bracket,
    [TokenType.LBrace]: Precedence.Bracket,
    [TokenType.RBrace]: Precedence.Bracket,
    [TokenType.LBracket]: Precedence.Bracket,
    [TokenType.RBracket]: Precedence.Bracket,
    [TokenType.Assign]: Precedence.Assign,
    [TokenType.Equal]:Precedence.Equal,
    [TokenType.lessThan]:Precedence.inequation,
    [TokenType.lessEqual]:Precedence.inequation,
    [TokenType.greaterThan]:Precedence.inequation,
    [TokenType.greaterEqual]:Precedence.inequation,
    [TokenType.Dot]:Precedence.Dot,
}


export class parser {
    lexer: Lexer;
    curToken: Token;
    peekToken: Token;
    parsePrefixFunction: Partial<Record<TokenType, PrefixFunction>>
    parseInfixFunction: Partial<Record<TokenType, InfixFunction>>
    constructor(lexer: Lexer) {
        this.lexer = lexer;
        this.curToken = this.lexer.lexer();
        this.peekToken = this.lexer.lexer();
        this.parseIntegerExpression = this.parseIntegerExpression.bind(this);
        this.parseLparenExpression = this.parseLparenExpression.bind(this);
        this.parseIdent = this.parseIdent.bind(this);
        this.parseIf = this.parseIf.bind(this);
        this.parseCodeBloackExpression = this.parseCodeBloackExpression.bind(this);
        this.parseForExpression = this.parseForExpression.bind(this);
        this.parseFunctionExpression = this.parseFunctionExpression.bind(this);
        this.parseClassExpression = this.parseClassExpression.bind(this);
        this.parseClassUseExpression = this.parseClassUseExpression.bind(this);
        this.parseArrayExpression = this.parseArrayExpression.bind(this);

        this.parseInfixExpression = this.parseInfixExpression.bind(this);
        this.parsePrefixFunction = {
            [TokenType.integer]: this.parseIntegerExpression,
            [TokenType.Lparen]: this.parseLparenExpression,
            [TokenType.Ident]: this.parseIdent,
            [TokenType.if]: this.parseIf,
            [TokenType.LBrace]: this.parseCodeBloackExpression,
            [TokenType.for]: this.parseForExpression,
            [TokenType.fn]:this.parseFunctionExpression,
            [TokenType.class]:this.parseClassExpression,
            [TokenType.new]:this.parseClassUseExpression,
            [TokenType.LBracket]:this.parseArrayExpression,
        }
        this.parseInfixFunction = {
            [TokenType.add]: this.parseInfixExpression,
            [TokenType.minus]: this.parseInfixExpression,
            [TokenType.asterisk]: this.parseInfixExpression,
            [TokenType.slash]: this.parseInfixExpression,
            [TokenType.Assign]: this.parseInfixExpression,
            [TokenType.lessThan]:this.parseInfixExpression,
            [TokenType.lessEqual]:this.parseInfixExpression,
            [TokenType.greaterThan]:this.parseInfixExpression,
            [TokenType.greaterEqual]:this.parseInfixExpression,
            [TokenType.Equal]:this.parseInfixExpression,
            [TokenType.Dot]:this.parseInfixExpression,
        }
    }


    Program(): Program {
        const statements: Statement[] = [];
        while (this.curToken.TokenType !== TokenType.EOF) {
            let statement = this.parseStatement();
            statements.push(statement);
            this.readToken();
        }
        return {
            ASTkind: ASTkind.Program,
            value: statements,
        }
    }

    parseStatement(): Statement {
        let statement;
        switch (this.curToken.TokenType) {
            case TokenType.Let:
                statement = this.parseLetStatement();
                break;
            case TokenType.return:
                statement = this.parseReturnStatement();
                break;
            default:
                statement = this.parseExpression(Precedence.Lowest);
        }
        return statement;
    }

    parseLetStatement(): LetStatement {
        this.expectToken(TokenType.Ident);
        const Ident = this.parseIdent();
        if(Ident.ASTkind !== ASTkind.Ident)throw new Error(`这个声明中被赋值不是Idnet`);
        if (this.isPeekTokenType(TokenType.Assign)) {
            this.readToken();
            this.readToken();
            return {
                ASTkind: ASTkind.Let,
                Ident,
                value: this.parseExpression(Precedence.Lowest),
            }
        }

        return {
            ASTkind: ASTkind.Let,
            Ident,
        }
    }

    parseReturnStatement():returnStatement{
        this.readToken();
        const value = this.parseExpression(Precedence.Lowest);
        return {
            ASTkind:ASTkind.returnStatement,
            value,
        }
    }


    parseExpression(precedence: Precedence): Expression {
        const prefix = this.parsePrefixFunction[this.curToken.TokenType];
        if (!prefix) {
            throw new Error(`在prefix中没有${this.curToken.TokenType}这个状态`);
        }

        let expression: Expression = prefix();

        while (!this.isPeekTokenType(TokenType.Semicolon)
            && precedence < this.peekTokenPrecedence()) {
            const infix = this.parseInfixFunction[this.peekToken.TokenType];
            if (!infix) return expression;
            this.readToken();
            expression = infix(expression);
        }

        if (this.isPeekTokenType(TokenType.Semicolon)) this.readToken();

        return expression;
    }

    //prefix
    parseClassExpression():classExpression{
        this.expectToken(TokenType.Ident);
        const Ident = this.newIdent();
        const props = [];
        const methods = [];

        this.expectToken(TokenType.LBrace);

        while(!this.isPeekTokenType(TokenType.RBrace)){
            this.expectToken(TokenType.Ident);
            if(this.isPeekTokenType(TokenType.Lparen))methods.push(this.parseMethodExpression());
            else props.push(this.parseKeyValuePair(TokenType.Assign));
        }

        this.readToken();

        return {
            ASTkind: ASTkind.classExpression,
            Ident,
            props,
            methods,
        }
    }

    parseArrayExpression():ArrayExpression{
       return {
        ASTkind:ASTkind.ArrayExpression,
        value:this.paramterExpression(TokenType.RBracket)
       }
    }

    parseClassUseExpression():classUseExpression{
        this.expectToken(TokenType.Ident);
        const Ident = this.newIdent();
        this.expectToken(TokenType.Lparen);
        const props = this.paramterExpression(TokenType.Rparen);
        return {
            ASTkind:ASTkind.classUseExpression,
            Ident,
            props,
        }
    }
    
    parseKeyValuePair(tokenType:TokenType):keyValuePair{
        const Ident = this.newIdent();
        this.expectToken(tokenType);
        this.readToken();
        const value = this.parseExpression(Precedence.Lowest);
        return {
            ASTkind:ASTkind.keyValuePair,
            Ident,
            value,
        }
    }

    parseIntegerExpression(): IntegerExpression {
        return {
            ASTkind: ASTkind.Integer,
            value: +this.curToken.value
        }
    }

    parseLparenExpression(): Expression {
        this.readToken();
        const expression = this.parseExpression(Precedence.Bracket);
        this.expectToken(TokenType.Rparen);
        return expression;
    }

    parseIdent(): IdnetExpression|functionUseExpression|ArrayUseExpression {
        switch(this.peekToken.TokenType){
            case TokenType.Lparen:
                return this.parseFunctionUseExpression();
            case TokenType.LBracket:
                return this.parseArrayUseExpression();
        }
        const Ident = this.newIdent();
        return Ident;
    }

    parseFunctionUseExpression():functionUseExpression{
        const Ident = this.newIdent();
        this.readToken();
        const paramter = this.paramterExpression(TokenType.Rparen);
        return {
            ASTkind:ASTkind.functionUseExpression,
            Ident,
            paramter,
        }
    }

    parseArrayUseExpression():ArrayUseExpression{
        const Ident = this.newIdent();
        this.readToken();
        this.readToken();
        const value = this.parseExpression(Precedence.Bracket);
        this.expectToken(TokenType.RBracket);
        if(this.isPeekTokenType(TokenType.Semicolon))this.readToken();
        return {
            ASTkind:ASTkind.ArrayUseExpression,
            Ident:Ident,
            value
        }
    }

    newIdent():IdnetExpression{
        return {
            ASTkind: ASTkind.Ident,
            value: this.curToken.value
        }
    }

    parseIf(): IfExpression {
        this.expectToken(TokenType.Lparen);
        this.readToken();
        const condition = this.parseExpression(Precedence.Bracket)
        this.expectToken(TokenType.Rparen);
        this.readToken();
        const ifTrue = this.parseStatement();
        let ifFalse;
        if (this.isPeekTokenType(TokenType.else)) {
            this.readToken();
            this.readToken();
            ifFalse = this.parseStatement();
        }

        return {
            ASTkind: ASTkind.IfExpression,
            condition,
            ifTrue,
            ifFalse,
        }
    }

    parseForExpression(): forExpression {
        this.expectToken(TokenType.Lparen);
        const head: headPar[] = [];
        
         [TokenType.Semicolon, TokenType.Semicolon].forEach((tokenType) => {
            this.readToken();
            if (this.isCurTokenType(tokenType)) head.push(null);
            else head.push(this.parseStatement());
        })
        // //第一个参数
        // if(this.isPeekTokenType(TokenType.Semicolon))head.push(null);
        // else head.push(this.parseExpression(Precedence.Lowest));
        // this.expectToken(TokenType.Semicolon);
        // //第二个
        // if(this.isPeekTokenType(TokenType.Semicolon))head.push(null);
        // else head.push(this.parseExpression(Precedence.Lowest));
        // this.expectToken(TokenType.Semicolon);
        // //第三个
        if (this.isPeekTokenType(TokenType.Rparen)) head.push(null);
        else {
            this.readToken();
            head.push(this.parseExpression(Precedence.Lowest));
        }
        
        this.expectToken(TokenType.Rparen);
        this.expectToken(TokenType.LBrace);
        const body = this.parseStatement();
        return {
            ASTkind: ASTkind.forExpression,
            head,
            body,
        }
    }

    parseFunctionExpression():functionExpresssion{
        this.expectToken(TokenType.Ident);
        return this.parseMethodExpression();
    }

    parseMethodExpression():functionExpresssion{
        const Ident = this.newIdent();
        this.expectToken(TokenType.Lparen);
        const paramter = this.paramterExpression(TokenType.Rparen);
        if(!this.isPeekTokenType(TokenType.LBrace)) return {
            ASTkind:ASTkind.functionExpresssion,
            Ident,
            paramter,
        }

        this.readToken();
        const body = this.parseExpression(Precedence.Lowest);
        if(body.ASTkind !== ASTkind.codeBlockExpression){
            throw new Error(`声明后面并不是代码块`)
        }
        return {
            ASTkind:ASTkind.functionExpresssion,
            Ident,
            paramter,
            body,
        }
    }


    parseCodeBloackExpression(): codeBlockExpression {

        const statements = [];
        while (!this.isPeekTokenType(TokenType.RBrace)) {
            this.readToken();
            const statement = this.parseStatement();
            statements.push(statement);
        }
        this.readToken();
        return {
            ASTkind: ASTkind.codeBlockExpression,
            value: statements,
        }
    }

    paramterExpression(tokenType:TokenType):Expression[]{
        const paramters = [];
        while(!this.isPeekTokenType(tokenType)){
            this.readToken();
            const paramter = this.parseExpression(Precedence.Lowest);
            if(!this.isPeekTokenType(tokenType))this.expectToken(TokenType.Comma);
            paramters.push(paramter);
        }

        this.readToken();

        return paramters;
    }

    //infix
    parseInfixExpression(expression: Expression): infixExpression {
        const operator = this.curToken.value;
        const operatorPrecedence = this.curTokenPrecedence();
        this.readToken();
        return {
            ASTkind: ASTkind.infixExpression,
            left: expression,
            operator,
            right: this.parseExpression(operatorPrecedence)
        }
    }




    curTokenPrecedence(): Precedence {
        return PrecedenceExpression[this.curToken.TokenType] || Precedence.Lowest
    }

    peekTokenPrecedence(): Precedence {
        return PrecedenceExpression[this.peekToken.TokenType] || Precedence.Lowest;
    }

    isCurTokenType(TokenType: TokenType): boolean {
        return this.curToken.TokenType === TokenType
    }

    isPeekTokenType(TokenType: TokenType): boolean {
        return this.peekToken.TokenType === TokenType
    }



    expectToken(TokenType: TokenType) {
        if (TokenType === this.peekToken.TokenType) this.readToken();
        else throw new Error(`不是预期的${TokenType} 而是${this.peekToken.TokenType}`);
    }

    readToken() {
        this.curToken = this.peekToken
        this.peekToken = this.lexer.lexer();
    }



}