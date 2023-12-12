export interface KeyValuePair {
    [key: string]: number;
}

export interface Document {
    id: string;
    termFrequency: KeyValuePair;
}

export interface Document {
    id: string;
    termFrequency: KeyValuePair;
}

export interface IndexedDocument {
    id: string;
    termWeights: KeyValuePair;
    sqrtSumOfSquaredWeights: number;
}

export interface IndexingInfo {
    idfs: KeyValuePair;
    indexedDocuments: IndexedDocument[];
}
