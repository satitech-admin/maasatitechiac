const countdown = document.querySelector('[data-december-countdown]');
if (countdown) {
  countdown.hidden = false;
  const start = Date.parse('2026-12-10T00:00:00+05:30');
  function showCountdown() {
    const remaining = start - Date.now();
    if (remaining <= 0) {
      countdown.textContent = 'Batch 01 start date: 10 December 2026.';
      return;
    }
    const hours = Math.floor(remaining / 3_600_000);
    countdown.textContent = hours ? `${Math.floor(hours / 24)} days · ${hours % 24} hours until 10 December (IST)` : 'Starts in less than an hour (IST).';
    setTimeout(showCountdown, Math.min(60_000, remaining));
  }
  showCountdown();
}

const registrationCountdown = document.querySelector('[data-december-registration-countdown]');
if (registrationCountdown) {
  const closesAt = Date.parse('2026-12-06T00:00:00+05:30');
  const registrationLink = document.querySelector('[data-december-registration-link]');
  registrationCountdown.hidden = false;

  function showRegistrationCountdown() {
    const remaining = closesAt - Date.now();
    if (remaining <= 0) {
      registrationCountdown.textContent = 'Student registration has closed.';
      if (registrationLink) registrationLink.remove();
      return;
    }

    const minutes = Math.ceil(remaining / 60_000);
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    registrationCountdown.textContent = `Registration closes in ${days}d ${hours}h ${minutes % 60}m · 5 December, 11:59 PM IST`;
    setTimeout(showRegistrationCountdown, Math.min(60_000, remaining));
  }

  showRegistrationCountdown();
}
