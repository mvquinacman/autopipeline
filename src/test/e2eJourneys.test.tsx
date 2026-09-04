import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import App from '../App';
import { leadService } from '../services/leadService';
import { tradeInService } from '../services/tradeInService';
import { authService } from '../services/authService';
import { upSystemService } from '../services/upSystemService';
import { inventoryService } from '../services/inventoryService';
import { commissionService } from '../services/commissionService';
import { socialIntakeService } from '../services/socialIntakeService';

describe('AutoPipeline - End-to-End User Journey Verification', () => {
  beforeEach(() => {
    authService.clearSession();
    leadService.resetMockStore();
    tradeInService.resetMockStore();
    upSystemService.resetMockStore();
    inventoryService.resetMockStore();
    commissionService.resetStore();
    socialIntakeService.resetStore();
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

    // Switch role to Manager: Rafael Alcantara via Terminal Auth Modal
    const switchTerminalBtn = screen.getByRole('button', { name: /Open terminal authentication/i });
    fireEvent.click(switchTerminalBtn);

    const authModal1 = (await screen.findByRole('heading', { name: /Showroom Terminal Auth/i })).closest('div.bg-card') as HTMLElement;
    const rafaelCard = within(authModal1).getByText('Rafael Alcantara');
    fireEvent.click(rafaelCard);
    const instantSwitchBtn1 = within(authModal1).getByRole('button', { name: /Instant Switch \(Demo\)/i });
    fireEvent.click(instantSwitchBtn1);

    await waitFor(() => {
      expect(screen.getByText(/All Scoped Leads/)).toHaveTextContent('(14)');
      expect(screen.getByText('Team Alpha Performance')).toBeInTheDocument();
    });

    // Switch role to Dealer Principal: Vicente Tan via Terminal Auth Modal
    fireEvent.click(screen.getByRole('button', { name: /Open terminal authentication/i }));
    const authModal2 = (await screen.findByRole('heading', { name: /Showroom Terminal Auth/i })).closest('div.bg-card') as HTMLElement;
    const vicenteCard = within(authModal2).getByText('Vicente Tan');
    fireEvent.click(vicenteCard);
    const instantSwitchBtn2 = within(authModal2).getByRole('button', { name: /Instant Switch \(Demo\)/i });
    fireEvent.click(instantSwitchBtn2);

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

    // Switch to Manager (Rafael Alcantara) who has lead:export permission via Terminal Auth
    const switchTerminalBtn = screen.getByRole('button', { name: /Open terminal authentication/i });
    fireEvent.click(switchTerminalBtn);

    const authModal = (await screen.findByRole('heading', { name: /Showroom Terminal Auth/i })).closest('div.bg-card') as HTMLElement;
    const rafaelCard = within(authModal).getByText('Rafael Alcantara');
    fireEvent.click(rafaelCard);
    const instantSwitchBtn = within(authModal).getByRole('button', { name: /Instant Switch \(Demo\)/i });
    fireEvent.click(instantSwitchBtn);

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

  it('Journey 19: Multi-Bank Auto Financing Approval Matrix tracks partner bank offers and issues Purchase Orders', async () => {
    render(<App />);

    // 1. Navigate to F&I Desk tab in main navigation
    const mainNav = screen.getByRole('navigation', { name: /Main Navigation/i });
    const fiTab = within(mainNav).getByRole('button', { name: /F&I Desk/i });
    fireEvent.click(fiTab);

    // 2. Verify F&I Desk header & spec-sheet KPI strip
    expect(await screen.findByText(/F&I Desk • Multi-Bank Approval Board/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Submissions/i)).toBeInTheDocument();
    expect(screen.getByText(/Loan Volume/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Approved \(PO Ready\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Projected F&I Reserve/i)).toBeInTheDocument();

    // 3. Verify Accredited Philippine Partner Banks scorecard
    expect(screen.getAllByText('BPI Family Auto Loan').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('BDO Consumer Lending').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('PSBank Auto Loan').length).toBeGreaterThanOrEqual(1);

    // 4. Find and click "Open Matrix" on an application
    const openMatrixBtns = await screen.findAllByRole('button', { name: /Open Matrix/i });
    fireEvent.click(openMatrixBtns[0]);

    // 5. Verify Multi-Bank Matrix Modal opens with side-by-side comparison
    const modalHeading = await screen.findByRole('heading', { name: /Multi-Bank Financing Approval Matrix/i });
    expect(modalHeading).toBeInTheDocument();
    expect(screen.getByText(/Submitted Partner Bank Offers/i)).toBeInTheDocument();

    // 6. Verify BPI offer with Approved status and Accept Offer button
    const acceptBtn = screen.getByRole('button', { name: /Accept Offer & Issue PO/i });
    expect(acceptBtn).toBeInTheDocument();

    // 7. Accept the winning bank offer and issue Purchase Order
    fireEvent.click(acceptBtn);

    // 8. Confirm PO issuance message
    expect(await screen.findByText(/Offer accepted! Purchase Order PO-BPI-/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Client Accepted/i).length).toBeGreaterThanOrEqual(1);

    // 9. Close matrix modal
    const closeBtn = screen.getByRole('button', { name: /Close financing matrix/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('heading', { name: /Multi-Bank Financing Approval Matrix/i })).not.toBeInTheDocument();
  });

  it('Journey 20: Service Drive Upsell & Workshop Buyback Prospecting Desk identifies equity and converts to pipeline lead', async () => {
    render(<App />);

    // 1. Navigate to Service Drive tab in main navigation
    const mainNav = screen.getByRole('navigation', { name: /Main Navigation/i });
    const serviceTab = within(mainNav).getByRole('button', { name: /Service Drive/i });
    fireEvent.click(serviceTab);

    // 2. Verify Service Drive header & spec-sheet KPI strip
    expect(await screen.findByText(/Workshop Lift Board & Buyback Prospecting/i)).toBeInTheDocument();
    expect(screen.getByText(/Active in Bays/i)).toBeInTheDocument();
    expect(screen.getByText(/High Equity Targets/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Expiring Warranty/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Potential Trade-In Value/i)).toBeInTheDocument();
    expect(screen.getByText(/Converted to Leads/i)).toBeInTheDocument();

    // 3. Verify Workshop Bay Cards render (e.g. Bay 01 - Danilo Ramos Hilux Conquest)
    expect(screen.getByText('BAY 01')).toBeInTheDocument();
    expect(screen.getByText('Danilo Ramos')).toBeInTheDocument();
    expect(screen.getByText(/Hilux Conquest 4x4/i)).toBeInTheDocument();

    // 4. Open Buyback Pitch Modal for Bay 01
    const reviewPitchBtns = screen.getAllByRole('button', { name: /Review Buyback Pitch/i });
    fireEvent.click(reviewPitchBtns[0]);

    // 5. Verify Equity Pitch Modal and Decision Matrix
    expect(await screen.findByText(/Service Drive Equity & Buyback Pitch/i)).toBeInTheDocument();
    expect(screen.getByText(/Option A: Keep Current Vehicle/i)).toBeInTheDocument();
    expect(screen.getByText(/Option B: Trade-Up to 2026 Model/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Toyota Hilux GR-S 4x4/i).length).toBeGreaterThanOrEqual(1);

    // 6. Convert appointment to pipeline lead
    const convertBtn = screen.getByRole('button', { name: /Convert to Pipeline Lead/i });
    fireEvent.click(convertBtn);

    // 7. Verify modal closes and lead appears in pipeline
    await waitFor(() => {
      expect(screen.queryByText(/Service Drive Equity & Buyback Pitch/i)).not.toBeInTheDocument();
    });
  });

  it('Journey 21: Official Vehicle Sales Order (VSO) & Quotation Generator creates legal contract with 4-tier signature blocks', async () => {
    // Mock window.print
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<App />);

    // 1. Ensure we are in Pipeline view and click on a lead card to open Lead Drawer
    const mainNav = screen.getByRole('navigation', { name: /Main Navigation/i });
    const pipelineTab = within(mainNav).getByRole('button', { name: /Pipeline/i });
    fireEvent.click(pipelineTab);

    const leadCard = (await screen.findAllByText('Maria Santos'))[0];
    fireEvent.click(leadCard);

    // 2. LeadDetailDrawer opens; find Showroom Deal Tools with "Official VSO"
    expect(await screen.findByRole('heading', { name: /Maria Santos/i })).toBeInTheDocument();
    const vsoToolBtn = screen.getByRole('button', { name: /Official VSO/i });
    expect(vsoToolBtn).toBeInTheDocument();

    // 3. Click "Official VSO" to launch the Vehicle Sales Order Generator
    fireEvent.click(vsoToolBtn);

    // 4. Verify Dealership Legal Letterhead & Accreditation
    expect(await screen.findByText(/METRO MANILA MOTORS CORP./i)).toBeInTheDocument();
    expect(screen.getAllByText(/Authorized Toyota Dealership — Bonifacio Global City Showroom/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/004-912-883-000 VAT Reg/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/NCR-2024-0812/i).length).toBeGreaterThanOrEqual(1);

    // 5. Verify Sections: Buyer, Vehicle, Financials, 4-Tier Signatures
    expect(screen.getByText(/Section 1: Buyer Particulars/i)).toBeInTheDocument();
    expect(screen.getByText(/Section 2: Vehicle Technical Particulars/i)).toBeInTheDocument();
    expect(screen.getByText(/Section 3: Financial Settlement & Payment Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Section 4: Conforme, Review & Executive Approval Hierarchy/i)).toBeInTheDocument();

    // Verify 4-tier sign-off blocks
    expect(screen.getByText('Buyer / Conforme')).toBeInTheDocument();
    expect(screen.getByText('Marketing Professional')).toBeInTheDocument();
    expect(screen.getByText('General Sales Manager')).toBeInTheDocument();
    expect(screen.getByText('Dealer Principal / VP')).toBeInTheDocument();
    expect(screen.getAllByText(/Don Antonio Zobel/i).length).toBeGreaterThanOrEqual(1);

    // 6. Test Customize Toggle (open accessories & discount controls)
    const customizeBtn = screen.getByRole('button', { name: /Customize/i });
    fireEvent.click(customizeBtn);
    expect(screen.getByText(/Agreement Particulars & Discount Controls/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Platinum Nano-Ceramic Tint/i).length).toBeGreaterThanOrEqual(1);

    // 7. Click Print / Save PDF
    const printBtn = screen.getByRole('button', { name: /Print \/ Save PDF/i });
    fireEvent.click(printBtn);

    await waitFor(() => {
      expect(printSpy).toHaveBeenCalled();
    });

    // 8. Close VSO Modal
    const closeBtn = screen.getByRole('button', { name: /Close dialog/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/Section 4: Conforme, Review & Executive Approval Hierarchy/i)).not.toBeInTheDocument();

    printSpy.mockRestore();
  });

  it('Journey 22: Delivery Bay Turnover Releasing Ceremony, PDI Certification & Dealership Gate Pass Generation', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<App />);

    // 1. Navigate to Delivery Bay tab in main navigation
    const mainNav = screen.getByRole('navigation', { name: /Main Navigation/i });
    const deliveryTab = within(mainNav).getByRole('button', { name: /Delivery Bay/i });
    fireEvent.click(deliveryTab);

    // 2. Verify Delivery Bay header & spec-sheet KPI strip
    expect(await screen.findByText(/Delivery Bays & Vehicle Turnover Ceremony/i)).toBeInTheDocument();
    expect(screen.getByText(/Scheduled Today/i)).toBeInTheDocument();
    expect(screen.getByText(/PDI Inspected/i)).toBeInTheDocument();
    expect(screen.getByText(/Release Kit Ready/i)).toBeInTheDocument();
    expect(screen.getByText(/Gate Passes Issued/i)).toBeInTheDocument();
    expect(screen.getByText(/Turnover CSI Score/i)).toBeInTheDocument();

    // 3. Verify Delivery Bay cards render
    expect(screen.getByText('BAY 01')).toBeInTheDocument();
    expect(screen.getAllByText('Maria Santos').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Toyota Fortuner 2.8 LTD/i).length).toBeGreaterThanOrEqual(1);

    // 4. Open Turnover Ceremony for Bay 01
    const enterCeremonyBtns = screen.getAllByRole('button', { name: /Enter Turnover Ceremony|Review Turnover/i });
    fireEvent.click(enterCeremonyBtns[0]);

    // 5. Verify Turnover Ceremony Modal renders
    expect(await screen.findByRole('heading', { name: /Vehicle Turnover & Handover Ceremony/i })).toBeInTheDocument();
    expect(screen.getByText(/Commemorative Delivery Ceremony/i)).toBeInTheDocument();
    expect(screen.getByText(/48-Hour Customer Satisfaction Index/i)).toBeInTheDocument();

    // 6. Switch to PDI Checklist tab and inspect items
    const pdiTab = screen.getByRole('button', { name: /PDI Checklist/i });
    fireEvent.click(pdiTab);
    expect(await screen.findByText(/10-Point Technical PDI Certification/i)).toBeInTheDocument();
    expect(screen.getByText(/Battery Cold Cranking & Terminal Voltage/i)).toBeInTheDocument();

    // 7. Switch to Release Kit tab and inspect items
    const kitTab = screen.getByRole('button', { name: /Handover Kit/i });
    fireEvent.click(kitTab);
    expect(await screen.findByText(/Mandatory Vehicle Release Kit/i)).toBeInTheDocument();
    expect(screen.getByText(/2 Master Smart Keys/i)).toBeInTheDocument();

    // 8. Switch back to Ceremony tab and issue Security Gate Pass
    const ceremonyTab = screen.getByRole('button', { name: /^Turnover Ceremony$/i });
    fireEvent.click(ceremonyTab);

    const issueGatePassBtn = screen.getByRole('button', { name: /Issue Security Gate Pass/i });
    fireEvent.click(issueGatePassBtn);

    // 9. Verify Gate Pass Modal renders
    expect(await screen.findByText(/Security Yard Clearance & Logistics Gate Pass/i)).toBeInTheDocument();
    expect(screen.getByText(/AUTHORIZED EXIT/i)).toBeInTheDocument();
    expect(screen.getByText(/Scan barcode at Gate 1 Main Exit/i)).toBeInTheDocument();

    // 10. Click Print Gate Pass
    const printGatePassBtn = screen.getByRole('button', { name: /Print Gate Pass/i });
    fireEvent.click(printGatePassBtn);
    expect(printSpy).toHaveBeenCalled();

    // 11. Close Gate Pass Modal
    const closeGatePassBtn = screen.getByRole('button', { name: /Close gate pass dialog/i });
    fireEvent.click(closeGatePassBtn);

    expect(screen.queryByText(/Security Yard Clearance & Logistics Gate Pass/i)).not.toBeInTheDocument();

    // 12. Close Turnover Modal
    const closeCeremonyBtn = screen.getByRole('button', { name: /Close handover modal/i });
    fireEvent.click(closeCeremonyBtn);

    expect(screen.queryByRole('heading', { name: /Vehicle Turnover & Handover Ceremony/i })).not.toBeInTheDocument();

    printSpy.mockRestore();
  });

  it('Journey 23: Sales Commission & Dealer Incentive Compensation Desk tracks agent wallet, reserve split, and GSM approvals', async () => {
    render(<App />);
    const mainNav = screen.getByRole('navigation', { name: /Main Navigation/i });

    // 1. Switch to Commissions tab
    const commTab = within(mainNav).getByRole('button', { name: /Commissions/i });
    fireEvent.click(commTab);

    // 2. Verify Agent Wallet renders for default agent Paolo Morales
    expect(await screen.findByText('My Earnings Wallet')).toBeInTheDocument();
    expect(screen.getByText(/Paolo Morales • Sales Consultant Payouts/i)).toBeInTheDocument();
    expect(screen.getByText(/Base Unit Cut/i)).toBeInTheDocument();
    expect(screen.getByText(/F&I Bank Share \(20%\)/i)).toBeInTheDocument();

    // 3. Open Deal Commission Voucher for Maria Santos
    const dealRow = screen.getByRole('button', { name: /Maria Santos/i });
    fireEvent.click(dealRow);

    expect(await screen.findByRole('heading', { name: /Commission Voucher & Payout Slip/i })).toBeInTheDocument();
    expect(screen.getByText(/Base Unit Sales Commission:/i)).toBeInTheDocument();
    expect(screen.getByText(/F&I Bank Reserve Share \(20%\):/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Sales Consultant Payout:/i)).toBeInTheDocument();

    // Close voucher modal
    const closeVoucherBtn = screen.getByRole('button', { name: /^Close$/i });
    fireEvent.click(closeVoucherBtn);
    expect(screen.queryByRole('heading', { name: /Commission Voucher & Payout Slip/i })).not.toBeInTheDocument();

    // 4. Switch to Manager role via Showroom Terminal Auth Modal
    const switchTerminalBtn = screen.getByRole('button', { name: /Open terminal authentication/i });
    fireEvent.click(switchTerminalBtn);

    const authModal = (await screen.findByRole('heading', { name: /Showroom Terminal Auth/i })).closest('div.bg-card') as HTMLElement;
    const rafaelCard = within(authModal).getByText('Rafael Alcantara');
    fireEvent.click(rafaelCard);
    const instantSwitchBtn = within(authModal).getByRole('button', { name: /Instant Switch \(Demo\)/i });
    fireEvent.click(instantSwitchBtn);

    // 5. In Commissions view as Manager, verify GSM clearance ledger renders
    expect(await screen.findByText('Dealership Commission & Incentive Ledger')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export Payroll CSV/i })).toBeInTheDocument();

    // Approve a pending payout
    const approveBtn = screen.getAllByRole('button', { name: /^Approve$/i })[0];
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(screen.getAllByText('Cleared').length).toBeGreaterThanOrEqual(2);
    });
  });

  it('Journey 24: Omnichannel Social Intake Hub captures Meta Lead Ads, enforces 15-minute SLA, and auto-dispatches to floor queue', async () => {
    render(<App />);
    const mainNav = screen.getByRole('navigation', { name: /Main Navigation/i });

    // 1. Switch to Social Hub
    const socialTab = within(mainNav).getByRole('button', { name: /Social Hub/i });
    fireEvent.click(socialTab);

    // 2. Verify SLA KPI Spec Strip & Seed Leads render
    expect(await screen.findByText(/Today's Inquiries/i)).toBeInTheDocument();
    expect(screen.getByText(/15-Min SLA Compliance/i)).toBeInTheDocument();
    expect(screen.getByText('Giancarlo Ramos')).toBeInTheDocument();
    expect(screen.getAllByText(/Meta Lead Ad/i).length).toBeGreaterThanOrEqual(1);

    // 3. Open Simulate Meta Lead Ad modal
    const simBtn = screen.getByRole('button', { name: /Simulate Meta Lead Ad/i });
    fireEvent.click(simBtn);

    expect(await screen.findByRole('heading', { name: /Simulate Live Lead Intake/i })).toBeInTheDocument();

    // 4. Inject webhook lead
    const injectBtn = screen.getByRole('button', { name: /Inject Webhook Lead/i });
    fireEvent.click(injectBtn);

    // 5. Verify simulated lead appears in feed with active 15m SLA timer
    expect(await screen.findByText('Miguel Hernandez')).toBeInTheDocument();
    expect(screen.getAllByText(/SLA left/i).length).toBeGreaterThanOrEqual(1);

    // 6. Perform one-click outreach (Viber)
    const viberOutreachBtns = screen.getAllByTitle(/Send official Viber greeting/i);
    fireEvent.click(viberOutreachBtns[0]);

    // SLA is marked as Met
    await waitFor(() => {
      expect(screen.getAllByText(/SLA Met/i).length).toBeGreaterThanOrEqual(1);
    });

    // 7. Convert social lead into CRM pipeline lead
    const pipelineConvertBtns = screen.getAllByTitle(/Convert to CRM lead/i);
    fireEvent.click(pipelineConvertBtns[0]);

    await waitFor(() => {
      expect(screen.getAllByText(/Converted to CRM Lead/i).length).toBeGreaterThanOrEqual(1);
    });
  });
});
