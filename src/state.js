
const { isArray } = Array
const isObject = value => value && typeof value === 'object'

function _setPropValue (target, prop, value, path, listeners, listenersAny) {
    const previousValue = target[prop]
    const propPath = path ? `${path}.${prop}` : prop

    if (isObject(previousValue)) {
        for (const _prop in previousValue) {
            _deleteValues(previousValue, _prop, propPath, listeners, listenersAny)
        }
    }

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

function _deleteValues (target, prop, path, listeners, listenersAny) {
    console.log('_deleteValues', { target, prop, path })
    const previousValue = target[prop]
    const propPath = path ? `${path}.${prop}` : prop

    if (isObject(previousValue)) {
        for (const _prop in previousValue) {
            if (previousValue.hasOwnProperty(_prop)) {
                _deleteValues(previousValue, _prop, propPath, listeners, listenersAny)
            }
        }
    }
    delete target[prop]
    // console.log(`delete ${propPath}`)

    listeners[propPath]?.forEach(listener => listener(undefined, previousValue, true))
    listenersAny.forEach(listener => listener(propPath, undefined, previousValue, true))
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
            _deleteValues(target, prop, path, listeners, listenersAny)
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