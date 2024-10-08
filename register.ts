export type GeneralRegisterIndex =
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9;

export type SpecialRegister =
    | "v"
    | "c"
    | "s";

export type Register = GeneralRegisterIndex | SpecialRegister;