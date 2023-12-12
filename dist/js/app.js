import { preprocessDirectory } from "./preprocess.js";
import { executeQueries } from "./queries.js";
if (process.argv.length !== 4) {
    console.error("Error: Parameter missing!\nAdd '-preprocess <directoryPath>' or '-queries <filePath>'");
}
else if (process.argv[2] === "-preprocess") {
    preprocessDirectory(process.argv[3]);
}
else if (process.argv[2] === "-queries") {
    executeQueries(process.argv[3]);
}
else {
    console.error("Error: Wrong parameter!\nAdd '-preprocess <directoryPath>' or '-queries <filePath>'");
}
