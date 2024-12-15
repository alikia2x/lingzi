import * as en_US from "i18n/en_US.json";
import * as zh_Hans from "i18n/zh_Hans.json";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ICU from "i18next-icu";
// passes i18n down to react-i18next
i18n.use(initReactI18next)
	.use(LanguageDetector)
	.use(ICU)
	.init({
		resources: {
			"en-US": {
				translation: en_US
			},
			"zh-CN": {
				translation: zh_Hans
			}
		},
		fallbackLng: "en-US",

		interpolation: {
			// react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
			escapeValue: false
		},

		detection: {
			order: ["localStorage", "navigator"],
			caches: []
		}
	});

const setLanguage = (targetLng: "en_US" | "zh_Hans" | "zh_Hant" | "ja" | "es" | "fr") => {
	localStorage.setItem("i18nextLng", targetLng);
};

const clearLanguage = () => {
	localStorage.removeItem("i18nextLng");
};

export default { setLanguage, clearLanguage };
