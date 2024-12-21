import { type TypingChar, type TypingLine } from "lib/type";
import segementPinyin from "lib/utils/segmentPinyin";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

function splitComposedPinyin(str: string) {
	if (str.includes(" ")) {
		return str.split(" ");
	} else if (str.includes("'")) {
		return str.split("'");
	} else {
		return segementPinyin(str);
	}
}

interface LineProps {
	text: string;
	isTyping: boolean;
	index: number;
	setTypingNextLine: (overflowText: string) => void;
	setTypingData: (data: TypingLine, index: number) => void;
	typingChars: TypingLine;
	typingEvent: () => void;
	top: number;
}

const Line = forwardRef(
	(
		{ text, isTyping, index, setTypingNextLine, setTypingData, typingChars, typingEvent, top }: LineProps,
		ref: React.Ref<{ receiveOverflow: (text: string) => void; getContainer: () => HTMLDivElement | null }>
	) => {
		const [typedString, setTypeString] = useState("");
		const [composingString, setComposingString] = useState("");
		const [composingStartString, setComposingStart] = useState("");
		const [inputWithoutComposing, setInputWithoutComposing] = useState("");
		const [fullLength, setFullLength] = useState(0);
		const [composing, setComposing] = useState(false);
		const containerRef = useRef<HTMLDivElement>(null);

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

		function getContainer() {
			return containerRef.current;
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
				// get the overflow text
				const overflowText = typedString.slice(text.length);
				setTypingNextLine(overflowText);
			}
		}, [composing, fullLength, isTyping, setTypingNextLine, text, typedString, typingChars]);

		useEffect(() => {
			const chrCountFromPinyin = splitComposedPinyin(composingString).length;
			setFullLength(inputWithoutComposing.length + chrCountFromPinyin);
		}, [composingString, inputWithoutComposing]);

		useEffect(() => {
			const tokenized = text.split("");
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
		}, [text, inputWithoutComposing, fullLength, setTypingData, index]);

		function receiveOverflow(text: string) {
			setTypeString(text);
			setInputWithoutComposing(text);
			setComposingString("");
			setFullLength(text.length);
		}

		useImperativeHandle(ref, () => ({
			receiveOverflow,
			getContainer
		}));

		return (
			<div
				className={
					"absolute w-full p-4 duration-500 transition-transform rounded-lg text-3xl origin-top " +
					(isTyping ? "h-32" : "h-16")
				}
				style={{ transform: `translateY(${top}px)` }}
				ref={containerRef}
			>
				<ColoredChars typingChars={typingChars} />
				{isTyping && (
					<input
						autoComplete="off"
						onInput={handleInput}
						onCompositionEnd={handleCompositionEnd}
						onCompositionStart={handleCompositionStart}
						onCompositionUpdate={() => typingEvent}
						value={typedString}
						className="outline-none w-full h-16 bg-transparent"
						autoFocus={true}
					/>
				)}
			</div>
		);
	}
);

function getSpaceWidth() {
	const span = document.createElement("span");
	span.style.visibility = "hidden";
	span.style.position = "absolute";
	span.style.whiteSpace = "pre";
	span.style.fontSize = "1.875rem";
	span.innerText = " ";
	document.body.appendChild(span);
	const width = span.offsetWidth;
	document.body.removeChild(span);
	return width;
}

function ColoredChars({ typingChars }: { typingChars: TypingChar[] }) {
	return (
		<div>
			{typingChars.map((char, index) => {
				const shouldDisplaySpace = char.char == " " && char.status == "wrong";
				if (shouldDisplaySpace) {
					char.char = "␣";
				}
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
					if (char.char == "␣") {
						return (
							<span
								key={index}
								className="bg-red-500 h-6 inline-block mx-[2px]"
								style={{ width: getSpaceWidth() - 4 }}
							></span>
						);
					}
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
	);
}

export default Line;
