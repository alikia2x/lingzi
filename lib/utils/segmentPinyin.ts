import BPETokenizer from "./BPEtokenizer";

// 定义声母和韵母的字典
// 编码有点抽象, 第一位数字是类型（1声母，2韵母）
// 后面两个数字是编号
const phonetics: { [key: string]: number } = {
    "b": 101,
    "p": 102,
    "m": 103,
    "f": 104,
    "d": 105,
    "t": 106,
    "n": 107,
    "l": 108,
    "g": 109,
    "k": 110,
    "h": 111,
    "j": 112,
    "q": 113,
    "x": 114,
    "zh": 115,
    "ch": 116,
    "sh": 117,
    "r": 118,
    "z": 119,
    "c": 120,
    "s": 121,
    "y": 122,
    "w": 123,
    "a": 201,
    "o": 202,
    "e": 203,
    "i": 204,
    "u": 205,
    "v": 206,
    "ai": 207,
    "ei": 208,
    "ui": 209,
    "ao": 210,
    "ou": 211,
    "iu": 212,
    "ie": 213,
    "ve": 214,
    "er": 215,
    "an": 216,
    "en": 217,
    "in": 218,
    "un": 219,
    "vn": 220,
    "ang": 221,
    "eng": 222,
    "ing": 223,
    "ong": 224,
    " ": 0,
    "'": 1
};

const reversePhonetics = Object.fromEntries(
    Object.entries(phonetics).map(([key, value]) => [value, key])
);

// 拼音分割函数
export default function segmentPinyin(pinyin: string): string[] {
    const tokenizer = new BPETokenizer(phonetics);

    const tokenIDs = tokenizer.tokenize(pinyin);

    const ans = [];

    const queue: string[] = [];
    for (const tokenID of tokenIDs) {
        if (tokenID < 100) continue;
        // 声母
        if (tokenID >= 100 && tokenID < 200) {
            if (queue.length > 0) {
                ans.push(queue.join(""));
            }
            queue.length = 0;
            queue.push(reversePhonetics[tokenID]);
        } 
        // 韵母
        else {
            // 如果队列最后一项是韵母，则push ans并清空再加入
            if (queue.length > 0 && queue[queue.length - 1] in phonetics && phonetics[queue[queue.length - 1]] >= 200) {
                ans.push(queue.join(""));
                queue.length = 0;
            }
            queue.push(reversePhonetics[tokenID]);
        }
    }
    if (queue.length > 0) {
        ans.push(queue.join(""));
    }
	return ans;
}