import { addStates, start } from './router'
import { getStates } from './states'

async function startApp() {
	addStates(getStates())

	await start('view.home')

	console.log(getStates())
}

startApp()
