const form = document.querySelector('#parent-status');
const button = form.querySelector('button');
const status = document.querySelector('#parent-status-result');
const endpoint = 'https://ylobnofwmryltbzdtkla.supabase.co/rest/v1/rpc/iac_december_parent_status';
const publishableKey = 'sb_publishable_YqLFRfMUlW5hzTOh_50hQQ_Ntr0pYa9';
const statuses = {
  pending: 'Application received. Guardian verification is pending.',
  verified: 'Guardian consent has been verified. The institute is reviewing the application.',
  approved: 'The application has been approved.',
  declined: 'The application was declined. Contact the institute for help.'
};
button.disabled = false;

form.addEventListener('submit', async event => {
  event.preventDefault();
  const fields = new FormData(form);
  const reference = String(fields.get('reference')).trim();
  const email = String(fields.get('email')).trim();
  if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(reference)) {
    status.textContent = 'Enter the full registration reference shown after submitting the form.';
    return;
  }
  button.disabled = true;
  status.textContent = 'Looking up your application…';
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', apikey: publishableKey},
      body: JSON.stringify({p_reference: reference, p_email: email}),
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw Error('Lookup failed');
    const [registration] = await response.json();
    status.textContent = registration && Object.hasOwn(statuses, registration.application_status)
      ? statuses[registration.application_status]
      : 'No application matched that reference and email. Check the details and try again.';
  } catch {
    status.textContent = 'Application status is temporarily unavailable. Please try again shortly.';
  } finally {
    button.disabled = false;
  }
});
