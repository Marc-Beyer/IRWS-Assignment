import fs from "fs";
import path from "path";
import { porterStem } from "./porter.js";

const regexNonNormal = /[^A-Z0-9' ]/gi;
const regexMultiSpaces = /[ ]+/gi;

const stopWordsPath = "./stopWords.txt";
let stopWords: string[] = [];

export interface KeyValuePair {
    [key: string]: number;
}

export interface Document {
    id: string;
    termFrequency: KeyValuePair;
}

export function preprocessDirectory(directoryPath: string) {
    stopWords = getStopWords();

    let documents: Document[] = [];
    let wordCount: KeyValuePair = {};

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
}

export function preprocessFile(filePath: string, wordCount: KeyValuePair, documents: Document[]) {
    let file = fs.readFileSync(filePath, "utf8").replaceAll("\r\n", "\n");

    let files = file.split("\n********************************************\n");

    console.log("files: " + files.length);

    for (let index = 0; index < files.length; index++) {
        const fileContent = files[index];

        let firstLineBreak = fileContent.indexOf("\n");
        let documentId = fileContent.substring(0, firstLineBreak);

        // If there is an empty id skip the document.
        if (documentId.trim() === "") {
            continue;
        }

        // Split the content into words, remove all line breaks and a lot of unnecessary characters.
        let documentContent = fileContent
            .substring(firstLineBreak + 1)
            .toLowerCase()
            .replaceAll("\n", " ")
            .replaceAll(regexNonNormal, "")
            .split(" ");

        // Remove all stop-words and and stem them.
        let preprocessedWords = removeStopWords(documentContent).map((word) => porterStem(word.replaceAll("'", "")));

        documents.push({
            id: documentId,
            termFrequency: indexDocument(preprocessedWords, wordCount),
        });
    }

    return;
}

function removeStopWords(words: string[]) {
    return words.filter((word) => !stopWords.includes(word) && word.length > 0);
}

function getStopWords() {
    return fs.readFileSync(stopWordsPath, "utf-8").toLowerCase().replaceAll("\r", "").split("\n");
}

function indexDocument(words: string[], wordCount: KeyValuePair): KeyValuePair {
    let termFrequencies: KeyValuePair = {};

    let maxTermFrequency = 1;
    for (let index = 0; index < words.length; index++) {
        const word = words[index];
        if (termFrequencies[word] !== undefined) {
            termFrequencies[word]++;
            if (termFrequencies[word] > maxTermFrequency) maxTermFrequency = termFrequencies[word];
        } else {
            termFrequencies[word] = 1;
        }
    }

    for (const word in termFrequencies) {
        if (Object.prototype.hasOwnProperty.call(termFrequencies, word)) {
            termFrequencies[word] /= maxTermFrequency;
            if (wordCount[word] !== undefined) {
                wordCount[word]++;
            } else {
                wordCount[word] = 1;
            }
        }
    }

    return termFrequencies;
}
