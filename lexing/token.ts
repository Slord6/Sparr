
export enum TokenType {
    EOF,

    Number,
    AlphaNumber,
    Register,

    Command,
    CommandEnd
}

export interface Token {
    value: object | null,
    lexeme: string,
    type: TokenType,
    line: number
}

export function tokenName(type: TokenType): string {
    return TokenType[type];
}

export function tokenToString(token: Token): string {
    return `"${token?.lexeme}": ${tokenName(token?.type)}`;
}