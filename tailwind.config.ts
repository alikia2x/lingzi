import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/theme";

const config: Config = {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
		"./node_modules/@nextui-org/theme/dist/components/(tab|tabs).js"
	],
	theme: {
		extend: {
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))"
			}
		}
	},
	plugins: [nextui()]
};
export default config;
