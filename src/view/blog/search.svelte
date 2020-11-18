<script lang="ts" context="module">
	import { go, StateOptions } from '../../router'

	export const stateOptions: StateOptions = {
		name: 'view.blog.search',
		route: 'search',
	}
</script>

<style>
	.center-all {
		height: calc(100% - 68px);
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
	}
</style>

<div class="center-all">
	<div>
		<h3>Everything takes time.</h3>
		<p>Including the development of a search system for a blog.</p>
		<p>But until it's done, the best way to get the latest blog posts is to subscribe.</p>
		<button on:click={() => go({ name: 'view.blog.subscribe' })}>Subscribe</button>
	</div>
</div>
