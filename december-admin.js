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
    await loadGoogleRegistrations();
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

const importStatus = byId('google-registration-status');
const importForm = byId('google-registration-import');
const googleRegistrationTable = 'iac_google_registrations';
const paymentStates = {
  pending: 'Pending',
  verified: 'Verified against payment records',
  needs_follow_up: 'Needs follow-up'
};

async function loadGoogleRegistrations() {
  const body = byId('google-registration-list');
  body.replaceChildren();
  const {data, error} = await db.from(googleRegistrationTable)
    .select('id,response_timestamp,student,grade,school,guardian_mobile,payment_status,seat_confirmed_at,notified_at,notification_channel')
    .order('imported_at', {ascending:false}).order('id').limit(200);
  if (error) {
    importStatus.textContent = 'The Google Form review queue could not be loaded.';
    return;
  }
  for (const entry of data) {
    const row = body.insertRow();
    cell(row, entry.student, `Class ${entry.grade} · ${entry.school}`, entry.response_timestamp);
    cell(row, entry.guardian_mobile);
    const review = row.insertCell();
    const select = document.createElement('select');
    select.setAttribute('aria-label', `Payment status for ${entry.student}`);
    for (const [value, label] of Object.entries(paymentStates)) {
      select.add(new Option(label, value, false, entry.payment_status === value));
    }
    select.addEventListener('change', async () => {
      const nextStatus = select.value;
      if (nextStatus === 'verified' && !window.confirm('Confirm you matched the ₹199 payment in institute payment records.')) {
        select.value = entry.payment_status;
        return;
      }
      select.disabled = true;
      const result = await db.from(googleRegistrationTable)
        .update({payment_status: nextStatus}).eq('id', entry.id)
        .eq('payment_status', entry.payment_status).select('id').maybeSingle();
      if (result.error || !result.data) {
        importStatus.textContent = 'Payment status could not be saved. Refresh the queue before retrying.';
        select.value = entry.payment_status;
      } else {
        entry.payment_status = nextStatus;
        await loadGoogleRegistrations();
        importStatus.textContent = 'Payment review saved.';
      }
      select.disabled = false;
    });
    select.disabled = Boolean(entry.seat_confirmed_at);
    review.append(select);
    const next = cell(row,
      entry.seat_confirmed_at ? 'Seat confirmed' : 'Seat pending',
      entry.notified_at ? `Verification message recorded via ${entry.notification_channel.toUpperCase()}` : 'Verification message not recorded');
    const actions = entry.notified_at ? [] : entry.seat_confirmed_at
      ? [['email', 'Record email sent'], ['sms', 'Record SMS sent']]
      : entry.payment_status === 'verified' ? [['confirm', 'Confirm seat']] : [];
    for (const [action, title] of actions) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = title;
      button.addEventListener('click', async () => {
        const message = action === 'confirm'
          ? 'Confirm this seat after checking guardian consent and availability?'
          : `Record that staff already sent the verification message by ${action.toUpperCase()}?`;
        if (!window.confirm(message)) return;
        for (const control of next.querySelectorAll('button')) control.disabled = true;
        try {
          const result = await db.rpc('iac_google_registration_follow_up', {p_id: entry.id, p_action: action});
          if (result.error) throw result.error;
          await loadGoogleRegistrations();
        } catch {
          importStatus.textContent = 'The follow-up could not be saved. Refresh the queue before retrying.';
          for (const control of next.querySelectorAll('button')) control.disabled = false;
        }
      });
      next.append(button);
    }
  }
  importStatus.textContent = data.length === 200 ? 'Showing the 200 most recently imported registrations.' : `${data.length} imported registrations.`;
}

function parseGoogleRegistrationRows(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (!lines.length || lines.length > 200) throw new Error('Paste between 1 and 200 registration rows.');
  return lines.map((line, index) => {
    const columns = line.split('\t').map(value => value.trim());
    const [response_timestamp, student, rawGrade, school, mobile] = columns;
    const grade = rawGrade?.replace(/^class\s*/i, '');
    const guardian_mobile = mobile?.replace(/^\+91\s*/, '').replaceAll(' ', '');
    if (columns.length !== 5 || response_timestamp.length < 5 || response_timestamp.length > 60 ||
        student.length < 2 || student.length > 120 || !/^(9|10|11|12)$/.test(grade) ||
        school.length < 2 || school.length > 160 || !/^[6-9][0-9]{9}$/.test(guardian_mobile)) {
      throw new Error(`Row ${index + 1} does not match the five required columns.`);
    }
    return {response_timestamp, student, grade, school, guardian_mobile};
  });
}

importForm.addEventListener('submit', async event => {
  event.preventDefault();
  const input = byId('google-registration-rows');
  const button = importForm.querySelector('button');
  let registrations;
  try {
    registrations = parseGoogleRegistrationRows(input.value);
  } catch (error) {
    importStatus.textContent = error.message;
    return;
  }
  button.disabled = true;
  try {
    const {data, error} = await db.from(googleRegistrationTable).upsert(registrations, {
      onConflict: 'response_timestamp,student,guardian_mobile', ignoreDuplicates: true
    }).select('id');
    if (error) throw error;
    input.value = '';
    await loadGoogleRegistrations();
    importStatus.textContent = `${data.length} imported. ${registrations.length - data.length} duplicate rows skipped.`;
  } catch {
    importStatus.textContent = 'The rows could not be imported. Your pasted data is still available to retry.';
  } finally {
    button.disabled = false;
  }
});

load();
