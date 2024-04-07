import { beforeEach, describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { bigUintN } from '../../../src/arbitrary/bigUintN';

import { fakeArbitrary } from './__test-helpers__/ArbitraryHelpers';

import * as BigIntArbitraryMock from '../../../src/arbitrary/_internals/BigIntArbitrary';

function fakeBigIntArbitrary() {
  const instance = fakeArbitrary<bigint>().instance as BigIntArbitraryMock.BigIntArbitrary;
  return instance;
}

function beforeEachHook() {
  vi.resetModules();
  vi.restoreAllMocks();
  fc.configureGlobal({ beforeEach: beforeEachHook });
}
beforeEach(beforeEachHook);

describe('bigUintN', () => {
  if (typeof BigInt === 'undefined') {
    it('no test', () => {
      expect(true).toBe(true);
    });
    return;
  }

  it('should instantiate BigIntArbitrary(0, 2^n -1) for bigIntN(n)', () =>
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), (n) => {
        // Arrange
        const instance = fakeBigIntArbitrary();
        const BigIntArbitrary = vi.spyOn(BigIntArbitraryMock, 'BigIntArbitrary');
        BigIntArbitrary.mockImplementation(() => instance);

        // Act
        const arb = bigUintN(n);

        // Assert
        expect(BigIntArbitrary).toHaveBeenCalledWith(BigInt(0), BigInt(2) ** BigInt(n) - BigInt(1));
        expect(arb).toBe(instance);
      }),
    ));

  it('should throw when n value is lower than zero', () =>
    fc.assert(
      fc.property(fc.integer({ min: -1000, max: -1 }), (n) => {
        // Arrange / Act / Assert
        expect(() => bigUintN(n)).toThrowError();
      }),
    ));
});
