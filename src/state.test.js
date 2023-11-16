
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

    test('createState.when("foo")', () => {
        const { state, when } = new StateProxy({ foo: 'foo' })
        const listener = vi.fn()

        when('foo', listener)

        state.foo = 'bar'

        expect(listener).toBeCalled()
    })

    test('createState.when("foo.bar"): 0', () => {
        const { when } = new StateProxy({ foo: { bar: 'bar' } })
        const listener = vi.fn()

        when('foo.bar', listener)

        expect(listener).not.toBeCalled()
    })

    test('createState.when("foo.bar"): 1', () => {
        const { state, when } = new StateProxy({ foo: 'foo' })
        const listener = vi.fn()

        when('foo.bar', listener)

        state.foo = { bar: 'bar' }

        expect(listener).toBeCalledTimes(1)
    })

    test('createState.when("foo.bar"): 2', () => {
        const { state, when } = new StateProxy({ foo: 'foo' })
        const listener = vi.fn()

        when('foo.bar', listener)

        state.foo = {}
        state.foo.bar = 'bar'

        expect(listener).toBeCalledTimes(1)
        expect(listener).toBeCalledWith('bar', undefined)

        state.foo.bar = 'baz'

        expect(listener).toBeCalledTimes(2)
        expect(listener).toBeCalledWith('baz', 'bar')
    })

    test('createState.when("foo.bar"): []', () => {
        const { state, when } = new StateProxy({ foo: [] })
        const listener = vi.fn()
        const listenerLength = vi.fn()

        when('foo.0', listener)
        when('foo.length', listenerLength)

        state.foo.push('bar')

        expect(listener).toBeCalledTimes(1)
        expect(listener).toBeCalledWith('bar', undefined)

        expect(listenerLength).toBeCalledTimes(1)
        expect(listenerLength).toHaveBeenCalledWith(1)

        state.foo.push('baz')

        expect(listenerLength).toBeCalledTimes(2)
        expect(listenerLength).toBeCalledWith(2)
    })
})