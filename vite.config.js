import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'


// https://vitejs.dev/config/
export default defineConfig({
	base : '/',
	outDir: 'dist',
    assetsDir: '_',
	plugins: [svelte()],
	server: {
		open: true,
		host: '127.0.0.1',
		port: 5176,
	},
	build: {
		rollupOptions: {
			output: {
				entryFileNames: '_/[hash].js',
				chunkFileNames: '_/[hash].js',
				assetFileNames: '_/[hash].[ext]',
			},
		},
	}
})
