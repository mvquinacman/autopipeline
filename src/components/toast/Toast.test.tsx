import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../../context/ToastContext';

function TestComponent({ onUndo, message = 'Stage advanced' }: { onUndo?: () => void; message?: string }) {
  const { showToast } = useToast();
  return (
    <button
      type="button"
      onClick={() => showToast({ message, type: 'success', actionLabel: 'Undo', undoAction: onUndo, duration: 3000 })}
    >
      Trigger Toast
    </button>
  );
}

describe('Toast Notification & Undo System', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('renders toast message and triggers undo callback on click', async () => {
    const handleUndo = vi.fn();
    render(
      <ToastProvider>
        <TestComponent onUndo={handleUndo} message="Patricia Reyes advanced to Showroom" />
      </ToastProvider>
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Trigger Toast' }));

    const statusElement = screen.getByRole('status');
    expect(statusElement).toHaveTextContent('Patricia Reyes advanced to Showroom');

    const undoBtn = screen.getByRole('button', { name: 'Undo' });
    await act(async () => {
      fireEvent.click(undoBtn);
    });

    expect(handleUndo).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('auto-dismisses toast after duration timer expires', () => {
    render(
      <ToastProvider>
        <TestComponent message="Auto dismiss test" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Trigger Toast' }));
    expect(screen.getByText('Auto dismiss test')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3500);
    });
    expect(screen.queryByText('Auto dismiss test')).not.toBeInTheDocument();
  });

  it('allows manual dismissal via close button', () => {
    render(
      <ToastProvider>
        <TestComponent message="Manual dismiss" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Trigger Toast' }));
    expect(screen.getByText('Manual dismiss')).toBeInTheDocument();

    const dismissBtn = screen.getByRole('button', { name: /dismiss notification/i });
    act(() => {
      fireEvent.click(dismissBtn);
    });
    expect(screen.queryByText('Manual dismiss')).not.toBeInTheDocument();
  });
});

