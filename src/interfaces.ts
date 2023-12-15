export interface KeyValuePair {
    [key: string]: number;
}

export interface Queries {
    [key: number]: string;
}

export interface Document {
    id: string;
    title: string;
    termFrequency: KeyValuePair;
}

export interface IndexedDocument {
    id: string;
    title: string;
    termWeights: KeyValuePair;
    sqrtSumOfSquaredWeights: number;
}

export interface IndexingInfo {
    idfs: KeyValuePair;
    indexedDocuments: IndexedDocument[];
}

export interface CosineSimilarityDocument {
    cosineSimilarity: number;
    id: string;
    title: string;
}

export interface InvertedIndex {
    [key: string]: string;
}
