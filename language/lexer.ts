import { lookupIdentify, Token, TokenType } from "./token";




export class Lexer {
    position = 0;
    nextPosition = 0;
    ch = '';
    input: string;
    constructor(input: string) {
        this.input = input;
        this.readChar();
    }
    lexer(): Token {
        this.skipSpace();
        let token;
        switch (this.ch) {
            case '+':
                token = this.newToken(TokenType.add, this.ch);
                break;
            case '-':
                token = this.newToken(TokenType.minus, this.ch);
                break;
            case '*':
                token = this.newToken(TokenType.asterisk, this.ch);
                break;
            case '/':
                token = this.newToken(TokenType.minus, this.ch);
                break;
            case '(':
                token = this.newToken(TokenType.Lparen, this.ch);
                break;
            case ')':
                token = this.newToken(TokenType.Rparen, this.ch);
                break;
            case '[':
                token = this.newToken(TokenType.LBracket,this.ch);
                break;
            case ']':
                token = this.newToken(TokenType.RBracket,this.ch);
                break;
            case '{':
                token = this.newToken(TokenType.LBrace,this.ch);
                break;
            case '}':
                token = this.newToken(TokenType.RBrace,this.ch);
                break;
            case '=':
                token = this.newToken(TokenType.Assign, this.ch);
                break;
            case '':
                token = this.newToken(TokenType.EOF, this.ch);
                break;
            case ';':
                token = this.newToken(TokenType.Semicolon, this.ch);
                break;
            case ',':
                token = this.newToken(TokenType.Comma,this.ch);
            default:
                if (this.isDigital(this.ch)) return this.newToken(TokenType.integer, this.readInteger());
                else if (this.isLetter(this.ch)) {
                    const tokenValue = this.readIdentify();
                    return this.newToken(lookupIdentify(tokenValue), tokenValue);
                }
                throw new Error(`未定义的字符${this.ch}`);
        }
        this.readChar();
        return token;
    }


    //结束时停在标识符的下一位
    readInteger(): string {
        const position = this.position;
        while (this.isDigital(this.ch)) this.readChar();
        return this.input.slice(position, this.position);
    }

    readIdentify(): string {
        const position = this.position;
        while (this.isLetter(this.ch)) this.readChar();
        return this.input.slice(position, this.position);
    }

    isDigital(ch: string): boolean {
        if (ch >= '0' && ch <= '9') return true;
        return false;
    }

    isLetter(ch: string): boolean {
        if (ch === '_' || (ch >= 'a' && ch <= 'z')) return true;
        return false;
    }


    newToken(TokenType: TokenType, value: string): Token {
        return {
            TokenType,
            value,
        }
    }

    readChar() {
        if (this.nextPosition >= this.input.length){
            this.ch = ''
            return;
        }
        this.position = this.nextPosition;
        this.nextPosition++;
        this.ch = this.input[this.position];
    }

    skipSpace() {
        while (this.ch === ' ' || this.ch === '\t' || this.ch === '\r' || this.ch === '\n') this.readChar();
    }

}