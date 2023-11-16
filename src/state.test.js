
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

    test('createState.when("foo.bar")', () => {
        const { state, when } = new StateProxy({ foo: 'foo' })
        const listener = vi.fn()

        when('foo.bar', listener)

        state.foo = {}
        state.foo.bar = 'bar'

        expect(listener).toBeCalled()
    })
})