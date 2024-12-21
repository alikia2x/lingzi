export default function tokenize(input: string): string[] {
	const tokens: string[] = [];
	// 匹配汉字、英文单词、数字、标点符号、空格和其他字符
	const regex = /[\u4e00-\u9fa5]|[a-zA-Z0-9]+|[^\s\w]|\s+/g;

	let match: RegExpExecArray | null;
	while ((match = regex.exec(input)) !== null) {
		tokens.push(match[0]);
	}

	return tokens;
}
