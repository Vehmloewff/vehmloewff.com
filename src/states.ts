import routes from '@routes'

export function getStates() {
	return routes
		.map(module => ({ ...module.stateOptions, template: module.default }))
		.sort((a, b) => a.name.split('.').length - b.name.split('.').length)
}
