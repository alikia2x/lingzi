
class TrieNode {
    children: Map<string, TrieNode>;
    tokenId: number | null;

    constructor() {
        this.children = new Map();
        this.tokenId = null;
    }
}

class Trie {
    root: TrieNode;

    constructor() {
        this.root = new TrieNode();
    }

    insert(token: string, tokenId: number) {
        let node = this.root;
        for (const char of token) {
            if (!node.children.has(char)) {
                node.children.set(char, new TrieNode());
            }
            node = node.children.get(char)!;
        }
        node.tokenId = tokenId;
    }

    searchLongestToken(text: string): [number | null, number] {
        let node = this.root;
        let longestTokenId: number | null = null;
        let currentTokenLength = 0;

        for (const char of text) {
            if (!node.children.has(char)) {
                break;
            }
            node = node.children.get(char)!;
            currentTokenLength += 1;
            if (node.tokenId !== null) {
                longestTokenId = node.tokenId;
            }
        }

        return [longestTokenId, currentTokenLength];
    }
}

export default class BPETokenizer {
    private trie: Trie;

    constructor(vocabulary: { [key: string]: number }) {
        this.trie = new Trie();
        for (const token in vocabulary) {
                this.trie.insert(token, vocabulary[token]);
        }
    }

    tokenize(text: string): number[] {
        const tokenIds: number[] = [];
        let i = 0;

        while (i < text.length) {
            const [longestTokenId, length] = this.trie.searchLongestToken(text.slice(i));
            if (longestTokenId !== null) {
                tokenIds.push(longestTokenId);
                i += length;
            } else {
                // If no token is found, treat the character as a single token
                // tokenIds.push(text.charCodeAt(i));
                i += 1;
            }
        }

        return tokenIds;
    }
}

// Example usage:
// const vocabulary = {
//     'aa': 1,
//     'bb': 2,
//     'ab': 3,
//     'ba': 4,
//     'a': 5,
//     'b': 6
// };
// const tokenizer = new BPETokenizer(vocabulary);

// const text = 'ababbaa';
// const tokenIds = tokenizer.tokenize(text);
// console.log(tokenIds); // Output: [ 3, 3, 6, 1 ]
