import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Button() {
	const [clickTimes, setClickTimes] = useState(0);
	const { t } = useTranslation();
	const handleClick = () => {
		setClickTimes(clickTimes + 1);
	};
	return (
		<button onClick={handleClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
			{t("button", { clickedTimes: clickTimes })}
		</button>
	);
}
