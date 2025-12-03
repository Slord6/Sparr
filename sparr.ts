import { Scanner } from "./lexing/scanner";
import { tokenToString } from "./lexing/token";
import { Parser } from "./parsing/parser";
import { VM } from "./vm";
import * as fs from 'fs';

const args = process.argv.slice(2, process.argv.length);
if(args.length == 0) {
    console.error("sparr <path to file.sparr> [<path to stack A initial values file, new line separated>]");
    process.exit(1);
}

const prog = fs.readFileSync(args[0]).toString();
let stackA: number[] = [];
if(args.length >= 2) {
    const stackFile = fs.readFileSync(args[1]).toString();
    stackA = stackFile.split("\n").map((v) => {
        let d = parseInt(v.trim());
        if(Number.isNaN(d)) {
            d = v.charCodeAt(0);
        }
        return d;
    });
    console.log(`Loaded ${stackA.length} initial stack A values from ${args[1]}`);
}

const scanner = new Scanner(prog);
const tokens = scanner.scanTokens();
// console.log("SCAN RESULT:", tokens.map(tokenToString));

const parser = new Parser(tokens);
const operations = parser.parse();
// console.log("PARSE RESULT", operations);

const vm = new VM(operations, stackA);
vm.run();