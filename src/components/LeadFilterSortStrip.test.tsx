import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeadFilterSortStrip, type LeadFilter, type LeadSort } from './LeadFilterSortStrip';

describe('LeadFilterSortStrip Component', () => {
  it('renders all filter chips, sort options, and lead counts', () => {
    const handleSelectFilter = vi.fn();
    const handleSelectSort = vi.fn();
    const handleReset = vi.fn();

    render(
      <LeadFilterSortStrip
        activeFilter="all"
        onSelectFilter={handleSelectFilter}
        activeSort="default"
        onSelectSort={handleSelectSort}
        totalCount={14}
        filteredCount={14}
        onReset={handleReset}
      />
    );

    // Filter chips
    expect(screen.getByRole('button', { name: 'All Leads' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Overdue Tasks/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /High Value/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Test Drive/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /In Financing/i })).toBeInTheDocument();

    // Counts
    expect(screen.getByText('Showing')).toBeInTheDocument();
    expect(screen.getAllByText('14').length).toBeGreaterThanOrEqual(2);

    // Reset button should not be present when at default state
    expect(screen.queryByRole('button', { name: /Reset/i })).not.toBeInTheDocument();
  });

  it('triggers onSelectFilter when a chip is clicked', () => {
    const handleSelectFilter = vi.fn();
    render(
      <LeadFilterSortStrip
        activeFilter="all"
        onSelectFilter={handleSelectFilter}
        activeSort="default"
        onSelectSort={vi.fn()}
        totalCount={14}
        filteredCount={14}
        onReset={vi.fn()}
      />
    );

    const overdueChip = screen.getByRole('button', { name: /Overdue Tasks/i });
    fireEvent.click(overdueChip);
    expect(handleSelectFilter).toHaveBeenCalledWith('overdue');

    const highValueChip = screen.getByRole('button', { name: /High Value/i });
    fireEvent.click(highValueChip);
    expect(handleSelectFilter).toHaveBeenCalledWith('high_value');
  });

  it('triggers onSelectSort when sort dropdown is changed', () => {
    const handleSelectSort = vi.fn();
    render(
      <LeadFilterSortStrip
        activeFilter="all"
        onSelectFilter={vi.fn()}
        activeSort="default"
        onSelectSort={handleSelectSort}
        totalCount={14}
        filteredCount={14}
        onReset={vi.fn()}
      />
    );

    const sortSelect = screen.getByLabelText(/Sort leads by/i);
    fireEvent.change(sortSelect, { target: { value: 'value_desc' } });
    expect(handleSelectSort).toHaveBeenCalledWith('value_desc');
  });

  it('shows Reset button when filter is active and calls onReset on click', () => {
    const handleReset = vi.fn();
    render(
      <LeadFilterSortStrip
        activeFilter="overdue"
        onSelectFilter={vi.fn()}
        activeSort="default"
        onSelectSort={vi.fn()}
        totalCount={14}
        filteredCount={3}
        onReset={handleReset}
      />
    );

    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
