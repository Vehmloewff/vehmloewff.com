import makeStateRouter, { State, StateOption } from 'abstract-state-router'
import makeSvelteStateRenderer from 'svelte-state-renderer'
import makeHashBrownRouter from 'hash-brown-router'
import sausageRouter from 'sausage-router'
import { readable } from 'svelte/store'

const stateRouter = makeStateRouter(makeSvelteStateRenderer(), document.body, {
	pathPrefix: '',
	router: makeHashBrownRouter(sausageRouter()),
	throwOnError: true,
})

stateRouter.on('routeNotFound', (state, params) => {
	console.log('Route not found')
})

stateRouter.on('stateChangeError', console.error)
stateRouter.on('stateError', console.error)
stateRouter.on('stateChangeStart', console.log)
stateRouter.on('stateChangeAttempt', console.log)

export function addStates(states: StateOption<any, any, any, any>[]) {
	states.forEach(state => stateRouter.addState(state))
}

export async function start(defaultState: string) {
	await stateRouter.evaluateCurrentRoute(defaultState)
}

export function go(state: State) {
	stateRouter.go(state.name, state.parameters)
}

export function makePath(state: State) {
	return stateRouter.makePath(state.name, state.parameters)
}

export { stateRouter }

export type StateOptions = Omit<StateOption<unknown, unknown, unknown, unknown>, 'template'>

export const activeState = readable(stateRouter.getActiveState(), set => {
	stateRouter.on('stateChangeEnd', state => set(state))
})

export const activeStateSegments = readable<string[]>([], set => {
	activeState.subscribe(({ name }) => set(name.split('.')))
})
