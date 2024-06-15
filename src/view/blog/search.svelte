<script lang="ts" context="module">
	import { go, StateOptions, makePath } from '../../router'

	export const stateOptions: StateOptions = {
		name: 'view.blog.search',
		route: 'search',
	}

	function dateStrToNum(dateStr: string) {
		return new Date(dateStr).getTime()
	}

	function sortPosts(posts: any[]): any {
		return posts.sort((a, b) => dateStrToNum(b.date) - dateStrToNum(a.date))
	}
</script>

<script>
	import Loader from '../../components/Loader.svelte'

	const promise = fetch('/_posts/searchIndex.json').then(res => res.json())
</script>

{#await promise}
	<div class="center-all">
		<Loader />
	</div>
{:then posts}
	<div class="posts-wrapper">
		<div class="header-row">
			<h3 style="float: left; margin: 16px 0">Blog</h3>
			<button style="float: right; margin-top: 16px" on:click={() => go({ name: 'view.blog.subscribe' })}>Subscribe</button>
		</div>

		{#each sortPosts(posts) as { title, description, id }}
			<a href={makePath({ name: 'view.blog.post', parameters: { post: id } })} class="silent">
				<div class="post">
					<div class="title">{title}</div>
					<div class="description">{description}</div>
				</div>
			</a>
		{/each}
	</div>
{:catch}
	<div class="center-all">
		<p>Could not load blog posts</p>
	</div>
{/await}

<style>
	.center-all {
		height: calc(100% - 68px);
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
		padding: 0 16px;
	}

	.posts-wrapper {
		max-width: 816px;
		margin: auto;
		padding: 8px;
	}

	.header-row {
		margin: 0 24px;
		overflow: hidden;
	}

	.post {
		padding: 16px;
		margin: 8px;
		border-radius: 4px;
		background: rgba(0, 0, 0, 0);
		transition: background 300ms;
		cursor: pointer;
	}
	.post:hover {
		background: rgba(238, 238, 238, 0.11);
	}

	.post .title {
		margin-bottom: 5px;
	}
	.post .description {
		font-size: 14px;
		opacity: 0.5;
	}
</style>
