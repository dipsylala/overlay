import { describe, expect, test } from '@jest/globals';
import veracode from './veracode.js';

describe('veracode', () => {
  test('should return details for package', async () => {
    const res = await veracode({ type: 'npm', name: 'react' });

    expect(res).toStrictEqual({
      issues: expect.any(Number),
      reportUrl: expect.any(String),
      summary: expect.any(String),
      data: {},
    });
  });
});
