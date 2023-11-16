
function _setPropValue (target, prop, value, path, listeners) {
    if (value && typeof value === 'object') {
        target[prop] = _createState(value, path ? `${path}.${prop}` : prop, listeners)
    } else {
        target[prop] = value
    }
}

function _createState (initialData, path, listeners) {
    const state = {}

    for(const prop in initialData) {
        _setPropValue(state, prop, initialData[prop], path, listeners)
    }

    return new Proxy (state, {
        set (target, prop, value) {
            const previousValue = value
            _setPropValue(target, prop, value, path, listeners)

            listeners[path ? `${path}.${prop}` : prop]?.forEach(listener => listener(value, previousValue))
            return true
        }
    })
}

export class StateProxy {
    state = null
    #listeners = {}

    constructor (initialData = {}) {
        this.state = _createState(initialData, null, this.#listeners)
        this.when = this.#when.bind(this)
    }

    #when (path, listener) {
        this.#listeners[path] ??= []
        this.#listeners[path].push(listener)

        return this
    }
}