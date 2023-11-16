
const { isArray } = Array
const isObject = value => value && typeof value === 'object'
const { slice } = Array.prototype

function _setPropValue (target, prop, value, path, listeners, listenersAny) {
    const previousValue = target[prop]
    const propPath = path ? `${path}.${prop}` : prop

    target[prop] = isObject(value)
        ? _createProxy(value, propPath, listeners, listenersAny)
        : value

    listeners[propPath]?.forEach(listener => {
        isArray(target) && prop === 'length'
            ? listener(value)
            : listener(value, previousValue)
    })

    listenersAny.forEach(listener => listener(propPath, value, previousValue))
}

function _deleteValues (target, prop) {
    const previousValue = target[prop]

    if (isArray(previousValue)) {
        for (const i = previousValue.length - 1; i >= 0; i--) {
            _deleteValues(previousValue, i)
        }
        previousValue.splice(0)
    } else if (isObject(previousValue)) {
        Object.keys(previousValue).forEach(prop => _deleteValues(previousValue, prop))
    }
    delete target[prop]

    return previousValue
}

function _createProxy (initialData, path, listeners, listenersAny) {
    const state = isArray(initialData)
        ? initialData.map(value => {
            if (value && typeof value === 'object') {
                return _createProxy(value, path, listeners, listenersAny)
            } else {
                return value
            }
        })
        : Object.keys(initialData)
            .reduce((state, prop) => {
                _setPropValue(state, prop, initialData[prop], path, listeners, listenersAny)
                return state
            }, {})

    return new Proxy (state, {
        set (target, prop, value) {
            _setPropValue(target, prop, value, path, listeners, listenersAny)
            return true
        },
        deleteProperty (target, prop) {
            console.log('deleteProperty', target, prop)
            const previousValue = _deleteValues(target, prop)
            listeners[path ? `${path}.${prop}` : prop]?.forEach(listener => listener(undefined, previousValue))
            return true
        },
    })
}

export class StateProxy {
    state = null
    #listeners = {}
    #listenersAny = []

    constructor (initialData = {}) {
        this.state = _createProxy(initialData, null, this.#listeners, this.#listenersAny, true)
        this.onChange = this.#onChange.bind(this)
        this.onAnyChange = this.#onAnyChange.bind(this)
    }

    #onChange (path, listener) {
        this.#listeners[path] ??= []
        this.#listeners[path].push(listener)

        return this
    }

    #onAnyChange (listener) {
        this.#listenersAny.push(listener)

        return this
    }
}