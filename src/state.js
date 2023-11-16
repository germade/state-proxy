
const { isArray } = Array
const isObject = value => value && typeof value === 'object'

function _setPropValue (target, prop, value, path, listeners, targetIsArray = false) {
    const previousValue = target[prop]
    const propPath = path ? `${path}.${prop}` : prop

    target[prop] = isObject(value)
        ? _createProxy(value, propPath, listeners)
        : value

    listeners[propPath]?.forEach(listener => {
        targetIsArray && prop === 'length'
            ? listener(value)
            : listener(value, previousValue)
    })
}

function _createProxy (initialData, path, listeners) {
    const objectIsArray = isArray(initialData)
    const state = objectIsArray
        ? initialData.map(value => {
            if (value && typeof value === 'object') {
                return _createProxy(value, path, listeners)
            } else {
                return value
            }
        })
        : Object.keys(initialData)
            .reduce((state, prop) => {
                _setPropValue(state, prop, initialData[prop], path, listeners)
                return state
            }, {})

    return new Proxy (state, {
        set (target, prop, value) {
            _setPropValue(target, prop, value, path, listeners, objectIsArray)
            return true
        },
        deleteProperty (target, prop) {
            const previousValue = target[prop]
            delete target[prop]
            listeners[path ? `${path}.${prop}` : prop]?.forEach(listener => listener(undefined, previousValue))
            return true
        },
    })
}

export class StateProxy {
    state = null
    #listeners = {}

    constructor (initialData = {}) {
        this.state = _createProxy(initialData, null, this.#listeners, true)
        this.when = this.#when.bind(this)
    }

    #when (path, listener) {
        this.#listeners[path] ??= []
        this.#listeners[path].push(listener)

        return this
    }
}