export const issuer = 'MAA SATI IAC';

const achievement = {
  seminar: 'Awarded for verified participation in the seminar',
  one_week: 'Awarded for completing the bootcamp and its approved practical project',
  course: 'Awarded for completing the course and its practical learning requirements',
  internship: 'Awarded for completing the verified internship',
  skill: 'Awarded after passing the skill assessment and receiving approval for the practical project',
  assessment: 'Awarded for completing the verified skill assessment',
  practical_task: 'Awarded for completing the approved practical task'
};

export function achievementDescription(record) {
  const description = String(record.achievement_description || '').trim();
  if (description) return description;
  const reason = achievement[record.certificate_type];
  const program = String(record.program_title || '').trim();
  if (!reason) return program ? `Awarded for the verified achievement recorded under ${program}.` : 'Achievement verified by MAA SATI IAC.';
  return program ? `${reason} for ${program}.` : `${reason}.`;
}

export function credentialShareContent({record, code, url, badge = false}) {
  const program = String(record.program_title || '').trim();
  const kind = badge ? 'Skill Badge' : 'Certificate';
  const title = program ? `${program} | ${kind}` : kind;
  const description = achievementDescription(record);
  const share = new URL('/api/credential-share', 'https://maasatitechiac.vercel.app');
  share.searchParams.set('kind', badge ? 'badge' : 'certificate');
  share.searchParams.set('code', code);
  const shareUrl = share.href;
  const issueDate = new Date(record.issued_at);
  const date = Number.isNaN(issueDate.getTime()) ? '' : new Intl.DateTimeFormat('en-IN', {
    month: 'long', year: 'numeric', timeZone: 'UTC'
  }).format(issueDate);
  return {
    title, description, url, shareUrl,
    caption: `I earned the ${title} from ${issuer}. ${description} Verify my credential: ${shareUrl}`,
    profile: [`Name: ${title}`, `Issuing organization: ${issuer}`, date && `Issue date: ${date}`,
      `Credential ID: ${code}`, `Credential URL: ${url}`].filter(Boolean).join('\n'),
    linkedinShare: 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(shareUrl),
    linkedinProfile: 'https://www.linkedin.com/profile/add?startTask=CERTIFICATION'
  };
}

export function renderCredentialShare(container, options) {
  const data = credentialShareContent(options);
  const document = container.ownerDocument;
  container.replaceChildren();
  const controls = document.createElement('div');
  controls.className = 'credential-share-controls';
  const feedback = document.createElement('p');
  feedback.setAttribute('role', 'status');
  const manual = document.createElement('textarea');
  manual.readOnly = true;
  manual.hidden = true;
  manual.setAttribute('aria-label', 'Text to copy');
  const links = [
    ['Share on LinkedIn', data.linkedinShare],
    ['Add to LinkedIn profile', data.linkedinProfile],
    ['Share on WhatsApp', 'https://api.whatsapp.com/send?text=' + encodeURIComponent(data.caption)]
  ];
  for (const [label, url] of links) {
    const link = document.createElement('a');
    link.textContent = label;
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    controls.append(link);
  }
  function button(label, handler) {
    const element = document.createElement('button');
    element.type = 'button';
    element.textContent = label;
    element.addEventListener('click', handler);
    controls.append(element);
  }
  function copy(label, value) {
    button(label, async () => {
      try {
        await navigator.clipboard.writeText(value);
        manual.hidden = true;
        feedback.textContent = 'Copied.';
      } catch {
        manual.value = value;
        manual.hidden = false;
        manual.focus();
        manual.select();
        feedback.textContent = 'Select and copy the text.';
      }
    });
  }
  copy('Copy link', data.url);
  copy('Copy post text', data.caption);
  copy('Copy profile details', data.profile);
  if (navigator.share) button('Share', async () => {
    try {
      await navigator.share({title: data.title, text: data.caption.split(' Verify my credential:')[0], url: data.shareUrl});
    } catch (error) {
      if (error.name !== 'AbortError') feedback.textContent = 'Sharing unavailable. Use Copy link or Copy post text.';
    }
  });
  container.append(controls, feedback, manual);
}

export function clearCredentialPreview() {
  document.head.querySelectorAll('meta[data-credential-preview]').forEach(tag => tag.remove());
}

export function setCredentialPreview({record, code, url, badge}) {
  const data = credentialShareContent({record, code, url, badge});
  for (const [property, content] of Object.entries({
    'og:title': `${data.title} · ${issuer}`,
    'og:description': data.description,
    'og:url': url
  })) {
    let tag = document.head.querySelector(`meta[property="${property}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('property', property);
      tag.dataset.credentialPreview = '';
      document.head.append(tag);
    }
    tag.content = content;
  }
}
