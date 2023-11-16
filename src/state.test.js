
import { describe, test, expect, vi } from 'vitest'

import { StateProxy } from './state'

describe('StateProxy', () => {
    test('StateProxy returns a StateProxy instance', () => {
        const stateProxy = new StateProxy()

        expect(stateProxy).toBeInstanceOf(StateProxy)
    })

    test('createState({ foo: "bar" })', () => {
        const { state } = new StateProxy({ foo: 'bar' })

        expect(state.foo).toBe('bar')
    })

    test('createState.onChange("foo")', () => {
        const { state, onChange } = new StateProxy({ foo: 'foo' })
        const listener = vi.fn()

        onChange('foo', listener)

        state.foo = 'bar'

        expect(listener).toBeCalled()
    })

    test('createState.onChange("foo.bar"): 0', () => {
        const { onChange } = new StateProxy({ foo: { bar: 'bar' } })
        const listener = vi.fn()

        onChange('foo.bar', listener)

        expect(listener).not.toBeCalled()
    })

    test('createState.onChange("foo.bar"): 1', () => {
        const { state, onChange } = new StateProxy({ foo: 'foo' })
        const listener = vi.fn()

        onChange('foo.bar', listener)

        state.foo = { bar: 'bar' }

        expect(listener).toBeCalledTimes(1)
    })

    test('createState.onChange("foo.bar"): 2', () => {
        const { state, onChange } = new StateProxy({ foo: 'foo' })
        const listener = vi.fn()

        onChange('foo.bar', listener)

        state.foo = {}
        state.foo.bar = 'bar'

        expect(listener).toBeCalledTimes(1)
        expect(listener).toBeCalledWith('bar', undefined)

        state.foo.bar = 'baz'

        expect(listener).toBeCalledTimes(2)
        expect(listener).toBeCalledWith('baz', 'bar')
    })

    test('createState.onChange("foo.bar"): []', () => {
        const { state, onChange } = new StateProxy({ foo: [] })
        const listener = vi.fn()
        const listenerLength = vi.fn()

        onChange('foo.0', listener)
        onChange('foo.length', listenerLength)

        state.foo.push('bar')

        expect(listener).toBeCalledTimes(1)
        expect(listener).toBeCalledWith('bar', undefined)

        expect(listenerLength).toBeCalledTimes(1)
        expect(listenerLength).toHaveBeenCalledWith(1)

        state.foo.push('baz')

        expect(listenerLength).toBeCalledTimes(2)
        expect(listenerLength).toBeCalledWith(2)
    })

    test('createState.onAnyChange', () => {
        const { state, onAnyChange } = new StateProxy({ foo: 'foo' })
        const listener = vi.fn()

        onAnyChange(listener)

        state.foo = 'bar'

        expect(listener).toBeCalledTimes(1)
        expect(listener).toBeCalledWith('foo', 'bar', 'foo')
    })
})