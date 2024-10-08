import { LexError } from "../errors/errors";
import { Token, TokenType } from "./token";

export class Scanner {
    private _source: string;
    private _tokens: Token[] = [];
    private _start: number = 0;
    private _current: number = 0;
    private _line: number = 1;

    constructor(source: string) {
        this._source = source;
    }

    private isAtEnd(): boolean {
        return this._current >= this._source.length;
    }

    private match(expected: string) {
        if (this.isAtEnd()) return false;
        if (this._source.charAt(this._current) != expected) return false;

        this._current++;
        return true;
    }

    private isAlpha(char: string): boolean {
        return char.toUpperCase() !== char.toLowerCase();
    }

    private isAlphaNumeric(char: string): boolean {
        return this.isAlpha(char) || this.isDigit(char);
    }

    private isDigit(char: string): boolean {
        return char >= "0" && char <= "9";
    }

    private peek(): string {
        if (this.isAtEnd()) return "\0";
        return this._source.charAt(this._current);
    }

    private previous(): string {
        return this._source.charAt(this._current - 1);
    }

    private peekNext(): string {
        const next = this._current + 1;
        if (next >= this._source.length) return "\0";
        return this._source.charAt(next);
    }

    private number() {
        while (this.isDigit(this.peek())) this.advance();

        // Look for a fractional part.
        if (this.peek() == "." && this.isDigit(this.peekNext())) {
            // Consume the "."
            this.advance();

            while (this.isDigit(this.peek())) this.advance();
        }

        this.addToken(TokenType.Number,
            Number.parseFloat(this._source.substring(this._start, this._current)));
    }

    private advance(): string {
        return this._source.charAt(this._current++);
    }

    private addToken(type: TokenType, value: Object | null = null): void {
        const text: string = this._source.substring(this._start, this._current);
        this._tokens.push({ type, lexeme: text, value, line: this._line });
    }

    private register(): void {
        if (this.isDigit(this.peek())) {
            while (this.isDigit(this.peek())) this.advance();
            const registerNumber = Number.parseFloat(this._source.substring(this._start + 1, this._current));
            this.addToken(TokenType.Register, registerNumber);
        } else if (this.match("v") || this.match("c")) {
            this.addToken(TokenType.Register, this.previous());
        } else {
            throw new LexError(`${this._line}: Invalid register`);
        }
    }

    private command(c: string): void {
        let command = c;
        while (this.isAlpha(this.peek())) {
            if(this.peek() === "#") break;
            command += this.advance();
        }
        this.addToken(TokenType.Command, command);
    }

    private scanToken() {
        const c = this.advance();
        console.log("Scanning", c);
        switch (c) {
            case "r":
                this.register();
            case " ":
            case "\r":
            case "\t":
                // Ignore whitespace.
                console.log("ignore wsp");
                break;
            case "\n":
                this.addToken(TokenType.CommandEnd, null);
                this._line++;
                break;
            case "#":
                // Skip comments
                while (this.peek() !== "\n") this.advance();
                console.log("Skipped comment, new char is", this.peek());
                break;
            default:
                if (this.isDigit(c)) {
                    this.number();
                } else if (this.isAlphaNumeric(c)) {
                    this.command(c);
                } else {
                    throw new LexError(`${this._line}: Unexpected char ${c}`);
                }
                break;
        }
    }

    public scanTokens(): Token[] {
        while (!this.isAtEnd()) {
            // We are at the beginning of the next lexeme.
            this._start = this._current;
            this.scanToken();
        }

        this._tokens.push({ type: TokenType.EOF, lexeme: "", value: null, line: this._line });

        return this._tokens;
    }
}