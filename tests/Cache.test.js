import Cache from '../lib/util/Cache'

describe('Cache Module', () => {
    let cache

    beforeEach(() => {
        cache = new Cache()
    })

    describe('constructor', () => {
        test('should initialize with empty cache when no argument provided', () => {
            const emptyCache = new Cache()
            expect(emptyCache.cache).toEqual({})
        })

        test('should initialize with provided cache object', () => {
            const initialData = { key1: 'value1', key2: 'value2' }
            const cacheWithData = new Cache(initialData)
            expect(cacheWithData.cache).toEqual(initialData)
        })

        test('should handle null as empty object', () => {
            const nullCache = new Cache(null)
            expect(nullCache.cache).toEqual({})
        })
    })

    describe('set()', () => {
        test('should set a value for a given key', () => {
            cache.set('testKey', 'testValue')
            expect(cache.cache.testKey).toBe('testValue')
        })

        test('should overwrite existing values', () => {
            cache.set('key', 'oldValue')
            cache.set('key', 'newValue')
            expect(cache.cache.key).toBe('newValue')
        })

        test('should handle different data types', () => {
            cache.set('string', 'text')
            cache.set('number', 42)
            cache.set('boolean', true)
            cache.set('object', { nested: 'value' })
            cache.set('array', [1, 2, 3])

            expect(cache.cache.string).toBe('text')
            expect(cache.cache.number).toBe(42)
            expect(cache.cache.boolean).toBe(true)
            expect(cache.cache.object).toEqual({ nested: 'value' })
            expect(cache.cache.array).toEqual([1, 2, 3])
        })
    })

    describe('get()', () => {
        test('should retrieve a value for a given key', () => {
            cache.set('key', 'value')
            expect(cache.get('key')).toBe('value')
        })

        test('should return undefined for non-existent keys', () => {
            expect(cache.get('nonExistent')).toBeUndefined()
        })

        test('should retrieve different data types', () => {
            const testData = {
                string: 'text',
                number: 123,
                boolean: false,
                object: { prop: 'val' },
                array: [4, 5, 6]
            }

            Object.entries(testData).forEach(([key, value]) => {
                cache.set(key, value)
            })

            Object.entries(testData).forEach(([key, value]) => {
                expect(cache.get(key)).toEqual(value)
            })
        })
    })

    describe('integration', () => {
        test('should handle multiple set and get operations', () => {
            cache.set('a', 1)
            cache.set('b', 2)
            cache.set('c', 3)

            expect(cache.get('a')).toBe(1)
            expect(cache.get('b')).toBe(2)
            expect(cache.get('c')).toBe(3)

            cache.set('a', 10)
            expect(cache.get('a')).toBe(10)
        })
    })
})
