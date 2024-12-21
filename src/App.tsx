import { HashRouter, Routes, Route } from "react-router-dom";
import "i18n/init";
import Home from "pages/home.tsx";
import "i18n/init";
import { NextUIProvider } from "@nextui-org/system";
import { useTheme } from "@nextui-org/use-theme";

export default function App() {
	const { theme } = useTheme();
	return (
		<NextUIProvider className={`${theme}`}>
			<div className="w-screen h-screen">
				<HashRouter>
					<Routes>
						<Route path="/" element={<Home />} />
					</Routes>
				</HashRouter>
			</div>
		</NextUIProvider>
	);
}
