export function porterStem(word: string): string {
    // New rule see: https://tartarus.org/martin/PorterStemmer/index-old.html
    if (word.length < 3) return word;

    word = step1a(word);
    word = step1b(word);
    word = step1c(word);
    word = step2(word);
    word = step3(word);
    word = step4(word);
    word = step5a(word);
    word = step5b(word);
    return word;
}

enum LAST_CHARACTER {
    NOT_SET,
    C,
    V,
}

export function step1a(word: string): string {
    if (word.endsWith("sses")) return word.slice(0, -4) + "ss";
    if (word.endsWith("ies")) return word.slice(0, -3) + "i";
    if (word.endsWith("ss")) return word;
    if (word.endsWith("s")) return word.slice(0, -1);
    return word;
}

export function step1b(word: string): string {
    if (word.endsWith("eed")) {
        if (countVC(word.slice(0, -3)) > 0) return word.slice(0, -1);
        return word;
    }
    if (/^.*([aeiou]|[^aeiou]y).*ed$/.test(word)) {
        return step1bAdditional(word.slice(0, -2));
    }
    if (/^.*([aeiou]|[^aeiou]y).*ing$/.test(word)) {
        return step1bAdditional(word.slice(0, -3));
    }

    return word;
}

export function step1bAdditional(word: string): string {
    if (word.endsWith("at") || word.endsWith("bl") || word.endsWith("iz")) return word + "e";
    if (word.charAt(word.length - 1) == word.charAt(word.length - 2)) {
        let lastCharacter = word.charAt(word.length - 1);
        if (/[^aeiouslz]/.test(lastCharacter)) {
            return word.slice(0, -1);
        }
    }
    if (countVC(word) === 1 && endsWithCVC(word)) {
        return word + "e";
    }
    return word;
}

export function step1c(word: string): string {
    if (/^.*([aeiou]|[^aeiou]y).*y$/.test(word)) {
        return word.slice(0, -1) + "i";
    }
    return word;
}

export function step2(word: string): string {
    if (word.endsWith("ational") && countVC(word.slice(0, -7)) > 0) return word.slice(0, -7) + "ate";
    if (word.endsWith("tional") && countVC(word.slice(0, -6)) > 0) return word.slice(0, -6) + "tion";
    if (word.endsWith("enci") && countVC(word.slice(0, -4)) > 0) return word.slice(0, -1) + "e";
    if (word.endsWith("anci") && countVC(word.slice(0, -4)) > 0) return word.slice(0, -1) + "e";
    if (word.endsWith("izer") && countVC(word.slice(0, -4)) > 0) return word.slice(0, -1);

    // replaced by new rule see: https://tartarus.org/martin/PorterStemmer/index-old.html
    //if (word.endsWith("abli") && countVC(word.slice(0, -4)) > 0) return word.slice(0, -1) + "e";
    if (word.endsWith("bli") && countVC(word.slice(0, -3)) > 0) return word.slice(0, -1) + "e";

    if (word.endsWith("alli") && countVC(word.slice(0, -4)) > 0) return word.slice(0, -2);
    if (word.endsWith("entli") && countVC(word.slice(0, -5)) > 0) return word.slice(0, -2);
    if (word.endsWith("eli") && countVC(word.slice(0, -3)) > 0) return word.slice(0, -2);
    if (word.endsWith("ousli") && countVC(word.slice(0, -5)) > 0) return word.slice(0, -2);
    if (word.endsWith("ization") && countVC(word.slice(0, -7)) > 0) return word.slice(0, -5) + "e";
    if (word.endsWith("ation") && countVC(word.slice(0, -5)) > 0) return word.slice(0, -3) + "e";
    if (word.endsWith("ator") && countVC(word.slice(0, -4)) > 0) return word.slice(0, -2) + "e";
    if (word.endsWith("alism") && countVC(word.slice(0, -5)) > 0) return word.slice(0, -3);
    if (word.endsWith("iveness") && countVC(word.slice(0, -7)) > 0) return word.slice(0, -4);
    if (word.endsWith("fulness") && countVC(word.slice(0, -7)) > 0) return word.slice(0, -4);
    if (word.endsWith("ousness") && countVC(word.slice(0, -7)) > 0) return word.slice(0, -4);
    if (word.endsWith("aliti") && countVC(word.slice(0, -5)) > 0) return word.slice(0, -3);
    if (word.endsWith("iviti") && countVC(word.slice(0, -5)) > 0) return word.slice(0, -3) + "e";
    if (word.endsWith("biliti") && countVC(word.slice(0, -6)) > 0) return word.slice(0, -5) + "le";

    // New rules see: https://tartarus.org/martin/PorterStemmer/index-old.html
    if (word.endsWith("logi") && countVC(word.slice(0, -4)) > 0) return word.slice(0, -1);
    return word;
}

export function step3(word: string): string {
    if (word.endsWith("icate") && countVC(word.slice(0, -5)) > 0) return word.slice(0, -3);
    if (word.endsWith("ative") && countVC(word.slice(0, -5)) > 0) return word.slice(0, -5);
    if (word.endsWith("alize") && countVC(word.slice(0, -5)) > 0) return word.slice(0, -3);
    if (word.endsWith("iciti") && countVC(word.slice(0, -5)) > 0) return word.slice(0, -3);
    if (word.endsWith("ical") && countVC(word.slice(0, -4)) > 0) return word.slice(0, -2);
    if (word.endsWith("ful") && countVC(word.slice(0, -3)) > 0) return word.slice(0, -3);
    if (word.endsWith("ness") && countVC(word.slice(0, -4)) > 0) return word.slice(0, -4);
    return word;
}

export function step4(word: string): string {
    if (word.endsWith("al") && countVC(word.slice(0, -2)) > 1) return word.slice(0, -2);
    if (word.endsWith("ance") && countVC(word.slice(0, -4)) > 1) return word.slice(0, -4);
    if (word.endsWith("ence") && countVC(word.slice(0, -4)) > 1) return word.slice(0, -4);
    if (word.endsWith("er") && countVC(word.slice(0, -2)) > 1) return word.slice(0, -2);
    if (word.endsWith("ic") && countVC(word.slice(0, -2)) > 1) return word.slice(0, -2);
    if (word.endsWith("able") && countVC(word.slice(0, -4)) > 1) return word.slice(0, -4);
    if (word.endsWith("ible") && countVC(word.slice(0, -4)) > 1) return word.slice(0, -4);
    if (word.endsWith("ant") && countVC(word.slice(0, -3)) > 1) return word.slice(0, -3);
    if (word.endsWith("ement")) {
        if (countVC(word.slice(0, -5)) > 1) return word.slice(0, -5);
        return word;
    }
    if (word.endsWith("ment")) {
        if (countVC(word.slice(0, -4)) > 1) return word.slice(0, -4);
        return word;
    }
    if (word.endsWith("ent") && countVC(word.slice(0, -3)) > 1) return word.slice(0, -3);
    if (word.endsWith("ion")) {
        let stem = word.slice(0, -3);
        if ((stem.endsWith("s") || stem.endsWith("t")) && countVC(stem) > 1) return stem;
    }
    if (word.endsWith("ou") && countVC(word.slice(0, -2)) > 1) return word.slice(0, -2);
    if (word.endsWith("ism") && countVC(word.slice(0, -3)) > 1) return word.slice(0, -3);
    if (word.endsWith("ate") && countVC(word.slice(0, -3)) > 1) return word.slice(0, -3);
    if (word.endsWith("iti") && countVC(word.slice(0, -3)) > 1) return word.slice(0, -3);
    if (word.endsWith("ous") && countVC(word.slice(0, -3)) > 1) return word.slice(0, -3);
    if (word.endsWith("ive") && countVC(word.slice(0, -3)) > 1) return word.slice(0, -3);
    if (word.endsWith("ize") && countVC(word.slice(0, -3)) > 1) return word.slice(0, -3);
    return word;
}

export function step5a(word: string): string {
    if (word.endsWith("e") && countVC(word.slice(0, -1)) > 1) return word.slice(0, -1);
    // (m=1 and not *o) E            →
    if (word.endsWith("e") && countVC(word.slice(0, -1)) === 1 && !endsWithCVC(word.slice(0, -1))) {
        return word.slice(0, -1);
    }
    return word;
}

export function step5b(word: string): string {
    if (word.endsWith("ll") && countVC(word) > 1) return word.slice(0, -1);
    return word;
}

// *v*  –    the stem contains a vowel
export function containsVowel(word: string): boolean {
    return /as/.test(word);
}

// Test if the stem ends cvc, where the second c is not W, X or Y (e.g. -WIL, -HOP)
export function endsWithCVC(word: string): boolean {
    return /[^aeiou][aeiouy][^aeiouwxy]$/.test(word);
}

export function countVC(word: string): number {
    const regex = /[aeiou]/;
    let lastCharacter = LAST_CHARACTER.NOT_SET;
    let m = 0;
    for (let index = 0; index < word.length; index++) {
        const character = word.charAt(index);
        if (regex.test(character)) {
            lastCharacter = LAST_CHARACTER.V;
        } else {
            switch (lastCharacter) {
                case LAST_CHARACTER.C:
                    if (character === "y") {
                        lastCharacter = LAST_CHARACTER.V;
                    }
                    break;
                case LAST_CHARACTER.V:
                    m++;
                    lastCharacter = LAST_CHARACTER.C;
                    break;
                case LAST_CHARACTER.NOT_SET:
                    lastCharacter = LAST_CHARACTER.C;
                    break;
            }
        }
    }
    return m;
}
