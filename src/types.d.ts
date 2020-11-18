declare module 'abstract-state-router' {
	import EventEmitter from 'eventemitter3'

	export interface Renderer<TemplateInputType, ElementType, TemplateType> {
		render(
			context: {
				template: TemplateInputType
				element: ElementType
				content: any
				parameters: Parameter
			},
			callback: (err: any, output: TemplateType) => void
		): void
		reset(
			context: {
				domApi: TemplateType
				content: any
				template: TemplateInputType
				parameters: Parameter
			},
			callback: (err: any, output?: TemplateType) => void
		): void
		destroy(domApi: TemplateType, callback: () => void): void
		getChildElement(domApi: TemplateType, cb: (err: any, element: ElementType) => void): void
	}

	export interface State {
		name: string
		parameters?: Parameter
	}

	export interface RouterOptions {
		pathPrefix?: string
		router?: any // FIXME
		throwOnError?: boolean
	}

	export interface StateResolveCallback<ContentType> {
		(err: any, content?: ContentType): void
		redirect(stateName: string, parameters?: Parameter): void
	}

	export interface StateOption<TemplateInputType, TemplateType, DataType, ContentType> {
		name: string
		template: TemplateInputType
		route?: string
		defaultChild?: string | (() => string)
		data?: DataType
		querystringParameters?: string[]
		defaultParameters?: Parameter
		defaultQuerystringParameters?: Parameter

		resolve?(
			data: DataType,
			parameters: Parameter,
			callback: StateResolveCallback<ContentType>
		): void | Promise<never> | ContentType | Promise<ContentType>
		activate?(context: { domApi: TemplateType; data: DataType; parameters: Parameter; content: ContentType }): void
	}

	export interface GoOption {
		replace?: boolean
		inherit?: boolean
	}

	type RouterEvents<TemplateType> = {
		stateChangeAttempt: [Function]
		stateChangeStart: [State, Parameter, State[]]
		stateChangeCancelled: [any]
		stateChangeEnd: [State, Parameter, State[]]
		stateChangeError: [any]
		stateError: [any]
		routeNotFound: [string, Parameter]

		beforeCreateState: [{ state: State; content: any; parameters: Parameter }]
		afterCreateState: [{ state: State; domApi: TemplateType; content: any; parameters: Parameter }]
		beforeResetState: [{ state: State; domApi: TemplateType; content: any; parameters: Parameter }]
		afterResetState: [{ state: State; domApi: TemplateType; content: any; parameters: Parameter }]
		beforeDestroyState: [{ state: State; domApi: TemplateType }]
		afterDestroyState: [{ state: State }]
	}

	export interface Router<TemplateInputType, TemplateType> extends EventEmitter<RouterEvents<TemplateType>> {
		addState<DataType, ContentType>(stateOption: StateOption<TemplateInputType, TemplateType, DataType, ContentType>): void
		go(stateName?: string | null, stateParameters?: Parameter, options?: GoOption): void
		evaluateCurrentRoute(fallbackStateName: string, fallbackStateParameters?: Parameter): Promise<void>
		stateIsActive(stateName: string, stateParameters?: Parameter): boolean
		makePath(
			stateName?: string,
			stateParameters?: Parameter,
			options?: {
				inherit?: boolean
			}
		): string
		getActiveState(): State
	}
	export default function createStateRouter<TemplateInputType, ElementType, TemplateType>(
		makeRenderer: Renderer<TemplateInputType, ElementType, TemplateType>,
		rootElement: ElementType,
		options?: RouterOptions
	): Router<TemplateInputType, TemplateType>
}

declare module 'svelte-state-renderer' {
	import { Renderer, Parameter, Router } from 'abstract-state-router'
	import Component from 'dummy.svelte'

	export interface Parameters {
		target?: HTMLElement
		anchor?: HTMLElement | null
		props?: {}
		methods?: {}
	}

	type ComponentClass = typeof Component

	export type InputType =
		| ComponentClass['constructor']
		| {
				component: ComponentClass['constructor']
				options: Parameter
		  }

	export type SvelteRouter = Router<InputType, ComponentClass>

	export default function makeSvelteStateRenderer(params?: Parameters): Renderer<InputType, HTMLElement, ComponentClass>
}

declare module 'hash-brown-router'
declare module 'sausage-router'
declare module '@routes' {
	import { StateOption } from 'abstract-state-router'
	import Component from 'dummy.svelte'

	const routes: { stateOptions: StateOptions; default: Component }[]

	export default routes
}
