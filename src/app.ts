import { Queries } from "./interfaces.js";
import { preprocessDirectory } from "./preprocess.js";
import { executeQueries, readQueries } from "./queries.js";

import fs from "fs";
import readline from "readline";

let queries: Queries;
let nrOfQueries = 0;

if (process.argv.length !== 4) {
    console.error("Error: Parameter wrong or missing!\nAdd '-preprocess <directoryPath>' or '-queries <filePath>'");
} else if (process.argv[2] === "-preprocess") {
    if (!fs.existsSync(process.argv[3])) {
        console.error(`Error: File or directory '${process.argv[3]}' does not exist!`);
    } else {
        preprocessDirectory(process.argv[3]);
    }
} else if (process.argv[2] === "-queries") {
    const readlineInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    if (!fs.existsSync(process.argv[3])) {
        console.error(`Error: File or directory '${process.argv[3]}' does not exist!`);
    } else {
        queries = readQueries(process.argv[3]);
        nrOfQueries = Object.keys(queries).length;

        askForUserInput(readlineInterface);
    }
} else {
    console.error("Error: Wrong parameter!\nAdd '-preprocess <directoryPath>' or '-queries <filePath>'");
}

function askForUserInput(readlineInterface: readline.Interface) {
    readlineInterface.question(
        `\n${nrOfQueries} queries found. What do you want to do?\nExecute [a]ll queries, [id of query] or [q]uit -> `,
        (userInput) => {
            switch (userInput) {
                case "A":
                case "a":
                    for (const id in queries) {
                        if (Object.prototype.hasOwnProperty.call(queries, id)) {
                            executeQueries(id, queries[id]);
                        }
                    }
                    askForUserInput(readlineInterface);
                    break;
                case "Q":
                case "q":
                    readlineInterface.close();
                    break;
                default:
                    let userInputNum = parseInt(userInput);
                    if (Number.isNaN(userInputNum)) {
                        console.error(`No valid input: ${userInput}`);
                    } else if (queries[userInputNum] === undefined) {
                        console.error(`No valid input: ${userInput}`);
                    } else {
                        executeQueries(userInputNum.toString(), queries[userInputNum]);
                    }
                    askForUserInput(readlineInterface);
                    break;
            }
        }
    );
}
