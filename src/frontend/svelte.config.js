import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			fallback: 'index.html',
		}),
		typescript: {
			config: (cfg) => {
				cfg.include.push("../common/**/*.ts");
				return cfg;
			},
		},
		alias: {
			"@common": "../common",
			$assets: "static/assets"
		},
	}
};

export default config;
