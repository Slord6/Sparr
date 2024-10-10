# Sparr
 A toy VM

## The VM

Made up of:
- Two `stack`s, A and B.
- 10 general use registers `r0` to `r9`.
- Value register `rv`, primarily for storing the output of operations but can also be accessed as a general register.
- Prog counter `rc`, the next instruction to be executed; writeable.
- Stack size register (readonly), `rs`.

At initalisation, all registers have the value `0` unless otherwise stated. The stack starts empty.

## Program counter
Empty lines and comments are treated as no-ops so that line numbers in the source are mapped directly to the counter at runtime.

The prog counter is one-indexed (so will have the value `2` as the first operation is performed).

If the prog counter is ever set outside the bounds (<0 or >prog length) of the program then the program halts.

## Comments

`# comment`

`add 1 1 # comment`

## Operations

### Stacks and Switching

There are two stacks A and B. Only one is "active" at a time and is the target of all stack-related operations

`swap`

Swaps the active stack

The `rs` register is readonly and holds the size of the currently active stack.

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

`cpgt rx ry rz rw` - Greater than

`cplt rx ry rz rw` - Less than

`cpeq rx ry rz rw` - Equals

Copy the value in rx to ry, if `rz <op> rw` is true

### Add/Sub/Mul/Div/Mod
`add rx ry` - Addition

`sub <number> <number>` - Subtraction

`mul rx <number>` - Multiplication

`div <number> ry` - Division

`mod <number> ry` - Modulus

Apply the operation to the two values (either literals or stored in a register) and store in `rv`.
 The operation is always applied as read, i.e. `div 1 2` is equivalent to `1 / 2`.

## Output

### Write

`wrt rx`

`wrt <number>`

Write the value in the given register, or the given value to the screen followed by a newline

### Write Stack

`wrts`

Pop all values off the stack in order and print to screen on a single line

### Write Character

`wrtc rx`

`wrtc <number>`

Convert the value to it's ascii equivalent and print to screen followed by a newline

### Write Stack

`wrtsc`

Pop all values off the stack in order, convert to ascii equivalent, and print to screen on a single line