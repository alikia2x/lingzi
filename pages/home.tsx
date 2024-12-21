import Line from "components/TypingLine";
import { type TypingChar, type TypingData } from "lib/type";
import formatDuration from "lib/utils/formatDuration";
import tokenize from "lib/utils/tokenizer";
import { useEffect, useState, useRef, useCallback } from "react";

function TitleBar() {
	return (
		<div className="h-32 w-full pt-6">
			<div className="text-4xl font-bold mb-2">凌字</div>
			<div className="text-lg text-neutral-800 dark:text-neutral-200">字随心入，凌如风行。</div>
		</div>
	);
}

function Template({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex justify-center h-screen dark:bg-zinc-900 dark:text-white">
			<div className="lg:w-2/3 lg:mt-4 flex flex-col gap-4">
				<TitleBar />
				{children}
			</div>
		</div>
	);
}

function FinishTyping({ elapsed, words, wpm, acc }: { elapsed: number; words: number; wpm: number; acc: number }) {
	return (
		<Template>
			<div className="text-5xl font-medium mb-6">完成🎉</div>
			<div className="w-full flex flex-col gap-4 justify-center text-3xl font-medium">
				<div>
					<span>用时：</span>
					<span className="text-slate-800 dark:text-slate-100">{formatDuration(elapsed / 1000)}</span>
				</div>
				<div>
					<span>速度：</span>
					<span className="text-slate-800 dark:text-slate-100">{wpm}</span>&nbsp;
					<span>WPM</span>
				</div>
				<div>
					<span>正确率：</span>
					<span className="text-slate-800 dark:text-slate-100">{Math.round(acc)}%</span>
				</div>
				<div>
					<span>总字数：</span>
					<span className="text-slate-800 dark:text-slate-100">{words}</span>
					<span>字</span>
				</div>
			</div>
		</Template>
	);
}

function LiveStats({
	elapsed,
	wpm,
	haveNotStarted,
	acc
}: {
	elapsed: number;
	wpm: number;
	haveNotStarted: boolean;
	acc: number;
}) {
	return (
		<div className="w-full flex gap-4 opacity-50 text-slate-800 dark:text-slate-100">
			<div className="w-12">
				<span className="text-xl font-bold">{formatDuration(elapsed / 1000)}</span>
			</div>
			<div className="w-20 font-bold">
				<span className="text-xl">{wpm}</span>
				<span className="text-sm ml-1">字/分</span>
			</div>
			<div className="w-21 font-bold">
				<span className="text-xl">{Math.round(acc)}%</span>
				<span className="text-sm ml-1">正确率</span>
			</div>
			<div className={"w-auto ml-12 duration-300 " + (haveNotStarted ? "opacity-100" : "opacity-0")}>
				<span className="text-xl font-medium">开始输入计时</span>
			</div>
		</div>
	);
}

function splitLines(maxWidth: number, tokens: string[]): string[] {
	const testElement = document.createElement("div");
	testElement.style.position = "absolute";
	testElement.style.visibility = "hidden";
	testElement.style.fontSize = "1.875rem";
	document.body.appendChild(testElement);
	const resultLines = [];
	let currentLine = "";
	tokens.push(" ");
	for (let i = 0; i < tokens.length - 1; i++) {
		const token = tokens[i];
		const nextToken = tokens[i + 1];
		// add a token to the test element
		testElement.innerText = currentLine + token;
		const beforeWidth = testElement.clientWidth;
		// measure the width of the test element
		testElement.innerText = currentLine + token + nextToken;
		const afterWidth = testElement.clientWidth;
		const shouldBreak = beforeWidth < maxWidth && maxWidth < afterWidth;
		testElement.innerText = currentLine + token;
		// if the width exceeds the max width, add the current line to resultLines
		if (shouldBreak) {
			resultLines.push(currentLine.trim()); // 将当前行添加到结果中
			currentLine = token; // 开始新的一行
		} else {
			currentLine += token; // 继续添加到当前行
		}
	}

	// 添加最后一行（如果有的话）
	if (currentLine) {
		resultLines.push(currentLine.trim());
	}

	document.body.removeChild(testElement);
	return resultLines;
}

export default function Home() {
	const [currentTypingLine, setCurrentTypingLine] = useState(0);
	const [typingStartedAt, setTypingStartedAt] = useState<null | number>(null);
	const [typingData, setTypingData] = useState<TypingData>({});
	const [wpm, setWpm] = useState(0);
	const [accuracy, setAccuracy] = useState(0);
	const [completed, setCompleted] = useState(false);
	const [text, setTypingTextLines] = useState<string[]>([]);
	const linesContainer = useRef<HTMLDivElement>(null);
	const [rawText, setRawText] = useState("");
	const [inputText, setInputText] = useState("");
	const [maxTime, setMaxTime] = useState(60);
	type IDK = React.ElementRef<typeof Line>;
	const childRefs = useRef<IDK[]>([]);
	const tokens = useRef(tokenize(rawText));

	useEffect(() => {
		if (import.meta.env.MODE !== "development") {
			document.addEventListener("paste", (e) => {
				e.preventDefault();
			});
		}
	}, []);

	useEffect(() => {
		if (!linesContainer.current) return;
		const maxWidth = linesContainer.current.clientWidth - 16;
		tokens.current = tokenize(rawText);
		const lines = splitLines(maxWidth, tokens.current);
		setTypingTextLines(lines);
	}, [rawText]);

	// 使用 useRef 来存储 elapsed（时间已经过去的时长）和计算 WPM
	const elapsedRef = useRef(0);
	const correctCharsRef = useRef(0);
	const typedChars = useRef(0);

	useEffect(() => {
		// 只要 typingStartedAt 更新，就开始计算时间
		let interval: number | undefined;

		if (typingStartedAt && !completed) {
			interval = setInterval(() => {
				elapsedRef.current = Date.now() - typingStartedAt;
				if (elapsedRef.current / 1000 >= maxTime) {
					setCompleted(true);
				}
				setWpm(calculateWPM());
				setAccuracy(calculateAcc());
			}, 1000);
		}

		// 清理 interval
		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [typingStartedAt, completed, text, maxTime]);

	// 计算 WPM
	function calculateWPM() {
		const typingTimeInMinutes = elapsedRef.current / 60000;
		return Math.round(correctCharsRef.current / typingTimeInMinutes);
	}

	function calculateAcc() {
		const acc = (correctCharsRef.current / typedChars.current) * 100;
		return isNaN(acc) ? 0 : acc;
	}

	// 计算字符数量
	const receiveTypingData = useCallback(
		(data: TypingChar[], index: number) => {
			if (completed) return; // 如果已经完成，不再更新
			// 更新 TypingData
			setTypingData((prev) => {
				const newData: TypingData = { ...prev, [index]: data };
				const flattnedData = Object.values(newData).flat();

				// 计算正确的词数量
				let correctChars = 0;
				let totalInputedChars = 0;
				let i = 0;
				for (const token of tokens.current) {
					if (token.trim() == "") continue;
					const tokenChars = token.split("");
					let correct = true;
					let completed = true;
					for (const char of tokenChars) {
						if (flattnedData[i]?.status !== "correct") {
							correct = false;
						}
						if (flattnedData[i]?.status === "untyped") {
							completed = false;
						}
						if (flattnedData[i]?.status === "composing") {
							completed = false;
						}
						i++;
					}
					if (correct) {
						correctChars += 1;
					}
					if (completed) {
						totalInputedChars += 1;
					}
				}

				correctCharsRef.current = correctChars; // 使用 ref 来缓存
				typedChars.current = totalInputedChars;

				const lastLine = newData[(text.length - 1).toString()];
				if (lastLine && lastLine[lastLine.length - 1].status === "correct") {
					setCompleted(true);
				}

				return newData;
			});
		},
		[completed, text.length]
	);

	function setTypingNextLine(overflowText: string) {
		if (currentTypingLine < text.length - 1) {
			setCurrentTypingLine(currentTypingLine + 1);
			if (overflowText) childRefs.current[currentTypingLine + 1].receiveOverflow(overflowText);
		}
	}

	function receiveTypingEvent() {
		if (!typingStartedAt) {
			setTypingStartedAt(Date.now());
		}
	}
	if (completed) {
		return <FinishTyping elapsed={elapsedRef.current} words={typedChars.current} wpm={wpm} acc={accuracy} />;
	}
	if (rawText === "") {
		return (
			<Template>
				<div className="flex flex-col gap-6 justify-center">
					<textarea
						className="w-full h-96 max-h-[calc(100vh-20rem)] min-h-16 p-4 text-lg dark:bg-zinc-800 dark:text-white 
						rounded-md outline-none resize-none"
						placeholder="输入你要练习的文字"
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
					></textarea>
					
					<button
						className="w-24 h-10 bg-blue-500 text-white rounded-md"
						onClick={() => setRawText(inputText)}
					>
						开始练习
					</button>
				</div>
			</Template>
		);
	}
	return (
		<Template>
			<LiveStats elapsed={elapsedRef.current} wpm={wpm} acc={accuracy} haveNotStarted={typingStartedAt == null} />
			<div className="flex flex-col items-center justify-center py-6" ref={linesContainer}>
				{text.map((item, index) => {
					return (
						<Line
							key={index}
							text={item}
							isTyping={index === currentTypingLine}
							setTypingNextLine={setTypingNextLine}
							setTypingData={receiveTypingData}
							index={index}
							typingChars={typingData[index.toString()] || []}
							typingEvent={receiveTypingEvent}
							ref={(el) => (childRefs.current[index] = el!)}
						/>
					);
				})}
			</div>
		</Template>
	);
}
