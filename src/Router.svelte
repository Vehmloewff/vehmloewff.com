<script>
	import Router from 'svelte-spa-router'
	import BlogPost from './routes/blog-post.svelte'

	const routes = {
		'/blog/:post': BlogPost,
	}
</script>

<Router {routes} />
