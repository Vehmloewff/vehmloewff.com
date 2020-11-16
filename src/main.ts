import App from './App.svelte'

if (location.pathname !== '/') {
	location.hash = location.pathname
	location.pathname = '/'
}

new App({ target: document.body })
