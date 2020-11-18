<script context="module" lang="ts">
	import { StateOptions, go, makePath } from '../../router'

	export const stateOptions: StateOptions = {
		name: 'view.blog.subscribe',
		route: 'subscribe',
	}
</script>

<script lang="ts">
	import Loader from '../../components/Loader.svelte'
	import kvdb from 'kvdb.io'

	let status: 'waiting' | 'saving' | 'failed' | 'saved' = 'waiting'
	let email: string = ``

	const bucket = kvdb.bucket('QiecJUgvkU6f2NEitgefNS')

	async function submit(e: any) {
		e.preventDefault()

		status = 'saving'

		try {
			await bucket.set(`blog-subscriptions:${email}`, Date.now())
			status = 'saved'
		} catch (e) {
			status = 'failed'
			console.error(e)
		}
	}
</script>

<style>
	.center-all {
		height: calc(100% - 68px);
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
		padding: 0 16px;
	}

	input {
		margin-right: 8px;
		width: calc(100% - 28px);
		color: inherit;
	}
</style>

<div class="center-all">
	{#if status === 'waiting'}
		<div style="max-width: 500px">
			<h3>Subscribe</h3>
			<p>You'll recieve an email whenever a new blog post is published here.</p>
			<form style="max-width: 400px; margin: auto" on:submit={submit}>
				<div style="display: flex">
					<div style="flex-grow: 1"><input bind:value={email} type="email" placeholder="johndoe@example.com" /></div>
					<button data-primary>Subscribe</button>
				</div>
			</form>
		</div>
	{:else if status === 'saving'}
		<div>
			<div style="display: inline-block; margin: auto">
				<Loader />
			</div>
			<p>Saving...</p>
		</div>
	{:else if status === 'saved'}
		<div>
			<h3>Thank you!</h3>
			<p>As soon as I publish another blog post, you'll be emailed.</p>
			<button on:click={() => go({ name: 'view.blog' })}>Back to blog</button>
		</div>
	{:else}
		<div>
			<h3>Oh oh</h3>
			<p>We could not save your email. Check you internet connection and try again.</p>
			<p>
				If the problem persists, please
				<a href={makePath({ name: 'view.contact' })} on:click={() => go({ name: 'view.contact' })}>contact me</a>.
			</p>
		</div>
	{/if}
</div>
