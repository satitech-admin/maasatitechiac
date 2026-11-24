import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.119.0';

const db = createClient('https://ylobnofwmryltbzdtkla.supabase.co', 'sb_publishable_YqLFRfMUlW5hzTOh_50hQQ_Ntr0pYa9');
const byId = id => document.getElementById(id);
const status = byId('admin-status');
const records = byId('admin-records');
const fields = 'reference,created_at,student,grade,school,city,district,state,guardian,mobile,email,experience,remarks,status,notes,verified_at';
const filters = ['admin-class', 'admin-school', 'admin-state'].map(byId);
let rows = [];

function selectedRows() {
  const [grade, school, state] = filters.map(field => field.value.trim().toLowerCase());
  return rows.filter(row => (!grade || row.grade === grade) &&
    (!school || row.school.toLowerCase().includes(school)) && (!state || row.status === state));
}

function cell(row, ...lines) {
  const element = row.insertCell();
  for (const line of lines) {
    const paragraph = document.createElement('p');
    paragraph.textContent = line;
    element.append(paragraph);
  }
  return element;
}

function render() {
  const selected = selectedRows();
  byId('admin-count').textContent = `${selected.length} of ${rows.length} registrations`;
  const body = byId('admin-rows');
  body.replaceChildren();
  for (const record of selected) {
    const row = body.insertRow();
    cell(row, record.student, `Class ${record.grade} · ${record.school}`, [record.city, record.district, record.state].join(', '), `Coding: ${record.experience}`, record.remarks, record.reference);
    cell(row, record.guardian, record.mobile, record.email);
    cell(row, record.status, new Date(record.created_at).toLocaleString('en-IN', {timeZone:'Asia/Kolkata'}),
      record.verified_at ? `Verified ${new Date(record.verified_at).toLocaleDateString('en-IN', {timeZone:'Asia/Kolkata'})}` : '');
    const review = cell(row);
    const label = document.createElement('label');
    label.textContent = 'Internal notes';
    const notes = document.createElement('textarea');
    notes.value = record.notes;
    notes.maxLength = 1000;
    label.append(notes);
    review.append(label);

    const actions = {notes: 'Save notes'};
    if (record.status === 'pending') actions.verify = 'Record verified consent';
    if (record.status === 'verified') actions.approve = 'Approve';
    if (['pending', 'verified'].includes(record.status)) actions.decline = 'Decline';

    for (const [action, title] of Object.entries(actions)) {
      const button = document.createElement('button');
      button.textContent = title;
      button.type = 'button';
      button.addEventListener('click', async () => {
        if (action === 'verify' && notes.value.trim().length < 20) {
          status.textContent = 'Enter at least 20 characters describing the independent verification.';
          notes.focus();
          return;
        }
        if (action !== 'notes' && !window.confirm(`${title} for this registration?`)) return;
        for (const control of review.querySelectorAll('button')) control.disabled = true;
        status.textContent = 'Saving review…';
        const result = await db.rpc('iac_december_review', {
          p_reference: record.reference, p_action: action, p_notes: notes.value
        });
        if (result.error) {
          status.textContent = 'Review could not be saved. Refresh and check the application status before retrying.';
          for (const control of review.querySelectorAll('button')) control.disabled = false;
          return;
        }
        await load();
      });
      review.append(button);
    }
  }
}

async function load() {
  const refresh = byId('admin-refresh');
  refresh.disabled = true;
  status.textContent = 'Checking administrator access…';
  byId('admin-sign-in').hidden = true;
  records.hidden = true;
  rows = [];
  byId('admin-rows').replaceChildren();
  try {
    const auth = await db.auth.getUser();
    if (!auth.data.user || auth.error) {
      byId('admin-sign-in').hidden = false;
      status.textContent = 'Sign in to access this workspace.';
      return;
    }
    const admin = await db.rpc('iac_is_admin');
    if (admin.error || admin.data !== true) {
      status.textContent = 'Verified administrator access required.';
      return;
    }
    const loaded = [];
    const size = 200;
    for (let offset = 0; ; offset += size) {
      const result = await db.from('iac_december_registrations').select(fields)
        .order('created_at', {ascending:false}).order('reference').range(offset, offset + size - 1);
      if (result.error) throw result.error;
      loaded.push(...result.data);
      if (result.data.length < size) break;
    }
    rows = loaded;
    render();
    records.hidden = false;
    status.textContent = 'Authorized administrator view';
  } catch {
    status.textContent = 'Registrations could not be loaded. Try again.';
  } finally {
    refresh.disabled = false;
  }
}

function csvCell(value) {
  const input = String(value ?? '');
  const safe = /^[\s\uFEFF]*[=+\-@]|^[\t\r\n]/.test(input) ? "'" + input : input;
  return '"' + safe.replaceAll('"', '""') + '"';
}

byId('admin-export').addEventListener('click', () => {
  const columns = fields.split(',');
  const csv = [columns, ...selectedRows().map(row => columns.map(column => row[column]))]
    .map(line => line.map(csvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'december-bootcamp-registrations.csv';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

for (const field of filters) field.addEventListener('input', render);
byId('admin-refresh').addEventListener('click', load);
load();
