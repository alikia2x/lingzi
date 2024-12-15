export interface TypingChar {
	char: string;
	status: "composing" | "correct" | "wrong" | "untyped";
}

export type TypingLine = TypingChar[];
export interface TypingData {
    [key: string]: TypingLine;
}