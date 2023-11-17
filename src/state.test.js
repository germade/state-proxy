
import { describe, test, expect, vi } from 'vitest'

import { StateProxy } from './state'

describe('new StateProxy', () => {
    test('returns a StateProxy instance', () => {
        const stateProxy = new StateProxy

        expect(stateProxy).toBeInstanceOf(StateProxy)
    })

    test('new StateProxy({ foo: "bar" })', () => {
        const { state } = new StateProxy({ foo: 'bar' })

        expect(state.foo).toBe('bar')
    })

    test('add and remove property', () => {
        const listener = vi.fn()
        const { state } = new StateProxy({ foo: 'bar' })
            .onChange('bar', listener)

        state.bar = 'baz'

        expect(state).toEqual({ foo: 'bar', bar: 'baz' })
        expect(listener)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, 'baz', undefined)

        delete state.bar

        expect(state).toEqual({ foo: 'bar' })
        expect(listener)
            .toBeCalledTimes(2)
            .toHaveBeenNthCalledWith(2, undefined, 'baz', true)
    })

    test('.onChange("foo")', () => {
        const { state, onChange } = new StateProxy({ foo: 'foo' })
        const listener = vi.fn()

        onChange('foo', listener)

        state.foo = 'bar'

        expect(listener).toBeCalled()
    })

    test('.onChange("foo.bar"): 0', () => {
        const { onChange } = new StateProxy({ foo: { bar: 'bar' } })
        const listener = vi.fn()

        onChange('foo.bar', listener)

        expect(listener).not.toBeCalled()
    })

    test('.onChange("foo.bar"): 1', () => {
        const { state, onChange } = new StateProxy({ foo: 'foo' })
        const listener = vi.fn()

        onChange('foo.bar', listener)

        state.foo = { bar: 'bar' }

        expect(listener).toBeCalledTimes(1)
    })

    test('.onChange("foo.bar"): 2', () => {
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

    test('.onChange("foo.bar"): []', () => {
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

    test('.onAnyChange', () => {
        const { state, onAnyChange } = new StateProxy({ foo: 'foo' })
        const listener = vi.fn()

        onAnyChange(listener)

        state.foo = 'bar'

        expect(listener).toBeCalledTimes(1)
        expect(listener).toBeCalledWith('foo', 'bar', 'foo')
    })

    test('chaining onChange', () => {
        const listener = vi.fn()

        const { state } = new StateProxy({ foo: 'foo' })
            .onChange('foo', listener)

        state.foo = 'bar'

        expect(listener).toBeCalledTimes(1)
    })

    test('chaining onChange 2 times', () => {
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

    test('chaining onAnyChange', () => {
        const listener = vi.fn()

        const { state } = new StateProxy({ foo: 'foo' })
            .onAnyChange(listener)

        state.foo = 'bar'

        expect(listener).toBeCalledTimes(1)
    })

    test('chaining onAnyChange 2 times', () => {
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

    test('chaining onChange and onAnyChange', () => {
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

    test('splice element in array', () => {
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
            .toHaveBeenNthCalledWith(1, undefined, 'bar', true)

        expect(listenerLength)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, 1)
    })

    test('splice(1,2) element in array', () => {
        const listener0 = vi.fn()
        const listener1 = vi.fn()
        const listener2 = vi.fn()
        const listener3 = vi.fn()
        const listenerLength = vi.fn()

        const { state } = new StateProxy({ foo: ['foo', 'bar', 'baz', 'qux'] })
            .onChange('foo.0', listener0)
            .onChange('foo.1', listener1)
            .onChange('foo.2', listener2)
            .onChange('foo.3', listener3)
            .onChange('foo.length', listenerLength)

        state.foo.splice(1, 2)

        expect(listener0)
            .toBeCalledTimes(0)

        expect(listener1)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, 'qux', 'bar')
        
        expect(listener2)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, undefined, 'baz', true)

        expect(listener3)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, undefined, 'qux', true)

        expect(listenerLength)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, 2)
    })

    test('delete element in array', () => {
        const listener = vi.fn()

        const { state } = new StateProxy({ foo: ['foo', 'bar'] })
            .onChange('foo.0', listener)

        delete state.foo[0]

        expect(listener)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, undefined, 'foo', true)
    })

    test('splice(0, 1) element in array', () => {
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
            .toHaveBeenNthCalledWith(1, undefined, 'bar', true)

        expect(listenerLength)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, 1)
    })

    test('splice(0,1) object in array', () => {
        const listener = vi.fn()

        const { state } = new StateProxy({ foo: [{ bar: 'bar' }, { baz: 'baz' }] })
            .onChange('foo.1', listener)

        state.foo.splice(0, 1)

        expect(state).toEqual({ foo: [{ baz: 'baz' }] })

        expect(listener)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, undefined, {}, true)
    })

    test('delete object with prop in array', () => {
        const listener = vi.fn()

        const { state } = new StateProxy({ foo: [{ bar: 'bar' }, { baz: 'baz' }] })
            .onChange('foo.0.bar', listener)

        delete state.foo[0]

        expect(listener)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, undefined, 'bar', true)
    })

    test('splice object with prop in array', () => {
        const listener0bar = vi.fn()
        const listener0baz = vi.fn()
        const listener1baz = vi.fn()

        const { state } = new StateProxy({ foo: [{ bar: 'bar' }, { baz: 'baz' }] })
            .onChange('foo.0.bar', listener0bar)
            .onChange('foo.0.baz', listener0baz)
            .onChange('foo.1.baz', listener1baz)

        state.foo.splice(0, 1)

        expect(listener0bar)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, undefined, 'bar', true)

        expect(listener0baz)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, 'baz', undefined)

        expect(listener1baz)
            .toBeCalledTimes(1)
            .toHaveBeenNthCalledWith(1, undefined, 'baz', true)
    })

    test('delete array with objects', () => {
        const listenerAny = vi.fn()

        const { state } = new StateProxy({ foo: [{ bar: 'bar' }, { baz: 'baz' }] })
            .onAnyChange(listenerAny)

        delete state.foo

        expect(listenerAny)
            .toBeCalledTimes(9)
            .toHaveBeenCalledWith('foo', undefined, [,,], true)
            .toHaveBeenCalledWith('foo.0', undefined, {}, true)
            .toHaveBeenCalledWith('foo.0.bar', undefined, 'bar', true)
            .toHaveBeenCalledWith('foo.1', undefined, {}, true)
            .toHaveBeenCalledWith('foo.1.baz', undefined, 'baz', true)

        expect(listenerAny)
            .toHaveBeenCalledWith('foo.bar', undefined, 'bar', true)
            .not.toHaveBeenCalledWith('foo.baz', undefined, 'bar', true)
    })
})