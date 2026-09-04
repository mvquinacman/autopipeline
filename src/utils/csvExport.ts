import type { Lead } from '../types/crm';

export function exportLeadsToCsv(leads: Lead[], filename = 'autopipeline-leads.csv'): void {
  const headers = [
    'Lead ID',
    'Customer Name',
    'Phone Number',
    'Email Address',
    'Model Interest',
    'Estimated Value (PHP)',
    'Current Stage',
    'Status',
    'Follow-up Due',
    'Assigned Agent',
    'Created At',
  ];

  const rows = leads.map((lead) => [
    lead.id,
    `"${lead.customerName.replace(/"/g, '""')}"`,
    `"${lead.customerPhone}"`,
    `"${lead.customerEmail || ''}"`,
    `"${lead.modelInterest.replace(/"/g, '""')}"`,
    lead.estValue,
    lead.stage,
    lead.status,
    lead.followUpDue || '',
    `"${lead.agentName.replace(/"/g, '""')}"`,
    lead.createdAt,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
