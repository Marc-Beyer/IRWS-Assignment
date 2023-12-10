import readline from "readline";
import { porterStem } from "./porter.js";
const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const dataPath = "./data-lab2";
(function main() {
    console.log("IRWS Assignment by Marc Beyer and Roberto :D");
    getUserSearchQuery();
})();
function getUserSearchQuery() {
    readlineInterface.question("Choose [B]oolean, [V]ector space query or [P]rint the index -> ", (input) => {
        switch (input) {
            case "P":
            case "p":
                break;
            case "B":
            case "b":
                readlineInterface.question("Enter the boolean query -> ", (query) => {
                    console.log("stem: " + porterStem(query));
                    //getUserSearchQuery();
                });
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
