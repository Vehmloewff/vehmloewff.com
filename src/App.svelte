<script lang="ts">
	import Router from './Router.svelte'
</script>

<style>
	.app-container {
		color: var(--foreground);
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;
		background: var(--background);
	}

	.background-pattern {
		/* background: url('https://github.githubassets.com/images/modules/site/heroes/simple-codelines.svg'); */
	}

	.scroll {
		overflow: auto;
		height: 100%;
	}
</style>

<div class="app-container">
	<div class="scroll background-pattern">
		<Router />
	</div>
</div>
