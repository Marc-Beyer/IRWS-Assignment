import { porterStem } from "./porter.js";
import fs from "fs";
import path from "path";
const regexNonNormal = /[^A-Z0-9' ]/gi;
const regexMultiSpaces = /[ ]+/gi;
const regexDoubleLineBreak = /\n *\n/;
const stopWordsPath = "./stopWords.txt";
const indexingInfoPath = "./indexingInfo.json";
let stopWords = [];
export function preprocessDirectory(directoryPath) {
    stopWords = getStopWords();
    let documents = [];
    let wordCount = {};
    // Read all directory contents
    const dirContents = fs.readdirSync(directoryPath);
    for (const dirContent of dirContents) {
        let contentPath = path.join(directoryPath, dirContent);
        let content = fs.statSync(contentPath);
        // Only read files ignore all directories
        if (content.isFile()) {
            preprocessFile(contentPath, wordCount, documents);
        }
    }
    console.log("documents: ", documents.length);
    console.log("words: ", Object.keys(wordCount).length);
    //  calculate Idfs
    for (const word in wordCount) {
        if (Object.prototype.hasOwnProperty.call(wordCount, word)) {
            const count = wordCount[word];
            wordCount[word] = Math.log10(1 + documents.length / count);
        }
    }
    let indexingInfo = {
        idfs: wordCount,
        indexedDocuments: documents.map((document) => {
            let sqrtSumOfSquaredWeights = 0;
            // multiply all termFrequencies with the correct idf
            for (const term in document.termFrequency) {
                if (Object.prototype.hasOwnProperty.call(document.termFrequency, term)) {
                    document.termFrequency[term] *= wordCount[term];
                    sqrtSumOfSquaredWeights += Math.pow(document.termFrequency[term], 2);
                }
            }
            return {
                id: document.id,
                title: document.title,
                termWeights: document.termFrequency,
                sqrtSumOfSquaredWeights: Math.sqrt(sqrtSumOfSquaredWeights),
            };
        }),
    };
    console.log("\nPreprocessing completed!\n");
    // Save the indexingInfo
    fs.writeFileSync(indexingInfoPath, JSON.stringify(indexingInfo));
}
export function preprocessFile(filePath, wordCount, documents) {
    // replace \r\n with \n to handle Windows line endings
    let file = fs.readFileSync(filePath, "utf8").replaceAll("\r\n", "\n");
    let files = file.split("\n********************************************\n");
    let documentIds = new Set();
    for (let index = 0; index < files.length; index++) {
        const fileContent = files[index];
        let firstLineBreak = fileContent.indexOf("\n");
        let documentId = fileContent.substring(0, firstLineBreak);
        if (documentIds.has(documentId)) {
            console.error(`ERROR:\nThe given file '${filePath}' has the multiple documents with the id '${documentId}'!\nThe duplicates are ignored in the further process.\n`);
            continue;
        }
        // If there is an empty id skip the document.
        if (documentId.trim() === "") {
            continue;
        }
        let documentWithTitle = fileContent.substring(firstLineBreak + 1);
        let doubleLineBreakMatch = regexDoubleLineBreak.exec(documentWithTitle);
        if (!doubleLineBreakMatch) {
            const docNr = index + 1;
            console.log(`ERROR:\nThe given file '${filePath}' has a document (${docNr}) with an incorrect Format!\nID or title might be missing.\nThis document will be ignored in the further process.\n`);
            continue;
        }
        let documentTitle = documentWithTitle.substring(0, doubleLineBreakMatch.index).replaceAll("\n", " ");
        documentIds.add(documentId);
        // Split the content into words, remove all line breaks and a lot of unnecessary characters.
        let documentContent = documentWithTitle.toLowerCase().replaceAll("\n", " ").replaceAll(regexNonNormal, "").trim().split(" ");
        // Remove all stop-words and and stem them.
        let preprocessedWords = removeStopWords(documentContent).map((word) => porterStem(word.replaceAll("'", "")));
        documents.push({
            id: documentId,
            title: documentTitle,
            termFrequency: indexDocument(preprocessedWords, wordCount),
        });
    }
    return;
}
function removeStopWords(words) {
    return words.filter((word) => !stopWords.includes(word) && word.length > 0);
}
function getStopWords() {
    return fs.readFileSync(stopWordsPath, "utf-8").toLowerCase().replaceAll("\r", "").split("\n");
}
function indexDocument(words, wordCount) {
    let termFrequencies = {};
    let maxTermFrequency = 1;
    for (let index = 0; index < words.length; index++) {
        const word = words[index];
        if (termFrequencies[word] !== undefined) {
            termFrequencies[word]++;
            if (termFrequencies[word] > maxTermFrequency)
                maxTermFrequency = termFrequencies[word];
        }
        else {
            termFrequencies[word] = 1;
        }
    }
    for (const word in termFrequencies) {
        if (Object.prototype.hasOwnProperty.call(termFrequencies, word)) {
            termFrequencies[word] /= maxTermFrequency;
            if (wordCount[word] !== undefined) {
                wordCount[word]++;
            }
            else {
                wordCount[word] = 1;
            }
        }
    }
    return termFrequencies;
}
