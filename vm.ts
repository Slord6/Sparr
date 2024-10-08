import { RuntimeError } from "./errors/errors";
import { Binary, Data, Literal, Operation, Zero, Copy, Unary, ConditionalCopy, Condition } from "./operation";
import { GeneralRegisterIndex, Register, SpecialRegister } from "./register";

export class VM {
    private _stack: number[] = [];
    private _r0: number = 0;
    private _r1: number = 0;
    private _r2: number = 0;
    private _r3: number = 0;
    private _r4: number = 0;
    private _r5: number = 0;
    private _r6: number = 0;
    private _r7: number = 0;
    private _r8: number = 0;
    private _r9: number = 0;
    private _rc: number = 1;
    private _rv: number = 1;

    private _operations: Operation[];

    constructor(operations: Operation[]) {
        // Insert no-op so that program operations are 1-indexed
        this._operations = [{ type: "Noop", action: "Noop" }, ...operations]
    }

    private halt(): boolean {
        return this._rc <= 0 || this._rc >= this._operations.length;
    }

    private getRegisterValue(index: Register): number {
        return this[`_r${index}`];
    }

    private setRegisterValue(index: Register, value: number) {
        this[`_r${index}`] = value;
    }

    private storeResult(value: number) {
        this.setRegisterValue("v", value);
    }

    private resolve(data: Data): number {
        if ((data as Literal).type === "Literal") {
            return (data as Literal).value;
        }
        return this.getRegisterValue(data as Register);

    }

    public run() {
        while (!this.halt()) {
            this.step();
        }
    }

    private set(set: Unary): void {
        this.setRegisterValue("v", this.resolve(set.v1));
    }

    private push(): void {
        this._stack.push(this._rv);
    }

    private pop(): void {
        if (this._stack.length === 0) {
            throw new RuntimeError(`Tried to pop from empty stack. ${JSON.stringify(this)}`);
        };
        this.storeResult(this._stack.pop() as number);
    }

    private copy(copy: Copy): void {
        this.setRegisterValue(copy.v2, this.resolve(copy.v1));
    }

    private conditionalCopy(conditionalCopy: ConditionalCopy): void {
        const condA = this.resolve(conditionalCopy.v3);
        const condB = this.resolve(conditionalCopy.v4);
        const actionMap: Record<Condition, (a: number, b: number) => boolean> = {
            "EQ": (a, b) => a == b,
            "GT": (a, b) => a > b,
            "LT": (a, b) => a < b
        }
        if (actionMap[conditionalCopy.condition](condA, condB)) {
            this.copy({ ...conditionalCopy, type: "BinaryArg" });
        }
    }

    private binaryOp(v1: Data, v2: Data, action: (a: number, b: number) => number): void {
        this.storeResult(action(this.resolve(v1), this.resolve(v2)));
    }

    private add(add: Binary): void {
        this.binaryOp(add.v1, add.v2, (a, b) => a + b);
    }

    private sub(add: Binary): void {
        this.binaryOp(add.v1, add.v2, (a, b) => a - b);
    }

    private mul(add: Binary): void {
        this.binaryOp(add.v1, add.v2, (a, b) => a * b);
    }

    private div(add: Binary): void {
        this.binaryOp(add.v1, add.v2, (a, b) => a / b);
    }

    private write(write: Unary): void {
        console.log(this.resolve(write.v1));
    }

    private step() {
        const operation: Operation = this._operations[this._rc];
        // Increment prog counter before the operation as this shows the next operation location
        // Also means if user sets the value, we don't overwrite it
        this._rc++;
        switch (operation.action) {
            case "Noop":
            case "Set":
                this.set(operation as Unary);
                break;
            case "Push":
                this.push();
                break;
            case "Pop":
                this.pop();
                break;
            case "Copy":
                this.copy(operation as Copy);
                break;
            case "ConditionalCopy":
                this.conditionalCopy(operation as ConditionalCopy);
                break;
            case "Add":
                this.add(operation as Binary);
                break;
            case "Sub":
                this.sub(operation as Binary);
                break;
            case "Mul":
                this.mul(operation as Binary);
                break;
            case "Div":
                this.div(operation as Binary);
                break;
            case "Write":
                this.write(operation as Unary);
                break;
        }
    }


}