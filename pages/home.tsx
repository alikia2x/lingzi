import Button from "components/button";
import { useTranslation } from "react-i18next";

export default function Home() {
	const { t } = useTranslation();
	return (
		<div className="flex flex-col items-center justify-center min-h-screen py-2">
			<h1 className="text-6xl font-bold mb-8">{t("home")}</h1>
			<Button />
		</div>
	);
}
