import {createRequire} from 'node:module'
import {relative, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'
import {copyFile} from 'node:fs/promises'

const root = fileURLToPath(new URL('..', import.meta.url))
const host = resolve(root, '../FduNav')
const hostRequire = createRequire(resolve(host, 'package.json'))
const {build} = await import(pathToFileURL(hostRequire.resolve('vite')).href)
const output = resolve(root, 'dist')

await build({
    root,
    configFile: false,
    base: './',
    resolve: {
        alias: {
            '@host': resolve(host, 'src'),
            react: resolve(host, 'node_modules/react'),
            'react-dom': resolve(host, 'node_modules/react-dom')
        }
    },
    build: {
        outDir: output,
        emptyOutDir: true,
        rolldownOptions: {
            output: {
                comments: false
            }
        }
    }
})

await Promise.all([
    copyFile(resolve(root, 'plugin.json'), resolve(output, 'plugin.json')),
    copyFile(resolve(root, 'LICENSE'), resolve(output, 'LICENSE'))
])
console.log(`FduNav 插件目录 ${relative(root, output)}`)
