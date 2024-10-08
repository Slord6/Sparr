# Sparr
 A toy VM

## The VM

Made up of:
- The `stack`
- 10 general use registers `r0` to `r9`
- Value register `rv`, for storing the output of operations
- Prog counter `rc`, the next instruction to be 

At initalisation, all registers have the value `0` unless otherwise stated

## Prog counter
The prog counter is one-indexed (so will have the value `2` when the first operation is performed).

If the prog counter is ever set outside the bounds (<0 or >prog length) of the program then the program halts.

## Operations

### Set

`set <number>`

`set rx`

Set `rv` to the value of the number or the value of the given register

### Push
`push`

Push the value in `rv` to the stack 

### Pop
`pop`

Pop the top of the stack to `rv`

### Copy
`cp rx ry`

Copy the value in register `rx` to register `ry`

## Conditional Copy

`cpgt rx ry rz rw`

`cplt rx ry rz rw`

`cpeq rx ry rz rw`

Copy the value in rx to ry, if `rz <op> rw` is true

### Add/Sub/Mul/Div
`add rx ry` - Addition

`sub <number> <number>` - Subtraction

`mul rx <number>` - Multiplication

`div <number> ry` - Division

Apply the operation to the two values (either literals or stored in a register) and store in `rv`

## Write

`wrt rx`

`wrt <number>`

Write the value in the given register, or the given value to the screen 

## Write Stack

`wrts`

Pop all values off the stack in order and print to screen
