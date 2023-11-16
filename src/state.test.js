
import { describe, test, expect, vi } from 'vitest'

import { StateProxy } from './state'

describe('StateProxy', () => {
    test('StateProxy returns a StateProxy instance', () => {
        const stateProxy = new StateProxy()

        expect(stateProxy).toBeInstanceOf(StateProxy)
    })

    test('new StateProxy({ foo: "bar" })', () => {
        const { state } = new StateProxy({ foo: 'bar' })

        expect(state.foo).toBe('bar')
    })

    test('new StateProxy.onChange("foo")', () => {
        const { state, onChange } = new StateProxy({ foo: 'foo' })
        const listener = vi.fn()

        onChange('foo', listener)

        state.foo = 'bar'

        expect(listener).toBeCalled()
    })

    test('new StateProxy.onChange("foo.bar"): 0', () => {
        const { onChange } = new StateProxy({ foo: { bar: 'bar' } })
        const listener = vi.fn()

        onChange('foo.bar', listener)

        expect(listener).not.toBeCalled()
    })

    test('new StateProxy.onChange("foo.bar"): 1', () => {
        const { state, onChange } = new StateProxy({ foo: 'foo' })
        const listener = vi.fn()

        onChange('foo.bar', listener)

        state.foo = { bar: 'bar' }

        expect(listener).toBeCalledTimes(1)
    })

    test('new StateProxy.onChange("foo.bar"): 2', () => {
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

    test('new StateProxy.onChange("foo.bar"): []', () => {
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

    test('new StateProxy.onAnyChange', () => {
        const { state, onAnyChange } = new StateProxy({ foo: 'foo' })
        const listener = vi.fn()

        onAnyChange(listener)

        state.foo = 'bar'

        expect(listener).toBeCalledTimes(1)
        expect(listener).toBeCalledWith('foo', 'bar', 'foo')
    })

    test('new StateProxy chaning onChange', () => {
        const listener = vi.fn()

        const { state } = new StateProxy({ foo: 'foo' })
            .onChange('foo', listener)

        state.foo = 'bar'

        expect(listener).toBeCalledTimes(1)
    })

    test('new StateProxy chaning onChange 2 times', () => {
        const listenerFoo = vi.fn()
        const listenerBar = vi.fn()

        const { state } = new StateProxy({ foo: 'foo' })
            .onChange('foo', listenerFoo)
            .onChange('bar', listenerBar)

        state.foo = 'bar'

        expect(listenerFoo).toBeCalledTimes(1)

        state.bar = 'baz'

        expect(listenerBar).toBeCalledTimes(1)
    })
})