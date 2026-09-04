import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import App from '../App';
import { leadService } from '../services/leadService';
import { tradeInService } from '../services/tradeInService';
import { authService } from '../services/authService';
import { upSystemService } from '../services/upSystemService';
import { inventoryService } from '../services/inventoryService';

describe('AutoPipeline - End-to-End User Journey Verification', () => {
  beforeEach(() => {
    authService.clearSession();
    leadService.resetMockStore();
    tradeInService.resetMockStore();
    upSystemService.resetMockStore();
    inventoryService.resetMockStore();
    const defaultProfile = authService.getProfiles()[0];
    authService.saveSession(authService.createSession(defaultProfile));
  });

  it('Journey 1: Dealership shell renders and enforces role-based scoping ladder', async () => {
    render(<App />);

    // Header and core signatures are visible
    expect(screen.getByText('AutoPipeline')).toBeInTheDocument();
    expect(screen.getByText('Metro Manila Motors — BGC Showroom')).toBeInTheDocument();

    // Default agent is Paolo Morales (role: agent)
    expect(screen.getByText('Paolo Morales')).toBeInTheDocument();
    expect(screen.getByText('Monthly Target')).toBeInTheDocument();

    // Default active profile is Agent Paolo Morales (7 leads scoped)
    expect(screen.getByText(/All Scoped Leads/)).toHaveTextContent('(7)');

    // Switch role to Manager: Rafael Alcantara (14 team leads scoped)
    const managerBtn = screen.getByRole('button', { name: /Rafael Alcantara/i });
    fireEvent.click(managerBtn);

    await waitFor(() => {
      expect(screen.getByText(/All Scoped Leads/)).toHaveTextContent('(14)');
      expect(screen.getByText('Team Alpha Performance')).toBeInTheDocument();
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
    const mainNav = screen.getByRole('navigation', { name: /Main Navigation/i });

    // Switch to Follow-ups tab
    const followUpsTab = within(mainNav).getByRole('button', { name: /Follow-ups/i });
    fireEvent.click(followUpsTab);

    // Follow-ups Hub rendered
    expect(await screen.findByText(/Active Tasks/i)).toBeInTheDocument();

    // Switch to Analytics tab
    const analyticsTab = within(mainNav).getByRole('button', { name: /Analytics/i });
    fireEvent.click(analyticsTab);

    // Analytics Funnel rendered
    expect(await screen.findByText('7-Stage Dealership Conversion Funnel')).toBeInTheDocument();
    expect(screen.getByText('Deal Loss Rationale & Leakage')).toBeInTheDocument();
    expect(screen.getByText('Top Vehicle Model Demand')).toBeInTheDocument();

    // Return to Pipeline
    const pipelineTab = within(mainNav).getByRole('button', { name: /Pipeline/i });
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
    const mainNav = screen.getByRole('navigation', { name: /Main Navigation/i });
    fireEvent.click(within(mainNav).getByRole('button', { name: /Follow-ups/i }));

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
    const mainNav = screen.getByRole('navigation', { name: /Main Navigation/i });
    const boardTab = within(mainNav).getByRole('button', { name: /Kanban Board/i });
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

  it('Journey 11: Viber outreach script modal generates customized scripts and logs event', async () => {
    render(<App />);

    // Open lead drawer
    const leadCards = await screen.findAllByText('Toyota Fortuner 2.8 LTD');
    fireEvent.click(leadCards[0]);

    // Click Viber / SMS button
    const viberBtn = await screen.findByRole('button', { name: /Viber \/ SMS/i });
    fireEvent.click(viberBtn);

    // Modal renders
    expect(await screen.findByText(/Viber & SMS Outreach Script/i)).toBeInTheDocument();
    expect(screen.getByText(/1\. Showroom Visit Follow-up/i)).toBeInTheDocument();

    // Select financing promo template
    const financeTemplateBtn = screen.getByRole('button', { name: /2\. Bank Loan Pre-Approval/i });
    fireEvent.click(financeTemplateBtn);

    // Click Log Outreach Event
    const logBtn = screen.getByRole('button', { name: /Log Outreach Event/i });
    fireEvent.click(logBtn);

    // Modal closes and activity is logged to audit trail
    await waitFor(() => {
      expect(screen.queryByText(/Viber & SMS Outreach Script/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Sent Viber\/SMS Outreach: "Bank Financing Promotion"/i)).toBeInTheDocument();
    });
  });

  it('Journey 12: CSV export button triggers file download for active role pipeline', async () => {
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    window.URL.createObjectURL = mockCreateObjectURL;
    const appendSpy = vi.spyOn(document.body, 'appendChild');

    render(<App />);

    // Agent role cannot export CSV
    expect(screen.queryByRole('button', { name: /Export CSV/i })).not.toBeInTheDocument();

    // Switch to Manager (Rafael Alcantara) who has lead:export permission
    const managerBtn = screen.getByRole('button', { name: /Rafael Alcantara/i });
    fireEvent.click(managerBtn);

    const exportBtn = await screen.findByRole('button', { name: /Export CSV/i });
    fireEvent.click(exportBtn);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(appendSpy).toHaveBeenCalled();
  });

  it('Journey 13: Mobile Agent Chrome renders bottom navigation and FAB triggers lead intake', async () => {
    render(<App />);

    // Check Mobile Navigation bar exists with landmark
    const mobileNav = screen.getByRole('navigation', { name: /Mobile Navigation/i });
    expect(mobileNav).toBeInTheDocument();

    // Check Mobile FAB exists
    const fabBtn = screen.getByRole('button', { name: /Add new lead/i });
    expect(fabBtn).toBeInTheDocument();

    // Clicking FAB opens Add New Lead modal
    fireEvent.click(fabBtn);
    expect(await screen.findByRole('heading', { name: /Add New Lead/i })).toBeInTheDocument();

    // Cancel modal
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Add New Lead/i })).not.toBeInTheDocument();
    });
  });

  it('Journey 14: Used Car Appraisal Desk evaluates trade-in, calculates net equity, and credits F&I financing', async () => {
    render(<App />);

    // Open lead drawer for Maria Santos (Toyota Fortuner)
    const leadCards = await screen.findAllByText('Toyota Fortuner 2.8 LTD');
    fireEvent.click(leadCards[0]);

    expect(await screen.findByText('Lead Inspector')).toBeInTheDocument();

    // Check preseeded Trade-In Card is visible in Lead Detail Drawer
    expect(screen.getByText(/2020 Toyota Vios 1.3 E AT/i)).toBeInTheDocument();
    expect(screen.getByText(/Plate \*\*\*4 \(Tuesday\)/i)).toBeInTheDocument();
    expect(screen.getByText('₱330,000')).toBeInTheDocument();

    // Open Trade-In Appraisal Desk Modal
    const tradeInDeskBtn = screen.getByRole('button', { name: /Trade-In Desk/i });
    fireEvent.click(tradeInDeskBtn);

    expect(await screen.findByRole('heading', { name: /Trade-In Appraisal Desk/i })).toBeInTheDocument();

    // Update appraised value and loan payoff
    const grossValInput = screen.getByDisplayValue('450000');
    fireEvent.change(grossValInput, { target: { value: '550000' } });

    const loanInput = screen.getByDisplayValue('120000');
    fireEvent.change(loanInput, { target: { value: '150000' } });

    // Net Trade-In Equity is 550,000 - 150,000 = 400,000
    expect(screen.getByText('₱400,000')).toBeInTheDocument();

    // Save Appraisal
    const saveBtn = screen.getByRole('button', { name: /Save Appraisal & Apply Credit/i });
    fireEvent.click(saveBtn);

    // Modal closes and Lead Detail Drawer updates with ₱400,000 net equity
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Trade-In Appraisal Desk/i })).not.toBeInTheDocument();
    });
    expect(screen.getByText('₱400,000')).toBeInTheDocument();

    // Open F&I Loan Calculator to verify trade-in equity credit applied
    const loanCalcBtn = screen.getByRole('button', { name: /F&I Loan Calc/i });
    fireEvent.click(loanCalcBtn);

    expect(await screen.findByRole('heading', { name: /F&I Loan Calculator/i })).toBeInTheDocument();
    expect(screen.getByText(/Less Trade-In Equity:/i)).toBeInTheDocument();
    expect(screen.getByText('-₱400,000')).toBeInTheDocument();
    expect(screen.getByText(/Net Drive-Away Cash Outlay:/i)).toBeInTheDocument();

    // Attach quote to lead
    const attachQuoteBtn = screen.getByRole('button', { name: /Attach Quote to Lead/i });
    fireEvent.click(attachQuoteBtn);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /F&I Loan Calculator/i })).not.toBeInTheDocument();
    });

    // Check audit trail recorded quote with trade-in credit
    expect(screen.getByText(/Trade-In Credit: -₱400K/i)).toBeInTheDocument();
  });

  it('Journey 15: User Authentication Hierarchy enforces RBAC and Showroom Terminal Auth Modal switches profiles', async () => {
    render(<App />);

    // 1. Initially Agent (Paolo Morales) is active
    expect(screen.getByText('Paolo Morales')).toBeInTheDocument();

    // 2. Open Lead Drawer - Agent cannot reassign lead
    const leadCards = await screen.findAllByText('Toyota Fortuner 2.8 LTD');
    fireEvent.click(leadCards[0]);
    expect(await screen.findByText('Lead Inspector')).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /Reassign lead/i })).not.toBeInTheDocument();

    // 3. Open Showroom Terminal Auth modal via Lock button
    const lockBtn = screen.getByRole('button', { name: /Open terminal authentication/i });
    fireEvent.click(lockBtn);

    const heading = await screen.findByRole('heading', { name: /Showroom Terminal Auth/i });
    const authModal = heading.closest('div.bg-card') as HTMLElement;

    // 4. Select Rafael Alcantara (Manager) inside modal
    const rafaelCard = within(authModal).getByText('Rafael Alcantara');
    fireEvent.click(rafaelCard);

    // Enter valid manager PIN: 3333
    const pinInput = screen.getByPlaceholderText(/e\.g\. 3333/i);
    fireEvent.change(pinInput, { target: { value: '3333' } });

    const authBtn = screen.getByRole('button', { name: /Authenticate & Switch/i });
    fireEvent.click(authBtn);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Showroom Terminal Auth/i })).not.toBeInTheDocument();
    });

    // 5. Now Manager is active and Reassign dropdown is visible
    expect(screen.getByRole('combobox', { name: /Reassign lead/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument();
  });

  it('Journey 16: Showroom Floor Board rotates up-system queue and assigns walk-in traffic', async () => {
    render(<App />);
    const mainNav = screen.getByRole('navigation', { name: /Main Navigation/i });

    // 1. Navigate to Floor Board
    const floorTab = within(mainNav).getByRole('button', { name: /Floor Board/i });
    fireEvent.click(floorTab);

    // Floor Board view renders
    expect(await screen.findByRole('heading', { name: /Showroom Floor Board/i })).toBeInTheDocument();
    expect(screen.getByText(/Active Floor Rotation Queue/i)).toBeInTheDocument();

    // 2. Initial Up-Rotation Queue: Paolo Morales is #1 UP NEXT
    expect(screen.getByText('Consultant Up Next')).toBeInTheDocument();
    expect(screen.getAllByText('Paolo Morales').length).toBeGreaterThan(0);

    // 3. Open Log Showroom Walk-In Modal
    const logWalkInBtn = screen.getByRole('button', { name: /Log Showroom Walk-In/i });
    fireEvent.click(logWalkInBtn);

    const modalTitle = await screen.findByRole('heading', { name: /Log Showroom Walk-In/i });
    const modal = modalTitle.closest('div.bg-card') as HTMLElement;
    expect(within(modal).getAllByText(/Paolo Morales/i).length).toBeGreaterThanOrEqual(1);

    // 4. Fill in prospect details
    const nameInput = within(modal).getByPlaceholderText(/e\.g\. Eduardo Ramos/i);
    const phoneInput = within(modal).getByPlaceholderText(/\+63 917 555 9876/i);
    const modelInput = within(modal).getByPlaceholderText(/e\.g\. Toyota Land Cruiser Prado/i);

    fireEvent.change(nameInput, { target: { value: 'Eduardo Ramos' } });
    fireEvent.change(phoneInput, { target: { value: '0917-888-9999' } });
    fireEvent.change(modelInput, { target: { value: 'Toyota Land Cruiser Prado' } });

    // Submit consultation
    const assignBtn = within(modal).getByRole('button', { name: /Assign to Paolo Morales/i });
    fireEvent.click(assignBtn);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Log Showroom Walk-In/i })).not.toBeInTheDocument();
    });

    // 5. Verify rotation & active consultation
    // Camille Dizon should now be up next in queue
    expect(screen.getAllByText('Camille Dizon').length).toBeGreaterThan(0);
    // Eduardo Ramos should be in Active Client Consultations
    expect(screen.getByText('Active Client Consultations')).toBeInTheDocument();
    expect(screen.getAllByText('Eduardo Ramos').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Toyota Land Cruiser Prado').length).toBeGreaterThanOrEqual(1);

    // 6. Complete Consultation and return consultant to queue
    const completeBtn = screen.getByRole('button', { name: /Complete & Return to Queue/i });
    fireEvent.click(completeBtn);

    // Active consultations should clear
    await waitFor(() => {
      expect(screen.queryByText('Active Client Consultations')).not.toBeInTheDocument();
    });

    // Paolo Morales is returned to the queue
    expect(screen.getAllByText('Paolo Morales').length).toBeGreaterThan(0);
  });

  it('Journey 17: Vehicle Stock Matrix tracks fleet inventory, filters aged units, and allocates 48-hour VIN hold in Lead Drawer', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<App />);
    const mainNav = screen.getByRole('navigation', { name: /Main Navigation/i });

    // 1. Navigate to Stock Matrix tab
    const stockTab = within(mainNav).getByRole('button', { name: /Stock Matrix/i });
    fireEvent.click(stockTab);

    // Stock Matrix view renders
    expect(await screen.findByRole('heading', { name: /Vehicle Stock Matrix/i })).toBeInTheDocument();
    expect(screen.getByText('Total Inventory')).toBeInTheDocument();
    expect(screen.getByText('Available In-Stock')).toBeInTheDocument();
    expect(screen.getByText('48-Hr Holds')).toBeInTheDocument();

    // 2. Filter by Aged Stock (>60d)
    const agedTab = screen.getByRole('button', { name: /Aged Stock/i });
    fireEvent.click(agedTab);

    expect(screen.getByText('Vios 1.5 G')).toBeInTheDocument();
    expect(screen.getByText(/68d on lot/i)).toBeInTheDocument();

    // 3. Navigate back to Pipeline tab
    const pipelineTab = within(mainNav).getByRole('button', { name: /Pipeline/i });
    fireEvent.click(pipelineTab);
    expect(await screen.findByText('All Scoped Leads')).toBeInTheDocument();

    // 4. Open Maria Santos lead drawer (Fortuner 2.8 LTD)
    const leadCards = await screen.findAllByText('Toyota Fortuner 2.8 LTD');
    fireEvent.click(leadCards[0]);
    expect(await screen.findByText('Lead Inspector')).toBeInTheDocument();

    // Vehicle stock card starts unallocated
    expect(screen.getByText(/Vehicle Stock & 48-Hr Hold/i)).toBeInTheDocument();
    expect(screen.getByText(/NO VIN ALLOCATED/i)).toBeInTheDocument();

    // 5. Open Allocate VIN / Hold modal
    const allocateBtn = screen.getByRole('button', { name: /Allocate VIN \/ Hold/i });
    fireEvent.click(allocateBtn);

    const modalHeading = await screen.findByRole('heading', { name: /Allocate VIN & 48-Hour Hold/i });
    const modal = modalHeading.closest('div.bg-card') as HTMLElement;
    expect(within(modal).getByText(/Platinum White Pearl/i)).toBeInTheDocument();

    // Select the Platinum White Pearl Fortuner
    const unitOption = within(modal).getByText(/Platinum White Pearl/i);
    fireEvent.click(unitOption);

    // Confirm hold
    const confirmBtn = within(modal).getByRole('button', { name: /Confirm 48-Hr Hold & Allocate/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Allocate VIN & 48-Hour Hold/i })).not.toBeInTheDocument();
    });

    // 6. Verify drawer now reflects active hold
    expect(screen.getByText(/48-HR HOLD ACTIVE/i)).toBeInTheDocument();
    expect(screen.getAllByText(/VIN: MR0BA3CD4P1000001/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Deposit: ₱20,000/i).length).toBeGreaterThanOrEqual(1);

    // 7. Release hold
    const releaseBtn = screen.getByRole('button', { name: /Release Hold/i });
    fireEvent.click(releaseBtn);

    await waitFor(() => {
      expect(screen.getByText(/NO VIN ALLOCATED/i)).toBeInTheDocument();
    });
  });

  it('Journey 18: Dedicated Landing Page displays showroom gateway, authenticates via PIN, and signs out', async () => {
    // 1. Clear session to force unauthenticated landing page
    authService.clearSession();
    render(<App />);

    // 2. Landing Page is rendered
    expect(await screen.findByText('Showroom Floor Operations Terminal')).toBeInTheDocument();
    expect(screen.getByText('Automotive Dealership Sales Operating System')).toBeInTheDocument();
    expect(screen.getByText('BGC Sales Cloud Online')).toBeInTheDocument();

    // Consultant profiles are displayed on floor terminal
    expect(screen.getByText('Showroom PIN Terminal')).toBeInTheDocument();
    expect(screen.getAllByText('Paolo Morales').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Camille Dizon').length).toBeGreaterThanOrEqual(1);

    // 3. Select Paolo Morales and enter PIN 1111 via keypad
    const paoloBtn = screen.getByRole('button', { name: /Paolo Morales/i });
    fireEvent.click(paoloBtn);

    // Press keypad 1, 1, 1, 1
    const oneBtns = screen.getAllByRole('button', { name: '1' });
    const oneKeypadBtn = oneBtns[0];
    fireEvent.click(oneKeypadBtn);
    fireEvent.click(oneKeypadBtn);
    fireEvent.click(oneKeypadBtn);
    fireEvent.click(oneKeypadBtn);

    // Click Unlock Dealership Terminal
    const unlockBtn = screen.getByRole('button', { name: /Unlock Dealership Terminal/i });
    fireEvent.click(unlockBtn);

    // 4. Authenticated dashboard renders
    expect(await screen.findByText('All Scoped Leads')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();

    // 5. Sign out / Lock terminal
    const signOutBtn = screen.getByRole('button', { name: /Sign Out/i });
    fireEvent.click(signOutBtn);

    // 6. Returned to Landing Page
    expect(await screen.findByText('Showroom Floor Operations Terminal')).toBeInTheDocument();
  });
});
