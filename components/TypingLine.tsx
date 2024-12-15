import { type TypingChar, type TypingLine } from "lib/type";
import segementPinyin from "lib/utils/segmentPinyin";
import { useEffect, useState } from "react";

export default function Line({
	text,
	isTyping,
	index,
	setTypingNextLine,
	setTypingData,
	typingChars,
	typingEvent
}: {
	text: string;
	isTyping: boolean;
	index: number;
	setTypingNextLine: () => void;
	setTypingData: (data: TypingLine, index: number) => void;
	typingChars: TypingLine;
	typingEvent: () => void;
}) {
	const [typedString, setTypeString] = useState("");
	const [composingString, setComposingString] = useState("");
	const [composingStartString, setComposingStart] = useState("");
	const [inputWithoutComposing, setInputWithoutComposing] = useState("");
	const [fullLength, setFullLength] = useState(0);
	const [composing, setComposing] = useState(false);

	function handleInput(e: React.FormEvent<HTMLInputElement>) {
		setTypeString(e.currentTarget.value);
		if (!composing) {
			setInputWithoutComposing(e.currentTarget.value);
		}
		typingEvent();
	}

	function handleCompositionStart() {
		setComposing(true);
		setComposingStart(typedString);
		typingEvent();
	}

	function handleCompositionEnd() {
		setComposing(false);
		setComposingString("");
		setInputWithoutComposing(typedString);
		typingEvent();
	}

	useEffect(() => {
		if (composing) {
			setComposingString(typedString.slice(composingStartString.length));
		}
	}, [composing, composingStartString, typedString]);

	useEffect(() => {
		if (
			!composing &&
			fullLength >= text.length &&
			isTyping &&
			typingChars[typingChars.length - 1].status == "correct"
		) {
			setTypingNextLine();
		}
	}, [composing, fullLength, isTyping, setTypingNextLine, text, typingChars]);

	function tokenize(str: string) {
		return str.split("");
	}

	function splitComposedPinyin(str: string) {
		if (str.includes(" ")) {
			return str.split(" ");
		} else if (str.includes("'")) {
			return str.split("'");
		} else {
			return segementPinyin(str);
		}
	}

	useEffect(() => {
		const chrCountFromPinyin = splitComposedPinyin(composingString).length;
		setFullLength(inputWithoutComposing.length + chrCountFromPinyin);
	}, [composingString, inputWithoutComposing]);

	useEffect(() => {
		const tokenized = tokenize(text);
		const temp: TypingChar[] = tokenized.map((char, index) => {
			if (index < inputWithoutComposing.length) {
				if (inputWithoutComposing[index] == char) {
					return { char, status: "correct" };
				} else {
					return { char, status: "wrong" };
				}
			} else if (index < fullLength) {
				return { char, status: "composing" };
			} else {
				return { char, status: "untyped" };
			}
		});
		setTypingData(temp, index);
	}, [text, inputWithoutComposing, fullLength]);

	return (
		<div
			className={
				"w-full p-4 duration-500 rounded-lg text-3xl " + (isTyping ? "h-32 bg-zinc-800" : "h-16 bg-zinc-900")
			}
		>
			<div>
				{typingChars.map((char, index) => {
					if (char.status == "composing") {
						return (
							<span key={index} className="text-yellow-600">
								{char.char}
							</span>
						);
					} else if (char.status == "correct") {
						return (
							<span key={index} className="text-green-500">
								{char.char}
							</span>
						);
					} else if (char.status == "wrong") {
						return (
							<span key={index} className="text-red-500">
								{char.char}
							</span>
						);
					} else {
						return <span key={index}>{char.char}</span>;
					}
				})}
			</div>
			{isTyping && (
				<input
					autoComplete="off"
					onInput={handleInput}
					onCompositionEnd={handleCompositionEnd}
					onCompositionStart={handleCompositionStart}
					onCompositionUpdate={() => typingEvent}
					value={typedString}
					className="outline-none w-full h-16 dark:bg-zinc-800"
					autoFocus={true}
				/>
			)}
		</div>
	);
}
