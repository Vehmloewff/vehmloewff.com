<script context="module" lang="ts">
	import type { StateOptions } from '../../router'

	export const stateOptions: StateOptions = {
		name: 'view.blog.post',
		route: 'post/:post',
		async resolve(_, { post }) {
			return { post }
		},
	}
</script>

<script lang="ts">
	import Loader from '../../components/Loader.svelte'

	export let post: string

	$: promise = fetch(`/_posts/${post}.json`).then(res => res.json())
</script>

{#await promise}
	<div class="center-all">
		<Loader />
	</div>
{:then { title, description, html, date }}
	<div class="post">
		<h1>{title}</h1>
		<p class="description">{description}</p>
		<div class="info">
			<div class="date">{date}</div>
		</div>
		{@html html}
	</div>
{:catch error}
	<div class="center-all">Could not find that blog post.</div>
{/await}

<style>
	:global(.hljs) {
		display: block;
		overflow-x: auto;
		padding: 0.5em;
		color: #abb2bf;
		background: #282c34;
	}

	:global(.hljs-comment),
	:global(.hljs-quote) {
		color: #5c6370;
		font-style: italic;
	}

	:global(.hljs-doctag),
	:global(.hljs-keyword),
	:global(.hljs-formula) {
		color: #c678dd;
	}

	:global(.hljs-section),
	:global(.hljs-name),
	:global(.hljs-selector)-tag,
	:global(.hljs-deletion),
	:global(.hljs-subst) {
		color: #e06c75;
	}

	:global(.hljs-literal) {
		color: #56b6c2;
	}

	:global(.hljs-string),
	:global(.hljs-regexp),
	:global(.hljs-addition),
	:global(.hljs-attribute),
	:global(.hljs-meta)-string {
		color: #98c379;
	}

	:global(.hljs-built_in),
	:global(.hljs-class) :global(.hljs-title) {
		color: #e6c07b;
	}

	:global(.hljs-attr),
	:global(.hljs-variable),
	:global(.hljs-template)-variable,
	:global(.hljs-type),
	:global(.hljs-selector)-class,
	:global(.hljs-selector)-attr,
	:global(.hljs-selector)-pseudo,
	:global(.hljs-number) {
		color: #d19a66;
	}

	:global(.hljs-symbol),
	:global(.hljs-bullet),
	:global(.hljs-link),
	:global(.hljs-meta),
	:global(.hljs-selector)-id,
	:global(.hljs-title) {
		color: #61aeee;
	}

	:global(.hljs-emphasis) {
		font-style: italic;
	}

	:global(.hljs-strong) {
		font-weight: bold;
	}

	:global(.hljs-link) {
		text-decoration: underline;
	}

	.post {
		max-width: 768px;
		margin: auto;
		padding: 16px;
		padding-bottom: 200px;
	}

	.description {
		opacity: 0.8;
		font-size: 18px;
	}

	.info {
		border-top: 2px solid var(--primary);
		overflow: hidden;
		font-size: 14px;
		opacity: 0.5;
		margin-bottom: 40px;
	}
	.date {
		padding: 16px 0;
	}

	.post :global(blockquote) {
		margin-left: 0;
		margin-right: 0;
		padding: 8px 16px;
		border-radius: 0 4px 4px 0;
		border-left: 4px solid rgba(255, 255, 255, 0.5);
		background: rgba(255, 255, 255, 0.1);
	}

	.center-all {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
	}

	.post :global(img) {
		width: 100%;
		border-radius: 4px;
	}
</style>
