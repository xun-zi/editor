import { ASTkind, codeBlockExpression, Expression, forExpression, functionExpresssion, functionUseExpression, headPar, IdnetExpression, IfExpression, infixExpression, IntegerExpression, LetStatement, node, prefixExpression, Program, Statement } from "./ast";
import { Lexer } from "./lexer";
import { Token, TokenType } from "./token";


enum Precedence {
    Lowest,
    Assign,
    Bracket,
    sum,
    asteriskSlash,
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

        this.parseInfixExpression = this.parseInfixExpression.bind(this);
        this.parsePrefixFunction = {
            [TokenType.integer]: this.parseIntegerExpression,
            [TokenType.Lparen]: this.parseLparenExpression,
            [TokenType.Ident]: this.parseIdent,
            [TokenType.if]: this.parseIf,
            [TokenType.LBrace]: this.parseCodeBloackExpression,
            [TokenType.for]: this.parseForExpression,
            [TokenType.fn]:this.parseFunctionExpression
        }
        this.parseInfixFunction = {
            [TokenType.add]: this.parseInfixExpression,
            [TokenType.minus]: this.parseInfixExpression,
            [TokenType.asterisk]: this.parseInfixExpression,
            [TokenType.slash]: this.parseInfixExpression,
            [TokenType.Assign]: this.parseInfixExpression,
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


    parseExpression(precedence: Precedence): Expression {
        const prefix = this.parsePrefixFunction[this.curToken.TokenType];
        if (!prefix) {
            throw new Error(`在prefix中没有${this.curToken.TokenType}这个状态`);
        }

        let expression: Expression = prefix();

        while (!this.isPeekTokenType(TokenType.Semicolon)
            || precedence > this.peekTokenPrecedence()) {
            const infix = this.parseInfixFunction[this.peekToken.TokenType];
            if (!infix) return expression;
            this.readToken();
            expression = infix(expression);
        }

        if (this.isPeekTokenType(TokenType.Semicolon)) this.readToken();

        return expression;
    }

    //prefix
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

    parseIdent(): IdnetExpression|functionUseExpression {
        const Ident = this.newIdent();
        if(!this.isPeekTokenType(TokenType.Lparen))return Ident;
        this.readToken();
        const paramter = this.paramterExpression(TokenType.Rparen);
        return {
            ASTkind:ASTkind.functionUseExpression,
            Ident,
            paramter,
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
        const ifTrue = this.parseExpression(Precedence.Lowest);
        let ifFalse;
        if (this.isPeekTokenType(TokenType.else)) {
            this.readToken();
            this.readToken();
            ifFalse = this.parseExpression(Precedence.Lowest);
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
        const body = this.parseExpression(Precedence.Lowest);
        return {
            ASTkind: ASTkind.forExpression,
            head,
            body,
        }
    }

    parseFunctionExpression():functionExpresssion{
        this.expectToken(TokenType.Ident);
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
        console.log(tokenType);
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
        this.readToken();
        return {
            ASTkind: ASTkind.infixExpression,
            left: expression,
            operator,
            right: this.parseExpression(this.curTokenPrecedence())
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