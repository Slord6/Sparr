import { Scanner } from "./lexing/scanner";
import { tokenToString } from "./lexing/token";
import { Parser } from "./parsing/parser";
import { VM } from "./vm";
import * as fs from 'fs';

const args = process.argv.slice(2, process.argv.length);
if(args.length == 0) {
    console.error("Require file to run");
    process.exit(1);
}

const prog = fs.readFileSync(args[0]).toString();

const scanner = new Scanner(prog);
const tokens = scanner.scanTokens();
console.log("SCAN RESULT:", tokens.map(tokenToString));

const parser = new Parser(tokens);
const operations = parser.parse();
console.log("PARSE RESULT", operations);

const vm = new VM(operations);
vm.run();