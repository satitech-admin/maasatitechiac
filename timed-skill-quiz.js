let activeQuiz;

export function showTimedQuiz({db, quiz, host, user}) {
  activeQuiz?.stop();
  const root = document.createElement('section');
  root.className = 'card';
  const title = document.createElement('h2');
  title.textContent = quiz.title;
  const intro = document.createElement('p');
  intro.textContent = '20 questions · 5 minutes · 18 correct answers to qualify. Unanswered questions count as incorrect.';
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  const timer = document.createElement('p');
  timer.setAttribute('role', 'timer');
  const start = document.createElement('button');
  start.type = 'button';
  start.textContent = 'Start or resume timed quiz';
  start.disabled = !user;
  if (!user) status.textContent = 'Sign in to start a scored attempt.';
  const form = document.createElement('form');
  root.append(title, intro, status, timer, start, form);
  host.replaceChildren(root);

  let attempt;
  let interval;
  let finished = false;
  let finishing = false;
  let pending = Promise.resolve();
  let stopped = false;
  let deadline = 0;
  const controls = () => [...form.querySelectorAll('input,button')];
  const stop = () => {
    stopped = true;
    clearInterval(interval);
    observer.disconnect();
  };
  const observer = new MutationObserver(() => { if (!host.contains(root)) stop(); });
  observer.observe(host, {childList: true});
  activeQuiz = {stop};

  async function request(action, answers = {}) {
    const {data, error} = await db.rpc('iac_timed_quiz_action', {
      p_quiz: quiz.id, p_action: action, p_attempt: attempt?.attempt_id ?? null, p_answers: answers
    });
    if (error) throw error;
    return data;
  }

  function result(data) {
    finished = true;
    clearInterval(interval);
    controls().forEach(control => { control.disabled = true; });
    timer.textContent = 'Attempt complete';
    status.textContent = `${data.correct_count}/${data.question_count} correct · ${data.score}%. ` +
      (data.qualifies ? 'Assessment threshold met.' : 'Assessment threshold not met. 18 correct answers are required.');
    start.hidden = false;
    start.disabled = !user;
    start.textContent = 'Start another attempt';
  }

  async function finalize() {
    if (stopped || finished || finishing) return;
    finishing = true;
    controls().forEach(control => { control.disabled = true; });
    status.textContent = 'Submitting saved answers…';
    try {
      await pending;
      const data = await request('submit');
      if (!stopped && !finished) result(data);
    } catch {
      if (!stopped) {
        status.textContent = 'Submission could not be confirmed. Reopen the quiz or retry.';
        const submit = form.querySelector('button');
        if (submit) submit.disabled = false;
      }
    } finally {
      finishing = false;
    }
  }

  function tick() {
    const seconds = Math.max(0, Math.ceil((deadline - performance.now()) / 1000));
    timer.textContent = `Time remaining ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    if (seconds === 0) {
      clearInterval(interval);
      void finalize();
    }
  }

  function render(data) {
    form.replaceChildren();
    if (data.submitted_at) {
      result(data);
      return;
    }
    for (const question of data.questions) {
      const field = document.createElement('fieldset');
      field.className = 'question';
      const caption = document.createElement('legend');
      caption.textContent = `${question.number}. ${question.prompt}`;
      field.append(caption);
      for (const [index, option] of question.options.entries()) {
        const label = document.createElement('label');
        label.className = 'choice';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = String(question.number);
        input.value = String(index);
        input.checked = data.answers[input.name] === index;
        label.append(input, document.createTextNode(option));
        field.append(label);
      }
      form.append(field);
    }
    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.textContent = 'Submit quiz';
    form.append(submit);
    deadline = performance.now() + Math.max(0, Date.parse(data.expires_at) - Date.parse(data.server_time));
    start.hidden = true;
    status.textContent = 'Answers are saved as you choose them.';
    interval = setInterval(tick, 250);
    tick();
  }

  start.addEventListener('click', async () => {
    start.disabled = true;
    status.textContent = 'Opening timed attempt…';
    try {
      const data = await request('start');
      if (stopped) return;
      attempt = data;
      finished = false;
      render(data);
    } catch {
      if (!stopped) {
        status.textContent = 'Timed quiz is unavailable. Try again.';
        start.disabled = false;
      }
    }
  });

  form.addEventListener('change', event => {
    if (finished || finishing || event.target.type !== 'radio') return;
    const answers = {[event.target.name]: Number(event.target.value)};
    pending = pending.then(async () => {
      if (stopped || finished) return;
      const saved = await request('save', answers);
      if (!stopped && saved.submitted_at) result(saved);
      else if (!stopped && !finishing) status.textContent = 'Answer saved.';
    }).catch(() => {
      if (!stopped) status.textContent = 'An answer could not be saved. Select it again before the timer ends.';
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    void finalize();
  });
}
