import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import { chunkSplitPlugin } from "vite-plugin-chunk-split";
import { ViteMinifyPlugin } from "vite-plugin-minify";

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		target: "es2015"
	},
	plugins: [
		react(),
		tsconfigPaths(),
		chunkSplitPlugin({
			strategy: "single-vendor",
			// customChunk: (args) => {
			// 	// files into pages directory is export in single files
			// 	let { file } = args;
			// 	if (file.startsWith("routes/")) {
			// 		file = file.substring(7);
			// 		file = file.replace(/\.[^.$]+$/, "");
			// 		return file;
			// 	}
			// 	return null;
			// },
			customSplitting: {
				// Any file that includes `lib` in src dir will be bundled in the `utils` chunk
				lib: [/lib/]
			}
		}),
		ViteMinifyPlugin({})
	]
});
