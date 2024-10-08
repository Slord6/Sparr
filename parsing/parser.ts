import { ParseError } from "../errors/errors";
import { Token, tokenToString, TokenType } from "../lexing/token";
import { Binary, Condition, ConditionalCopy, Copy, Literal, Operation, OpString, Unary, Zero } from "../operation";
import { Register } from "../register";

export class Parser {
    private _tokens: Token[];
    private _index: number = 0;

    constructor(tokens: Token[]) {
        this._tokens = tokens;
    }

    private advance(): Token {
        return this._tokens[this._index++];
    }

    private peek(): Token {
        return this._tokens[this._index];
    }

    private atEnd(): boolean {
        return this._index >= this._tokens.length || this.peek().type === TokenType.EOF;
    }

    private requireSetLength(arr: any[], len: number, message: string) {
        if (arr.length !== len) {
            throw new ParseError(message);
        }
    }

    private tokenToValue(token: Token): Register | Literal {
        if (token.type !== TokenType.Number && token.type !== TokenType.Register) {
            throw new ParseError(`Invalid value (line ${token.line}): "${token.lexeme}" (${tokenToString(token)}), expected register or number`);
        }
        if (token.type === TokenType.Number) {
            return { type: "Literal", value: token.value as any as number };
        } else {
            if (typeof token.value === "number") {
                if (token.value < 0 || token.value > 9) {
                    throw new ParseError(`Invalid general register value (line ${token.line}): ${token.value}`);
                }
            }
            return token.value as any as Register;
        }
    }

    private set(token: Token, args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 1, `Invalid number of arguments (${args.length}) for set command`);
        return { rootCommandToken: token, type: "UnaryArg", action: "Set", v1: args[0] } as Unary
    }

    private push(token: Token, args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 0, `Invalid number of arguments (${args.length}) for push command`);
        return { rootCommandToken: token, type: "NoArg", action: "Push" } as Zero;
    }

    private pop(token: Token, args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 0, `Invalid number of arguments (${args.length}) for pop command`);
        return { rootCommandToken: token, type: "NoArg", action: "Pop" } as Zero;
    }

    private copy(token: Token, args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 2, `Invalid number of arguments (${args.length}) for copy command`);
        return { rootCommandToken: token, type: "BinaryArg", action: "Copy", v1: args[0], v2: args[1] } as Copy;
    }

    private validateCondition(condition: Condition | string, message: string): void {
        if (condition !== "GT" && condition !== "EQ" && condition !== "LT") {
            throw new ParseError(message);
        }
    }

    private conditionalCopy(token: Token, args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 4, `Invalid number of arguments (${args.length}) for conditionalCopy command`);
        const condition = token.lexeme.split("cp")[1].toUpperCase();
        this.validateCondition(condition, `Invalid conditional copy condition type (${token.lexeme}) on line ${token.line}`);
        return { rootCommandToken: token, type: "QuadArg", action: "ConditionalCopy", condition, v1: args[0], v2: args[1], v3: args[2], v4: args[3] } as ConditionalCopy;
    }

    private add(token: Token, args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 2, `Invalid number of arguments (${args.length}) for add command`);
        return { rootCommandToken: token, type: "BinaryArg", action: "Add", v1: args[0], v2: args[1] } as Binary;
    }

    private subtract(token: Token, args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 2, `Invalid number of arguments (${args.length}) for subtract command`);
        return { rootCommandToken: token, type: "BinaryArg", action: "Sub", v1: args[0], v2: args[1] } as Binary;
    }

    private multiply(token: Token, args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 2, `Invalid number of arguments (${args.length}) for multiply command`);
        return { rootCommandToken: token, type: "BinaryArg", action: "Mul", v1: args[0], v2: args[1] } as Binary;
    }

    private divide(token: Token, args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 2, `Invalid number of arguments (${args.length}) for divide command`);
        return { rootCommandToken: token, type: "BinaryArg", action: "Div", v1: args[0], v2: args[1] } as Binary;
    }

    private write(token: Token, args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 1, `Invalid number of arguments (${args.length}) for write command`);
        return { rootCommandToken: token, type: "UnaryArg", action: "Write", v1: args[0] } as Unary;
    }

    private writeStack(token: Token, args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 0, `Invalid number of arguments (${args.length}) for write stack command`);
        return { rootCommandToken: token, type: "NoArg", action: "WriteStack"} as Zero;
    }

    private writeStackChars(token: Token, args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 0, `Invalid number of arguments (${args.length}) for write stack chars command`);
        return { rootCommandToken: token, type: "NoArg", action: "WriteStackChars"} as Zero;
    }

    private writeChar(token: Token, args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 1, `Invalid number of arguments (${args.length}) for write char command`);
        return { rootCommandToken: token, type: "UnaryArg", action: "WriteChar", v1: args[0] } as Unary;
    }

    private assertCoverallOpStrings(x: never): never {
        throw new ParseError(`Unexpected op string "${x}"`);
    }

    private command(parts: Token[]): Operation {
        const action = parts.shift();
        const args = parts.map(this.tokenToValue);
        const opString = action?.lexeme.toLowerCase() as OpString;
        switch (opString) {
            case "set":
                return this.set(action as Token, args);
            case "push":
                return this.push(action as Token, args);
            case "pop":
                return this.pop(action as Token, args);
            case "cp":
                return this.copy(action as Token, args);
            case "cpgt":
            case "cplt":
            case "cpeq":
                return this.conditionalCopy(action as Token, args);
            case "add":
                return this.add(action as Token, args);
            case "sub":
                return this.subtract(action as Token, args);
            case "mul":
                return this.multiply(action as Token, args);
            case "div":
                return this.divide(action as Token, args);
            case "wrt":
                return this.write(action as Token, args);
            case "wrts":
                return this.writeStack(action as Token, args);
            case "wrtc":
                return this.writeChar(action as Token, args);
            case "wrtsc":
                return this.writeStackChars(action as Token, args);
            default:
                this.assertCoverallOpStrings(opString);
        }
    }

    public parse(): Operation[] {
        const operations: Operation[] = [];

        while (!this.atEnd()) {
            const commandParts: Token[] = [];
            do {
                commandParts.push(this.advance());
            } while (!this.atEnd() && this.peek().type !== TokenType.CommandEnd);
            
            while(this.peek().type === TokenType.CommandEnd) this.advance(); // Handle multiple consecutive empty lines

            // Handle empty lines/comments
            while(commandParts.length > 0 && commandParts[0].type === TokenType.CommandEnd) {
                commandParts.shift();
            }
            if(commandParts.length === 0) continue;

            try {
                operations.push(this.command(commandParts));
            } catch (err) {
                console.error(`Parse error whilst trying to parse ${commandParts.map(tokenToString)}`);
                throw err;
            }
        }

        return operations;
    }

}