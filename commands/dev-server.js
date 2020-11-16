import express from 'express'
import { resolve } from 'path'
import chalk from 'chalk'

const app = express()
const options = {
	index: 'index.html',
}

app.use('/', express.static('public', options))
app.use((req, res) => {
	res.sendFile(resolve(`public/index.html`))
})

app.listen(3000, () => console.log(chalk.bold.green(`Listening on http://localhost:3000`)))
