
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

    test('new StateProxy chaning onAnyChange', () => {
        const listener = vi.fn()

        const { state } = new StateProxy({ foo: 'foo' })
            .onAnyChange(listener)

        state.foo = 'bar'

        expect(listener).toBeCalledTimes(1)
    })

    test('new StateProxy chaning onAnyChange 2 times', () => {
        const listener = vi.fn()

        const { state } = new StateProxy({ foo: 'foo' })
            .onAnyChange(listener)

        state.foo = 'bar'
        state.bar = 'bar'

        expect(listener)
            .toBeCalledTimes(2)
            .toHaveBeenNthCalledWith(1, 'foo', 'bar', 'foo')
            .toHaveBeenNthCalledWith(2, 'bar', 'bar', undefined)
    })

    test('new StateProxy chaning onChange and onAnyChange', () => {
        const listenerFoo = vi.fn()
        const listenerAny = vi.fn()

        const { state } = new StateProxy({ foo: 'foo' })
            .onChange('foo', listenerFoo)
            .onAnyChange(listenerAny)

        state.foo = 'bar'

        expect(listenerFoo)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, 'bar', 'foo')

        expect(listenerAny)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, 'foo', 'bar', 'foo')
    })

    test('new StateProxy splice element in array', () => {
        const listener = vi.fn()

        const { state } = new StateProxy({ foo: ['foo', 'bar'] })
            .onChange('foo.0', listener)

        state.foo.splice(0, 1)

        expect(listener)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, 'bar', 'foo')
    })

    test('new StateProxy splice(1,2) element in array', () => {
        const listener1 = vi.fn()
        const listener2 = vi.fn()

        const { state } = new StateProxy({ foo: ['foo', 'bar', 'baz', 'qux'] })
            .onChange('foo.1', listener1)
            .onChange('foo.2', listener2)

        state.foo.splice(1, 2)

        expect(listener1)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, 'qux', 'bar')

        expect(listener2)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, undefined, 'baz')
    })

    test('new StateProxy delete element in array', () => {
        const listener = vi.fn()

        const { state } = new StateProxy({ foo: ['foo', 'bar'] })
            .onChange('foo.0', listener)

        delete state.foo[0]

        expect(listener)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, undefined, 'foo')
    })

    test('new StateProxy splice(0, 1) element in array', () => {
        const listener0 = vi.fn()
        const listener1 = vi.fn()
        const listenerLength = vi.fn()

        const { state } = new StateProxy({ foo: ['foo', 'bar'] })
            .onChange('foo.0', listener0)
            .onChange('foo.1', listener1)
            .onChange('foo.length', listenerLength)

        state.foo.splice(0, 1)

        expect(listener0)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, 'bar', 'foo')

        expect(listener1)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, undefined, 'bar')

        expect(listenerLength)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, 1)
    })

    test('new StateProxy splice(0,1) object in array', () => {
        const listener = vi.fn()

        const { state } = new StateProxy({ foo: [{ bar: 'bar' }, { baz: 'baz' }] })
            .onChange('foo.1', listener)

        state.foo.splice(0, 1)

        expect(state).toEqual({ foo: [{ baz: 'baz' }] })

        expect(listener)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, undefined, {})
    })

    // test('new StateProxy splice(0,1) object in array', () => {
    //     const listener = vi.fn()

    //     const { state } = new StateProxy({ foo: [{ bar: 'bar' }, { baz: 'baz' }] })
    //         .onChange('foo.1.baz', listener)

    //     state.foo.splice(0, 1)

    //     expect(state).toEqual({ foo: [{ baz: 'baz' }] })

    //     expect(listener)
    //         .toBeCalledTimes(1)
    //         // .toHaveBeenNthCalledWith(1, undefined, {})
    // })
})