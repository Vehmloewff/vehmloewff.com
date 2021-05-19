<script lang="ts" context="module">
	import type { StateOptions } from '../router'

	export const stateOptions: StateOptions = {
		name: 'view.contact',
		route: 'contact',
	}
</script>

<script>
	let sending = false
</script>

<div class="center-all">
	<div>
		{#if !sending}
			<h3>Need to get it touch?</h3>
			<p>
				No problem. You can hit me up on
				<a href="https://discord.gg/D3pUzrbj32">Discord</a>, or send me an
				<a href="mailto:vehmloewff@gmail.com" on:click={() => setTimeout(() => (sending = true), 1000)}>email</a>.
			</p>
		{:else}
			<h3>Your email app didn't open?</h3>
			<p>That's ok. We can do it this way.</p>
			<code style="user-select: all">vehmloewff@gmail.com</code>
		{/if}
	</div>
</div>

<style>
	.center-all {
		display: flex;
		height: calc(100% - 68px);
		justify-content: center;
		align-items: center;
		text-align: center;
		padding: 0 16px;
	}
</style>
