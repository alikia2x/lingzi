import { HashRouter, Routes, Route } from "react-router-dom";
import "i18n/init";
import Home from "pages/home.tsx";
import "i18n/init";

export default function App() {
	return (
		<div className="w-screen h-screen">
			<HashRouter>
				<Routes>
					<Route path="/" element={<Home />} />
				</Routes>
			</HashRouter>
		</div>
	);
}
