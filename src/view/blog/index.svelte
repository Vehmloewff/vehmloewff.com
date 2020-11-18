<script context="module" lang="ts">
	import type { StateOptions } from '../../router'

	export const stateOptions: StateOptions = {
		name: 'view.blog',
		route: 'blog',
		defaultChild: 'search',
		async resolve() {
			console.log('made it to `view.blog`')
			return {}
		},
	}
</script>

<uiView />
