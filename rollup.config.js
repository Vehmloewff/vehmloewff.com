import svelte from 'rollup-plugin-svelte'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import sveltePreprocess from 'svelte-preprocess'
import typescript from '@rollup/plugin-typescript'
import fs from 'fs'
import frontMatter from 'front-matter'
import MarkdownIt from 'markdown-it'
import highlightJS from 'highlight.js'
import write from 'write'

const production = !process.env.ROLLUP_WATCH

function serve() {
	let server

	function toExit() {
		if (server) server.kill(0)
	}

	return {
		writeBundle() {
			if (server) return
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true,
			})

			process.on('SIGTERM', toExit)
			process.on('exit', toExit)
		},
	}
}

function compileMarkdown() {
	return {
		buildStart() {
			fs.readdirSync('content').forEach(file => {
				this.addWatchFile(`content/${file}`)
			})
		},
		writeBundle() {
			fs.readdirSync('content').forEach(file => {
				const id = file.slice(0, -3)
				const markdownFile = `content/${file}`
				const markdown = fs.readFileSync(markdownFile, 'utf-8')
				const frontMatterData = frontMatter(markdown)
				const { title, description, date } = frontMatterData.attributes
				const frontMatterLessMd = frontMatterData.body
				const html = new MarkdownIt({
					highlight: function (str, lang) {
						if (lang && highlightJS.getLanguage(lang)) {
							try {
								return highlightJS.highlight(lang, str).value
							} catch (_) {}
						}

						return '' // use external default escaping
					},
				}).render(frontMatterLessMd)

				write(`public/_posts/${id}.json`, JSON.stringify({ html, title, description, date }))
			})
		},
	}
}

export default {
	input: 'src/main.ts',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js',
	},
	plugins: [
		svelte({
			css: css => css.write('bundle.css'),
			preprocess: sveltePreprocess(),
		}),
		resolve({
			browser: true,
			dedupe: ['svelte'],
		}),
		commonjs(),
		typescript({
			sourceMap: !production,
			inlineSources: !production,
		}),
		!production && serve(),
		!production && livereload('public'),
		production && terser(),
		compileMarkdown(),
	],
	watch: {
		// include: ['src/**/*', 'content/*.md'],
		clearScreen: false,
	},
}
