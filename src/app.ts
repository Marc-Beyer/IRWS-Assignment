import readline from "readline";
import { porterStem } from "./porter.js";
import { preprocessDirectory } from "./preprocess.js";

const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const dataPath = "./data-lab2";

(function main() {
    console.log("IRWS Assignment by Marc Beyer and Roberto :D\n");
    getUserSearchQuery();
})();

function getUserSearchQuery() {
    readlineInterface.question("What do you want to do?\nChoose [P]reprocess or [Q]uery -> ", (input) => {
        switch (input) {
            case "P":
            case "p":
                preprocessDirectory("./files");
                break;
            case "V":
            case "v":
                break;
                readlineInterface.question("Enter the vector space query -> ", (query) => {
                    getUserSearchQuery();
                });
            default:
                console.log("End");
                getUserSearchQuery();
                break;
        }
    });
}
