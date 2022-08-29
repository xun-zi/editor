import { ASTkind, Expression, IdnetExpression, infixExpression, IntegerExpression, LetStatement, node, prefixExpression, Program, Statement } from "./ast";
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
        this.parseInfixExpression = this.parseInfixExpression.bind(this);
        this.parsePrefixFunction = {
            [TokenType.integer]:this.parseIntegerExpression,
            [TokenType.Lparen]:this.parseLparenExpression,
            [TokenType.Ident]:this.parseIdent,
        }
        this.parseInfixFunction = {
            [TokenType.add]:this.parseInfixExpression,
            [TokenType.minus]:this.parseInfixExpression,
            [TokenType.asterisk]:this.parseInfixExpression,
            [TokenType.slash]:this.parseInfixExpression,
            [TokenType.Assign]:this.parseInfixExpression,
        }
    }


    Program(): Program {
        const statements: Statement[] = [];
        while (this.curToken.TokenType !== TokenType.EOF) {
            let statement: Statement;
            switch (this.curToken.TokenType) {
                case TokenType.Let:
                    statement = this.parseLetStatement();
                    break;
                default:
                    statement = this.parseExpression(Precedence.Lowest);
            }
            statements.push(statement);
            this.readToken();
        }
        return {
            ASTkind: ASTkind.Program,
            value: statements,
        }
    }

    parseLetStatement(): LetStatement {
        this.expectToken(TokenType.Ident);
        const Ident = this.parseIdent();
        if(this.isPeekTokenType(TokenType.Assign)){
            this.readToken();
            this.readToken();
            return {
                ASTkind: ASTkind.Let,
                Ident,
                value: this.parseExpression(Precedence.Lowest),
            }
        }
        
        return {
            ASTkind:ASTkind.Let,
            Ident,
        }
    }


    parseExpression(precedence: Precedence): Expression {
        const prefix = this.parsePrefixFunction[this.curToken.TokenType];
        if (!prefix) {
            throw new Error(`在prefix中没有${this.curToken.TokenType}这个状态`);
        }

        let expression:Expression = prefix();

        while (!this.isPeekTokenType(TokenType.Semicolon)
                || precedence > this.peekTokenPrecedence()) {
            const infix = this.parseInfixFunction[this.peekToken.TokenType];
            if (!infix) return expression;
            this.readToken();
            expression = infix(expression);
        }

        if(this.isPeekTokenType(TokenType.Semicolon))this.readToken();

        return expression;
    }

    //prefix
    parseIntegerExpression():IntegerExpression{
        return {
            ASTkind:ASTkind.Integer,
            value:+this.curToken.value
        }
    }

    parseLparenExpression():Expression{
        this.readToken();
        const expression = this.parseExpression(Precedence.Bracket);
        this.expectToken(TokenType.Rparen);
        return expression;
    }

    parseIdent():IdnetExpression{
        return {
            ASTkind:ASTkind.Ident,
            value:this.curToken.value
        }
    }


    //infix
    parseInfixExpression(expression:Expression):infixExpression{
        const operator = this.curToken.value;
        this.readToken();
        return {
            ASTkind:ASTkind.infixExpression,
            left:expression,
            operator,
            right:this.parseExpression(this.curTokenPrecedence())
        }
    }

    curTokenPrecedence():Precedence{
        return PrecedenceExpression[this.curToken.TokenType]||Precedence.Lowest
    }

    peekTokenPrecedence(): Precedence {
        return PrecedenceExpression[this.peekToken.TokenType] || Precedence.Lowest;
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