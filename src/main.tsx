import {createRoot} from 'react-dom/client'
import {connectPlugin} from '@host/plugin-sdk'
import {applyTheme} from '@host/renderer/src/theme'
import '@host/renderer/src/styles/base.css'
import '@host/renderer/src/styles/app.css'
import {App} from './App'
import {installServices} from './services'
import './styles.css'

async function start() {
    const client = await connectPlugin()
    const services = installServices(client)
    applyTheme('dark')
    void services.accounts.getTheme().then(result => {
        if (result.ok && result.data) applyTheme(result.data)
    })
    createRoot(document.getElementById('root')!).render(<App client={client} services={services}/>)
    client.ready()
}

void start()
