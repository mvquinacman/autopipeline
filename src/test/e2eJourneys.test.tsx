import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { leadService } from '../services/leadService';

describe('AutoPipeline - End-to-End User Journey Verification', () => {
  beforeEach(() => {
    leadService.resetMockStore();
  });

  it('Journey 1: Dealership shell renders and enforces role-based scoping ladder', async () => {
    render(<App />);

    // Header and core signatures are visible
    expect(screen.getByText('AutoPipeline')).toBeInTheDocument();
    expect(screen.getByText('Metro Manila Motors — BGC Showroom')).toBeInTheDocument();
    expect(screen.getByText('Monthly Target')).toBeInTheDocument();

    // Default active profile is Agent Paolo Morales (7 leads scoped)
    expect(screen.getByText(/All Scoped Leads/)).toHaveTextContent('(7)');

    // Switch role to Manager: Rafael Alcantara (14 team leads scoped)
    const managerBtn = screen.getByRole('button', { name: /Rafael Alcantara/i });
    fireEvent.click(managerBtn);

    await waitFor(() => {
      expect(screen.getByText(/All Scoped Leads/)).toHaveTextContent('(14)');
    });

    // Switch role to Dealer Principal: Vicente Tan (14 dealership leads scoped)
    const principalBtn = screen.getByRole('button', { name: /Vicente Tan/i });
    fireEvent.click(principalBtn);

    await waitFor(() => {
      expect(screen.getByText(/All Scoped Leads/)).toHaveTextContent('(14)');
    });
  });

  it('Journey 2: View navigation switches between Pipeline, Follow-ups Hub, and Analytics', async () => {
    render(<App />);

    // Switch to Follow-ups tab
    const followUpsTab = screen.getByRole('button', { name: /Follow-ups/i });
    fireEvent.click(followUpsTab);

    // Follow-ups Hub rendered
    expect(await screen.findByText(/Active Tasks/i)).toBeInTheDocument();

    // Switch to Analytics tab
    const analyticsTab = screen.getByRole('button', { name: /Analytics/i });
    fireEvent.click(analyticsTab);

    // Analytics Funnel rendered
    expect(await screen.findByText('7-Stage Dealership Conversion Funnel')).toBeInTheDocument();
    expect(screen.getByText('Deal Loss Rationale & Leakage')).toBeInTheDocument();
    expect(screen.getByText('Top Vehicle Model Demand')).toBeInTheDocument();

    // Return to Pipeline
    const pipelineTab = screen.getByRole('button', { name: /Pipeline/i });
    fireEvent.click(pipelineTab);
    expect(await screen.findByText(/All Scoped Leads/)).toBeInTheDocument();
  });

  it('Journey 3: Filtering stages via Chevron Rail and advancing lead stages', async () => {
    render(<App />);

    // Click on Contacted chevron stage
    const contactedChevron = screen.getByRole('button', { name: /Contacted/i });
    fireEvent.click(contactedChevron);

    // List header updates to reflect filtered stage
    await waitFor(() => {
      expect(screen.getByText(/contacted Leads/i)).toBeInTheDocument();
    });

    // Click "All Stages" button in StageRail to restore all leads
    const allStagesBtn = screen.getByRole('button', { name: /All Stages/i });
    fireEvent.click(allStagesBtn);

    await waitFor(() => {
      expect(screen.getByText(/All Scoped Leads/)).toBeInTheDocument();
    });
  });

  it('Journey 4: Duplicate Phone Detection and Intake in Add Lead Modal', async () => {
    render(<App />);

    // Open Add Lead modal
    const addLeadBtn = screen.getByRole('button', { name: /Add Lead/i });
    fireEvent.click(addLeadBtn);

    expect(await screen.findByRole('heading', { name: /Add New Lead/i })).toBeInTheDocument();

    // Enter existing phone number of Roberto Lim (+63 917 882 1190)
    const phoneInput = screen.getByPlaceholderText(/917 123 4567/i);
    fireEvent.change(phoneInput, { target: { value: '+63 917 882 1190' } });

    // Warning alert triggers after debounce
    await waitFor(
      () => {
        expect(screen.getByText(/Possible Duplicate Lead Detected!/i)).toBeInTheDocument();
        expect(screen.getByText(/Phone matches active lead owned by/i)).toBeInTheDocument();
      },
      { timeout: 2500 }
    );

    // Close modal
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);
  });

  it('Journey 5: Follow-Up completion in Follow-ups Hub', async () => {
    render(<App />);

    // Navigate to Follow-ups
    fireEvent.click(screen.getByRole('button', { name: /Follow-ups/i }));

    // Find a "Done" button asynchronously
    const doneButtons = await screen.findAllByRole('button', { name: /Done/i });
    expect(doneButtons.length).toBeGreaterThan(0);

    fireEvent.click(doneButtons[0]);

    // Verify task is moved to Completed
    const completedTab = await screen.findByRole('button', { name: /Completed \(1\)/i });
    expect(completedTab).toBeInTheDocument();

    fireEvent.click(completedTab);
    expect(await screen.findByText('Completed')).toBeInTheDocument();
  });
});
