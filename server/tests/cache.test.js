const cache = require('../utils/cache');

describe('cache utility', () => {
  beforeEach(() => {
    cache.clear();
  });

  describe('set and get', () => {
    test('stores and retrieves data', () => {
      cache.set('key1', { data: 'value' }, 1000);
      expect(cache.get('key1')).toEqual({ data: 'value' });
    });

    test('returns null for non-existent key', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    test('returns null for expired entry', () => {
      cache.set('key1', 'value', 10);
      return new Promise((resolve) => setTimeout(resolve, 20)).then(() => {
        expect(cache.get('key1')).toBeNull();
      });
    });

    test('updates existing key', () => {
      cache.set('key1', 'value1', 1000);
      cache.set('key1', 'value2', 1000);
      expect(cache.get('key1')).toBe('value2');
    });

    test('respects default TTL', () => {
      cache.set('key1', 'value');
      expect(cache.get('key1')).toBe('value');
    });
  });

  describe('del', () => {
    test('deletes existing key', () => {
      cache.set('key1', 'value', 1000);
      cache.del('key1');
      expect(cache.get('key1')).toBeNull();
    });

    test('does not throw for non-existent key', () => {
      expect(() => cache.del('nonexistent')).not.toThrow();
    });
  });

  describe('clear', () => {
    test('clears all entries', () => {
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 1000);
      cache.clear();
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('invalidateUserCache', () => {
    test('invalidates user-specific cache entries', () => {
      cache.set('dashboard:user123', 'data1', 1000);
      cache.set('kpis:user123', 'data2', 1000);
      cache.set('monthly:user123', 'data3', 1000);
      cache.set('insights:user123', 'data4', 1000);
      cache.set('goalproj:user123', 'data5', 1000);
      cache.set('wealthproj:user123', 'data6', 1000);
      cache.set('stability:user123', 'data7', 1000);
      cache.set('admin:kpis', 'data8', 1000);
      cache.set('dashboard:other', 'data9', 1000);

      cache.invalidateUserCache('user123');

      expect(cache.get('dashboard:user123')).toBeNull();
      expect(cache.get('kpis:user123')).toBeNull();
      expect(cache.get('monthly:user123')).toBeNull();
      expect(cache.get('insights:user123')).toBeNull();
      expect(cache.get('goalproj:user123')).toBeNull();
      expect(cache.get('wealthproj:user123')).toBeNull();
      expect(cache.get('stability:user123')).toBeNull();
      expect(cache.get('admin:kpis')).toBeNull();
      expect(cache.get('dashboard:other')).toEqual('data9');
    });

    test('does not throw for invalid userId', () => {
      expect(() => cache.invalidateUserCache(null)).not.toThrow();
      expect(() => cache.invalidateUserCache(undefined)).not.toThrow();
      expect(() => cache.invalidateUserCache('')).not.toThrow();
    });
  });

  describe('LRU eviction', () => {
    test('evicts least recently used when cache is full', () => {
      const smallCache = require('../utils/cache');
      smallCache.clear();
      for (let i = 0; i < 110; i++) {
        smallCache.set(`key${i}`, `value${i}`, 1000);
      }
      expect(smallCache.get('key0')).toBeNull();
      expect(smallCache.get('key109')).toEqual('value109');
    });
  });
});