import { KeyValuePair, Document, IndexedDocument, IndexingInfo, CosineSimilarityDocument, Queries } from "./interfaces.js";

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
let indexingInfo: IndexingInfo;

export function readQueries(filePath: string) {
    let queriesMap: Queries = {};

    stopWords = getStopWords();
    indexingInfo = JSON.parse(fs.readFileSync(indexingInfoPath, "utf8"));

    // replace \r\n with \n to handle Windows line endings
    let file = fs.readFileSync(filePath, "utf8").replaceAll("\r\n", "\n");

    let queries = file.split("##");

    for (let index = 0; index < queries.length; index++) {
        let query = trimStart(queries[index]);

        if (query.length === 0) continue;

        let firstLineBreak = query.indexOf("\n");
        let queryId: string = query.substring(0, firstLineBreak);
        let queryContent = query.substring(firstLineBreak + 1);

        let queryIdAsNumber = parseInt(queryId);
        if (Number.isNaN(queryIdAsNumber)) {
            console.log(`ERROR:\nQuery has no valid ID: '${queryId}'`);
        } else {
            if (queriesMap[queryIdAsNumber] !== undefined) {
                console.log(
                    `ERROR:\nThe given file '${filePath}' has the multiple queries with the id '${queryId}'!\nThe duplicates are ignored in the further process.\n`
                );
            } else {
                queriesMap[queryIdAsNumber] = queryContent;
            }
        }
    }

    return queriesMap;
}

export function executeQueries(queryId: string, queryContent: string) {
    // Split the content into words, remove all line breaks and a lot of unnecessary characters.
    let queryTerms = queryContent.toLowerCase().replaceAll("\n", " ").replaceAll(regexNonNormal, "").trim().split(" ");

    // Remove all stop-words and and stem them.
    let preprocessedQueryTerms = removeStopWords(queryTerms).map((word) => porterStem(word.replaceAll("'", "")));

    // Calculate term frequencies for the query and the max term frequency
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

    // Divide the term frequencies by the max term frequency and multiply them with the idf to get the term weights.
    // Square them and sum them up.

    for (const term in termFrequencies) {
        if (Object.prototype.hasOwnProperty.call(termFrequencies, term)) {
            termFrequencies[term] = (0.5 + termFrequencies[term] / maxTermFrequency) * (indexingInfo.idfs[term] ?? 0);
            sqrtSumOfSquaredWeights += Math.pow(termFrequencies[term], 2);
        }
    }

    /*
    for (const term in indexingInfo.idfs) {
        if (Object.prototype.hasOwnProperty.call(indexingInfo.idfs, term)) {
            const element = indexingInfo.idfs[term];
            if (termFrequencies[term] === undefined) {
                termFrequencies[term] = 0.5 * indexingInfo.idfs[term];
            } else {
                termFrequencies[term] = (0.5 + termFrequencies[term] / maxTermFrequency) * (indexingInfo.idfs[term] ?? 0);
            }
            sqrtSumOfSquaredWeights += Math.pow(termFrequencies[term], 2);
        }
    }
    */

    // Take the square root of the sum of squared weights.
    sqrtSumOfSquaredWeights = Math.sqrt(sqrtSumOfSquaredWeights);

    // Calculate the cosine similarity for all documents
    let cosineSimilarityDocuments: CosineSimilarityDocument[] = [];
    for (let index = 0; index < indexingInfo.indexedDocuments.length; index++) {
        const indexedDocument = indexingInfo.indexedDocuments[index];
        let queryDocumentWeightSum = 0;

        // Multiply all terms weights of the query with weights of the matching terms of the document
        for (const term in termFrequencies) {
            if (Object.prototype.hasOwnProperty.call(termFrequencies, term)) {
                queryDocumentWeightSum += (indexedDocument.termWeights[term] ?? 0) * termFrequencies[term];
            }
        }

        // Calculate the cosine similarity for this document
        queryDocumentWeightSum = Math.sqrt(queryDocumentWeightSum);
        let cosineSimilarity = queryDocumentWeightSum / (indexedDocument.sqrtSumOfSquaredWeights * sqrtSumOfSquaredWeights);

        // Add the calculated cosineSimilarity tot the list of cosineSimilarities
        cosineSimilarityDocuments.push({
            id: indexedDocument.id,
            title: indexedDocument.title,
            cosineSimilarity,
        });
    }

    // Sort the List to show the document with the highest cosineSimilarity first
    // then get the first 20 elements and join them with a lineending.
    // Format the document as follows: Cosine <Similarity>;"<Document ID>";"<Document Title>"
    let fileContent = cosineSimilarityDocuments
        .sort((a, b) => {
            return a.cosineSimilarity < b.cosineSimilarity ? 1 : a.cosineSimilarity > b.cosineSimilarity ? -1 : 0;
        })
        .slice(0, 20)
        .map((doc) => {
            return `${doc.cosineSimilarity};"${doc.id}";"${doc.title}"`;
        })
        .join("\n");

    // Write the file asynchronously
    let fileName = `${queryResultsPath}query_${queryId}_result.csv`;
    fs.writeFile(fileName, fileContent, () => {});

    console.log(`Created file '${fileName}'.`);

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
