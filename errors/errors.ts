export class SparrError extends Error {
    private _msg: string;
    
    constructor(msg: string) {
        super();
        this._msg = msg;
    }
}

export class RuntimeError extends SparrError {
    constructor(msg: string) {
        super(msg);
    }
}

export class LexError extends SparrError {
    constructor(msg: string) {
        super(msg);
    }
}

export class ParseError extends SparrError {
    constructor(msg: string) {
        super(msg);
    }
}