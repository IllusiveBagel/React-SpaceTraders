import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            components: path.resolve(__dirname, "src/components"),
            helpers: path.resolve(__dirname, "src/helpers"),
            hooks: path.resolve(__dirname, "src/hooks"),
            services: path.resolve(__dirname, "src/services"),
            assets: path.resolve(__dirname, "src/assets"),
            types: path.resolve(__dirname, "src/types"),
            pages: path.resolve(__dirname, "src/pages"),
            automation: path.resolve(__dirname, "src/automation"),
        },
    },
});
