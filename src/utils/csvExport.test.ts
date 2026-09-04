import { describe, it, expect, vi } from 'vitest';
import { exportLeadsToCsv } from './csvExport';
import { SEED_LEADS } from '../data/seed';

describe('csvExport utility', () => {
  it('generates a CSV download trigger without error', () => {
    // Mock createObjectURL and revokeObjectURL
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    window.URL.createObjectURL = mockCreateObjectURL;

    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    exportLeadsToCsv(SEED_LEADS.slice(0, 3), 'test-export.csv');

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
  });
});
