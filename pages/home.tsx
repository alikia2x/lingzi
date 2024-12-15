import Line from "components/TypingLine";
import { type TypingChar, type TypingData } from "lib/type";
import formatDuration from "lib/utils/formatDuration";
import { useEffect, useState, useRef } from "react";

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

export default function Home() {
	const [currentTypingLine, setCurrentTypingLine] = useState(0);
	const [typingStartedAt, setTypingStartedAt] = useState<null | number>(null);
	const [typingData, setTypingData] = useState<TypingData>({});
	const [wpm, setWpm] = useState(0);
	const [completed, setCompleted] = useState(false);

	// 使用 useRef 来存储 elapsed（时间已经过去的时长）和计算 WPM
	const elapsedRef = useRef(0);
	const correctCharsRef = useRef(0);

	const text = [
		"人人生而自由，在尊严和权利上一律平等。他们赋有理性和良心，并应以兄弟关系的精神",
		"相对待。人人有资格享有本宣言所载的一切权利和自由，不分种族、肤色、性别、语言、",
		"宗教、政治或其他见解、国籍或社会出身、财产、出生或其他身分等任何区别。 并且不得",
		"因一人所属的国家或领土的政治的、行政的或者国际的地位之不同而有所区别，无论该领",
		"土是独立领土、托管领土、非自治领土或者处于其他任何主权受限制的情况之下。"
	];

	useEffect(() => {
        // 只要 typingStartedAt 更新，就开始计算时间
        let interval: number | undefined;

        if (typingStartedAt && !completed) {
            interval = setInterval(() => {
                elapsedRef.current = Date.now() - typingStartedAt;
                setWpm(calculateWPM());
            }, 1000);
        }

        // 清理 interval
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [typingStartedAt, completed]);

	// 计算 WPM
	function calculateWPM() {
		const typingTimeInMinutes = elapsedRef.current / 60000;
		return Math.round(correctCharsRef.current / typingTimeInMinutes);
	}

	// 计算字符数量
	function receiveTypingData(data: TypingChar[], index: number) {
		if (completed) return; // 如果已经完成，不再更新
		// 更新 TypingData
		setTypingData((prev) => {
			const newData: TypingData = { ...prev, [index]: data };

			// 计算正确的字符数量
			let correctChars = 0;
			for (const line of Object.values(newData)) {
				if (line) {
					correctChars += line.filter((char) => char.status === "correct").length;
				}
			}
			correctCharsRef.current = correctChars; // 使用 ref 来缓存

			const lastLine = newData[(text.length - 1).toString()];
			if (lastLine && lastLine[lastLine.length - 1].status === "correct") {
				setCompleted(true);
			}

			return newData;
		});
	}

	function setTypingNextLine() {
		if (currentTypingLine < text.length - 1) {
			setCurrentTypingLine(currentTypingLine + 1);
		}
	}

	function receiveTypingEvent() {
		if (!typingStartedAt) {
			setTypingStartedAt(Date.now());
		}
	}
	if (completed) {
		return (
			<Template>
				<div className="text-5xl font-medium mb-6">完成🎉</div>
				<div className="w-full flex flex-col gap-4 justify-center text-3xl font-medium">
					<div>
						<span>用时：</span>
						<span className="text-slate-800 dark:text-slate-100">
							{formatDuration(elapsedRef.current / 1000)}
						</span>
					</div>
					<div>
						<span>速度：</span>
						<span className="text-slate-800 dark:text-slate-100">{wpm}</span>&nbsp;
						<span>WPM</span>
					</div>
					<div>
						<span>正确率：</span>
						<span className="text-slate-800 dark:text-slate-100">
							{Math.round((correctCharsRef.current / text.join("").length) * 100)}%
						</span>
					</div>
					<div>
						<span>总字数：</span>
						<span className="text-slate-800 dark:text-slate-100">{text.join("").length}</span>
						<span>字</span>
					</div>
				</div>
			</Template>
		);
	}
	return (
		<Template>
			<div className="w-full flex gap-4 opacity-50">
				<div className="w-12">
					<span className="text-xl font-bold text-slate-800 dark:text-slate-100">
						{formatDuration(elapsedRef.current / 1000)}
					</span>
				</div>
				<div className="w-12">
					<span className="text-xl font-bold text-slate-800 dark:text-slate-100">{wpm}</span>
				</div>
			</div>
			<div className="flex flex-col items-center justify-center py-6">
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
						/>
					);
				})}
			</div>
		</Template>
	);
}
