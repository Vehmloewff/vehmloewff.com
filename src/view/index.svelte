<script context="module" lang="ts">
	import Footer from '../components/Footer.svelte'
	import Navbar from '../components/Navbar.svelte'

	import type { StateOptions } from '../router'

	export const stateOptions: StateOptions = {
		name: 'view',
		defaultChild: 'home',
	}
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

	.scroll {
		overflow: auto;
		height: 100%;
	}
</style>

<div class="app-container">
	<div class="scroll background-pattern">
		<Navbar />

		<uiView />

		<Footer />
	</div>
</div>
