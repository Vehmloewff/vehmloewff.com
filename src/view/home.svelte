<script context="module" lang="ts">
	import { go, StateOptions, makePath } from '../router'

	export const stateOptions: StateOptions = {
		name: 'view.home',
		route: 'home',
	}
</script>

<script lang="ts">
	import { createParticlesOnCanvas } from 'decentralized-particles'
	import { onMount } from 'svelte'

	let canvas: HTMLCanvasElement

	onMount(() => {
		createParticlesOnCanvas(
			canvas,
			{ nextFrameCaller: fn => requestAnimationFrame(fn), particlesCount: { min: 150, max: 200 } },
			{ keepAround: true },
			{ stroke: '#888', width: { min: 0.5, max: 0.5 } }
		)
	})
</script>

<style>
	.animation {
		height: calc(100% - 68px);
		position: relative;
	}

	canvas {
		position: absolute;
		top: 0;
		width: 100%;
		height: 100%;
		left: 0;
		z-index: -1;
		filter: blur(3px);
	}

	.center-all {
		display: flex;
		height: 100%;
		justify-content: center;
		align-items: center;
		text-align: center;
		padding: 0 16px;
	}
</style>

<div class="animation">
	<canvas bind:this={canvas} />
	<div class="center-all">
		<div>
			<h1>Hello there!</h1>
			<p>I'm a developer, efficiency enthusiast, and a history lover.</p>
			<p>I'm Vehmloewff.</p>

			<a class="silent" href={makePath({ name: 'view.blog' })} style="float: left"><button>Blog</button></a>
			<a class="silent" href={makePath({ name: 'view.contact' })} style="float: right"><button>Contact</button></a>
		</div>
	</div>
</div>
