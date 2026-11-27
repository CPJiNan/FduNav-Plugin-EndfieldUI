import type {PluginClient} from '@host/plugin-sdk'
import {pluginPermissions, type PluginEvent, type PluginOperation, type PluginServices} from '@host/shared/plugins'

function service(client: PluginClient, namespace: keyof PluginServices) {
    return new Proxy(Object.create(null), {
        get(target, key) {
            if (typeof key !== 'string') return undefined
            if (Object.hasOwn(target, key)) return target[key]
            const operation = `${namespace}.${key}`
            if (key.startsWith('on')) {
                target[key] = (callback: (...args: never[]) => void) => {
                    let subscribed = true
                    const unsubscribe = client.on(operation as PluginEvent, (...args: never[]) => {
                        if (subscribed) callback(...args)
                    })
                    void unsubscribe.catch(error => console.error(error))
                    return () => {
                        subscribed = false
                        void unsubscribe.then(dispose => dispose(), () => undefined)
                    }
                }
            } else {
                target[key] = (...args: never[]) =>
                    client.call(operation as PluginOperation, ...args).catch(error => ({
                        ok: false,
                        error: error instanceof Error ? error.message : '无法连接 FduNav 服务。'
                    }))
            }
            return target[key]
        }
    })
}

export function installServices(client: PluginClient) {
    const namespaces = Object.keys(pluginPermissions) as (keyof PluginServices)[]
    const services = Object.fromEntries(namespaces.map(namespace => [namespace, service(client, namespace)])) as unknown as PluginServices
    Object.assign(window, services)
    return services
}
