import { ParseError } from "../errors/errors";
import { Token, tokenToString, TokenType } from "../lexing/token";
import { Binary, Condition, ConditionalCopy, Copy, Literal, Operation, Quad, Unary, Zero } from "../operation";
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

    private set(args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 1, `Invalid number of arguments (${args.length}) for set command`);
        return { type: "UnaryArg", action: "Set", v1: args[0] } as Unary
    }

    private push(args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 0, `Invalid number of arguments (${args.length}) for push command`);
        return { type: "NoArg", action: "Push" } as Zero;
    }

    private pop(args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 0, `Invalid number of arguments (${args.length}) for pop command`);
        return { type: "NoArg", action: "Pop" } as Zero;
    }

    private copy(args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 2, `Invalid number of arguments (${args.length}) for copy command`);
        return { type: "BinaryArg", action: "Copy", v1: args[0], v2: args[1] } as Copy;
    }

    private validateCondition(condition: Condition | string, message: string): void {
        if (condition !== "GT" && condition !== "EQ" && condition !== "LT") {
            throw new ParseError(message);
        }
    }

    private conditionalCopy(command: Token, args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 4, `Invalid number of arguments (${args.length}) for conditionalCopy command`);
        const condition = command.lexeme.split("cp")[1].toUpperCase();
        this.validateCondition(condition, `Invalid conditional copy condition type (${command.lexeme}) on line ${command.line}`);
        return { type: "QuadArg", action: "ConditionalCopy", condition, v1: args[0], v2: args[1], v3: args[2], v4: args[3] } as ConditionalCopy;
    }

    private add(args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 2, `Invalid number of arguments (${args.length}) for add command`);
        return { type: "BinaryArg", action: "Add", v1: args[0], v2: args[1] } as Binary;
    }

    private subtract(args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 2, `Invalid number of arguments (${args.length}) for subtract command`);
        return { type: "BinaryArg", action: "Sub", v1: args[0], v2: args[1] } as Binary;
    }

    private multiply(args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 2, `Invalid number of arguments (${args.length}) for multiply command`);
        return { type: "BinaryArg", action: "Mul", v1: args[0], v2: args[1] } as Binary;
    }

    private divide(args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 2, `Invalid number of arguments (${args.length}) for divide command`);
        return { type: "BinaryArg", action: "Div", v1: args[0], v2: args[1] } as Binary;
    }

    private write(args: (Register | Literal)[]): Operation {
        this.requireSetLength(args, 1, `Invalid number of arguments (${args.length}) for write command`);
        return { type: "UnaryArg", action: "Write", v1: args[0] } as Unary;
    }


    private command(parts: Token[]): Operation {
        const action = parts.shift();
        const args = parts.map(this.tokenToValue);
        switch (action?.lexeme.toLowerCase()) {
            case "set":
                return this.set(args);
            case "push":
                return this.push(args);
            case "pop":
                return this.pop(args);
            case "cp":
                return this.copy(args);
            case "cpgt":
            case "cplt":
            case "cpeq":
                return this.conditionalCopy(action, args);
            case "add":
                return this.add(args);
            case "sub":
                return this.subtract(args);
            case "mul":
                return this.multiply(args);
            case "div":
                return this.divide(args);
            case "wrt":
                return this.write(args);
            default:
                throw new ParseError(`Unknown command (line ${action?.line}): ${action ? tokenToString(action) : action})`);
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

            if(commandParts[0].type === TokenType.CommandEnd) {
                // Skip empty lines
                continue;
            }

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