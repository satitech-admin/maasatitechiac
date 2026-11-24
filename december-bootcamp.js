const countdown = document.querySelector('[data-december-countdown]');
if (countdown) {
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
