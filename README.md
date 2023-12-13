# IRWS Assignment by Marc Beyer and Robert Soumagne

-   [Installation](#installation)
-   [Building the project](#building-the-project)
-   [Running preprocessing](#running-preprocessing)
-   [Running queries](#running-queries)

## Installation

This is a NodeJS project written in TypeScript. To run it you will need to install the cross-platform JavaScript runtime environment **NodeJS**.
<br>For information on using Node.js, see the [Node.js website][].
<br>We have build and tested the project with Node **v20.10.0 LTS**.

First download and install **NodeJS v20.10.0 LTS** with **NPM** from the [Node.js website][].

After installing NodeJS and NPM you can test if you have installed it correctly with:

```
> node -v
v20.10.0

> npm -v
10.1.0
```

Then navigate to the assignment-folder:

```
> cd <path to folder>/IRWS-Assignment
```

Install all dependencies with:

```
npm i
```

## Building the project

To build the project run:

```
npm run build
```

This will compile the TypeScript code to JavaScript code.

## Running preprocessing

To pre-process the documents run:

```
node ./dist/js/app.js -preprocess ./files
```

This will take a path to a folder, which must include all text files that should be preprocessed.
<br>It will generate a _'indexingInfo.json'-file_, that include the IDFs of all terms and the term weights of each document in JSON format. It is structured as follows:

```
{
    "idfs": {
        "<term_1>": number,
        "<term_2>": number,
        ...
        "<term_n>": number
    },
    "indexedDocuments": [
        {
            "id": "string",
            "title": "string",
            "termWeights": {
                "<term_1>": number,
                "<term_2>": number,
                ...
                "<term_n>": number
            },
            "sqrtSumOfSquaredWeights": number
        }
    ]
}
```

## Running queries

To execute the queries run:

```
node ./dist/js/app.js -queries ./queries/IR1_Queries.txt
```

This will take a path to a file, which must include all queries that should be executed.
<br>It will calculate the cosine similarity for each document, order all documents based on the cosine similarity and save them in a CSV file in the folder 'queryResults'. Each file is named 'query\_<Query Nr>\_result.csv' and is formate as follows:

```
<Cosine Similarity>;"<Document ID>";"<Document Title>"
```

[Node.js website]: https://nodejs.org/
