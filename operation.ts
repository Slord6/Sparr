import { Token } from "./lexing/token";
import { Register } from "./register";

export type OpString = 
    | "set"
    | "push"
    | "pop"
    | "cp"
    | "cpgt"
    | "cplt"
    | "cpeq"
    | "add"
    | "sub"
    | "mul"
    | "div"
    | "wrt"
    | "wrts"
    | "wrtc"
    | "wrtsc"

export type OperationType =
    | "Noop"
    | "NoArg"
    | "UnaryArg"
    | "BinaryArg"
    | "QuadArg"
    | "ConditionalCopy"
    | "Set"

export type OperationAction =
    | "Noop"
    | "Set"
    | "Push"
    | "Pop"
    | "Copy"
    | "ConditionalCopy"
    | "Add"
    | "Sub"
    | "Mul"
    | "Div"
    | "Write"
    | "WriteStack"
    | "WriteChar"
    | "WriteStackChars"

export type Condition =
    | "GT"
    | "LT"
    | "EQ";


export type Literal = { type: "Literal", value: number };
export type Data = Literal | Register;

export interface Operation {
    type: OperationType;
    action: OperationAction;
}

export interface Zero extends Operation {
    type: "NoArg"
}

export interface Unary extends Operation {
    type: "UnaryArg",
    v1: Data;
}

export interface Binary extends Operation {
    type: "BinaryArg",
    v1: Data;
    v2: Data;
}

export interface Copy extends Binary {
    v1: Register;
    v2: Register;
}

export interface Quad extends Operation {
    type: "QuadArg",
    v1: Data;
    v2: Data;
    v3: Data;
    v4: Data;
}

export interface ConditionalCopy extends Quad {
    action: "ConditionalCopy";
    condition: Condition;
    v1: Register;
    v2: Register;
}