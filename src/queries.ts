import { KeyValuePair, Document, IndexedDocument, IndexingInfo, CosineSimilarityDocument } from "./interfaces.js";

import fs from "fs";
import path from "path";

const regexNonNormal = /[^A-Z0-9' ]/gi;
const regexMultiSpaces = /[ ]+/gi;
const regexCorrectFormat = /\n[ ]*\n/;

const stopWordsPath = "./stopWords.txt";
const indexingInfoPath = "./indexingInfo.json";
const queryResultsPath = "./queryResults/";
import { porterStem } from "./porter.js";

let stopWords: string[] = [];

export function executeQueries(filePath: string) {
    stopWords = getStopWords();
    let indexingInfo: IndexingInfo = JSON.parse(fs.readFileSync(indexingInfoPath, "utf8"));

    preprocessQueriesFile(filePath, indexingInfo);
}

function preprocessQueriesFile(filePath: string, indexingInfo: IndexingInfo) {
    // replace \r\n with \n to handle Windows line endings
    let file = fs.readFileSync(filePath, "utf8").replaceAll("\r\n", "\n");

    let queries = file.split("##");

    for (let index = 0; index < queries.length; index++) {
        let query = trimStart(queries[index]);

        if (query.length === 0) continue;

        let firstLineBreak = query.indexOf("\n");
        let queryId = query.substring(0, firstLineBreak);
        let queryContent = query.substring(firstLineBreak + 1);

        // Split the content into words, remove all line breaks and a lot of unnecessary characters.
        let queryTerms = queryContent.toLowerCase().replaceAll("\n", " ").replaceAll(regexNonNormal, "").trim().split(" ");

        // Remove all stop-words and and stem them.
        let preprocessedQueryTerms = removeStopWords(queryTerms).map((word) => porterStem(word.replaceAll("'", "")));

        let termFrequencies: KeyValuePair = {};
        let maxTermFrequency = 1;

        for (let index = 0; index < preprocessedQueryTerms.length; index++) {
            const term = preprocessedQueryTerms[index];
            if (termFrequencies[term] !== undefined) {
                termFrequencies[term]++;
                if (termFrequencies[term] > maxTermFrequency) maxTermFrequency = termFrequencies[term];
            } else {
                termFrequencies[term] = 1;
            }
        }

        let sqrtSumOfSquaredWeights = 0;

        // TODO what if the term in the query dose not exist in any document. Count will be 0. Error division by zero
        for (const term in termFrequencies) {
            if (Object.prototype.hasOwnProperty.call(termFrequencies, term)) {
                termFrequencies[term] = (0.5 + termFrequencies[term] / maxTermFrequency) * (indexingInfo.idfs[term] ?? 0);
                sqrtSumOfSquaredWeights += Math.pow(termFrequencies[term], 2);
            }
        }

        sqrtSumOfSquaredWeights = Math.sqrt(sqrtSumOfSquaredWeights);

        let cosineSimilarityDocuments: CosineSimilarityDocument[] = [];
        for (let index = 0; index < indexingInfo.indexedDocuments.length; index++) {
            const indexedDocument = indexingInfo.indexedDocuments[index];
            let queryDocumentWeightSum = 0;

            for (const term in termFrequencies) {
                if (Object.prototype.hasOwnProperty.call(termFrequencies, term)) {
                    queryDocumentWeightSum += (indexedDocument.termWeights[term] ?? 0) * termFrequencies[term];
                }
            }

            queryDocumentWeightSum = Math.sqrt(queryDocumentWeightSum);
            let cosineSimilarity = queryDocumentWeightSum / (indexedDocument.sqrtSumOfSquaredWeights * sqrtSumOfSquaredWeights);

            cosineSimilarityDocuments.push({
                id: indexedDocument.id,
                title: indexedDocument.title,
                cosineSimilarity,
            });
        }

        // Sort the List to show the document with the highest cosineSimilarity first
        // Format the document as follows: Cosine <Similarity>;"<Document ID>";"<Document Title>"
        let fileContent = cosineSimilarityDocuments
            .sort((a, b) => {
                return a.cosineSimilarity < b.cosineSimilarity ? 1 : a.cosineSimilarity > b.cosineSimilarity ? -1 : 0;
            })
            .map((doc) => {
                return `${doc.cosineSimilarity};"${doc.id}";"${doc.title}"`;
            })
            .join("\n");

        // Write the file asynchronously
        fs.writeFile(`${queryResultsPath}query_${queryId}_result.csv`, fileContent, () => {});
    }

    return;
}

function trimStart(str: string) {
    let trimIndex = 0;
    while (trimIndex < str.length) {
        if (str[trimIndex] === " " || str[trimIndex] === "\n") {
            trimIndex++;
        } else {
            break;
        }
    }
    if (trimIndex != 0) {
        str = str.substring(trimIndex);
    }
    return str;
}

function removeStopWords(words: string[]) {
    return words.filter((word) => !stopWords.includes(word) && word.length > 0);
}

function getStopWords() {
    return fs.readFileSync(stopWordsPath, "utf-8").toLowerCase().replaceAll("\r", "").split("\n");
}
