<script lang="ts">
	import { stateRouter, makePath, activeState, activeStateSegments, go } from '../router'

	const links = [
		{
			name: 'Blog',
			state: { name: 'view.blog' },
		},
		{
			name: 'Contact',
			state: { name: 'view.contact' },
		},
	]
</script>

<div class="substance-pad" />

<nav>
	<div class="navigation">
		<div class="left">
			<img src="/favicon.png" alt="Favicon" on:click={() => go({ name: 'view' })} />
			<div class="title">Vehmloewff.com</div>
		</div>
		<div class="right">
			{#each links as link}
				<a
					class="link"
					href={makePath(link.state)}
					class:active={$activeState.name.startsWith(link.state.name)}
					on:click={e => {
						e.preventDefault()
						go(link.state)
					}}>{link.name}</a
				>
			{/each}
		</div>
	</div>
</nav>

<style>
	.substance-pad {
		height: 68px;
	}

	nav {
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		background: var(--background-harsh);
		border-bottom: 2px solid var(--separators);
	}

	.navigation {
		height: 66px;
		overflow: hidden;
		margin: auto;
		max-width: 800px;
	}
	.left {
		float: left;
		padding: 8px 16px;
	}
	img {
		height: 50px;
		margin-right: 8px;
		border-radius: 50%;
		user-select: none;
	}
	img:hover {
		border: 1px solid var(--primary);
		cursor: pointer;
		height: 48px;
	}
	.title {
		font-size: 20px;
		display: inline-block;
		position: relative;
		bottom: 18px;
	}

	.right {
		float: right;
		padding-right: 8px;
	}

	.link {
		margin: 0 8px;
		margin-top: 23px;
		font-size: 18px;
	}
</style>
