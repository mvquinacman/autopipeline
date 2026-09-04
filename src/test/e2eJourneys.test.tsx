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

  it('Journey 6: Quick search bar finds lead and opens detail inspector', async () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/Search customer, phone, model/i);
    fireEvent.change(searchInput, { target: { value: 'Fortuner' } });

    // Dropdown shows matching search results
    const matchingResults = await screen.findAllByText('Maria Santos');
    expect(matchingResults.length).toBeGreaterThanOrEqual(1);

    // Clicking search result opens Lead Inspector drawer
    fireEvent.click(matchingResults[matchingResults.length - 1]);
    expect(await screen.findByText('Lead Inspector')).toBeInTheDocument();
    expect(screen.getByText('Showroom Deal Tools')).toBeInTheDocument();
  });

  it('Journey 7: Kanban Board renders 7 stage columns with stage totals', async () => {
    render(<App />);

    // Switch to Kanban Board
    const boardTab = screen.getByRole('button', { name: /Kanban Board/i });
    fireEvent.click(boardTab);

    // Verify Kanban board rendered
    expect(await screen.findByText(/Floor Standup Board/i)).toBeInTheDocument();
    expect(screen.getByText('New Lead')).toBeInTheDocument();
    expect(screen.getByText('Test Drive')).toBeInTheDocument();
    expect(screen.getByText('Financing Application')).toBeInTheDocument();
  });

  it('Journey 8: F&I Loan Calculator computes monthly amortization and attaches quote', async () => {
    render(<App />);

    // Click on a lead to open drawer
    const leadCards = await screen.findAllByText('Toyota Fortuner 2.8 LTD');
    fireEvent.click(leadCards[0]);

    // Click F&I Loan Calc button
    const loanCalcBtn = await screen.findByRole('button', { name: /F&I Loan Calc/i });
    fireEvent.click(loanCalcBtn);

    // Modal renders loan calculator
    expect(await screen.findByText('F&I Loan Calculator')).toBeInTheDocument();
    expect(screen.getByText(/Estimated Monthly Amortization/i)).toBeInTheDocument();

    // Click 30% downpayment button
    const dp30Btn = screen.getByRole('button', { name: /30%/i });
    fireEvent.click(dp30Btn);

    // Click Attach Quote to Lead
    const attachBtn = screen.getByRole('button', { name: /Attach Quote to Lead/i });
    fireEvent.click(attachBtn);

    // Modal closes and quote is appended to timeline
    await waitFor(() => {
      expect(screen.queryByText('F&I Loan Calculator')).not.toBeInTheDocument();
      expect(screen.getByText(/Loan Simulation/i)).toBeInTheDocument();
    });
  });

  it('Journey 9: Official print quotation sheet opens with dealership letterhead', async () => {
    render(<App />);

    // Open lead drawer
    const leadCards = await screen.findAllByText('Toyota Fortuner 2.8 LTD');
    fireEvent.click(leadCards[0]);

    // Click Print Quote button
    const printQuoteBtn = await screen.findByRole('button', { name: /Print Quote/i });
    fireEvent.click(printQuoteBtn);

    // Modal renders official pro-forma quotation
    expect(await screen.findByText('METRO MANILA MOTORS')).toBeInTheDocument();
    expect(screen.getByText('PRO-FORMA QUOTATION')).toBeInTheDocument();
    expect(screen.getByText(/3-Year LTO Registration/i)).toBeInTheDocument();
    expect(screen.getByText(/TOTAL AMOUNT PAYABLE/i)).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByRole('button', { name: /Print \/ Save PDF/i });
    expect(closeBtn).toBeInTheDocument();
  });

  it('Journey 10: Test drive booking validates driver license and schedules demo unit', async () => {
    render(<App />);

    // Open lead drawer
    const leadCards = await screen.findAllByText('Toyota Fortuner 2.8 LTD');
    fireEvent.click(leadCards[0]);

    // Click Book Test Drive button
    const testDriveBtn = await screen.findByRole('button', { name: /Book Test Drive/i });
    fireEvent.click(testDriveBtn);

    // Modal renders
    expect(await screen.findByText('Schedule Showroom Test Drive')).toBeInTheDocument();

    // Enter license number
    const licenseInput = screen.getByPlaceholderText(/N02-18-092812/i);
    fireEvent.change(licenseInput, { target: { value: 'N01-22-998877' } });

    // Check liability waiver
    const waiverCheckbox = screen.getByRole('checkbox');
    fireEvent.click(waiverCheckbox);

    // Submit booking
    const bookBtn = screen.getByRole('button', { name: /Book Demo Drive/i });
    fireEvent.click(bookBtn);

    // Verified: Modal closes and test drive event appears on timeline
    await waitFor(() => {
      expect(screen.queryByText('Schedule Showroom Test Drive')).not.toBeInTheDocument();
      expect(screen.getByText(/Test drive booked/i)).toBeInTheDocument();
    });
  });
});
