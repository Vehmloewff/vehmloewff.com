<script context="module" lang="ts">
	import { go, StateOptions } from '../router'

	export const stateOptions: StateOptions = {
		name: 'view.home',
		route: 'home',
	}
</script>

<style>
	.center-all {
		display: flex;
		height: calc(100% - 68px);
		justify-content: center;
		align-items: center;
		text-align: center;
	}
</style>

<div class="center-all">
	<div>
		<h1>Hello there!</h1>
		<p>I'm a developer, efficiency enthusiast, and a history nerd.</p>
		<button style="float: left" on:click={() => go({ name: 'view.blog' })}>Blog</button>
		<!-- <button on:click={() => go({ name: 'view.blog'})}>Blog</button> -->
	</div>
</div>
