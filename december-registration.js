const form = document.querySelector('#parent-registration');
const button = form.querySelector('button[type="submit"]');
const status = document.querySelector('#registration-status');
const deadline = Date.parse('2026-12-10T00:00:00+05:30');
const endpoint = 'https://ylobnofwmryltbzdtkla.supabase.co/rest/v1/rpc/iac_december_submit';
const publishableKey = 'sb_publishable_YqLFRfMUlW5hzTOh_50hQQ_Ntr0pYa9';

if (Date.now() >= deadline) {
  form.hidden = true;
  status.textContent = 'Online registration for Batch 01 has closed.';
} else {
  button.disabled = false;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  for (const field of ['eligible', 'consent', 'privacy']) data[field] = form.elements[field].checked;
  button.disabled = true;
  status.textContent = 'Saving registration…';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', apikey: publishableKey},
      body: JSON.stringify({p: data}),
      signal: AbortSignal.timeout(15000)
    });
    const result = await response.json();
    if (!response.ok) {
      const messages = {
        '23505': 'A matching registration already exists. Contact the institute if you need help finding the reference.',
        '22023': 'Check the form details and the batch registration dates.',
        P0001: 'Registration is temporarily limited. Please try again later or contact the institute.'
      };
      status.textContent = messages[result.code] || 'The server could not confirm your registration. Please try again.';
      return;
    }
    if (typeof result !== 'string' || !/^[a-f0-9-]{36}$/i.test(result)) {
      status.textContent = 'The server did not return a registration reference. Please contact the institute.';
      return;
    }
    document.querySelector('#registration-reference').textContent = result;
    const confirmation = document.querySelector('#registration-result');
    form.reset();
    form.hidden = true;
    status.textContent = '';
    confirmation.hidden = false;
    confirmation.focus();
  } catch {
    status.textContent = 'The server could not confirm your registration. If retrying reports a duplicate, contact the institute.';
  } finally {
    button.disabled = false;
  }
});
