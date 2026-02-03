import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		fs: { allow: [".."] },
		host: '0.0.0.0',
		port: 3030,
		strictPort: true,
		allowedHosts: ['mahjonh.frogrammer.pl', 'localhost'],
		hmr: false
	}
});
