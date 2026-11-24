const dialog = document.querySelector('#seminar-photo-viewer');
if (typeof dialog?.showModal === 'function') {
  const image = dialog.querySelector('img');
  const caption = dialog.querySelector('figcaption');
  const close = dialog.querySelector('[data-gallery-close]');
  let photos = [];
  let current = 0;
  let opener;

  function showPhoto(index) {
    current = (index + photos.length) % photos.length;
    const photo = photos[current];
    image.src = photo.href;
    image.alt = photo.querySelector('img').alt;
    caption.textContent = `${current + 1} of ${photos.length} · ${image.alt}`;
  }

  document.addEventListener('click', event => {
    const photo = event.target.closest('.event-photo-link');
    if (!photo || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    photos = [...photo.closest('.event-gallery-grid').querySelectorAll('.event-photo-link')];
    opener = photo;
    event.preventDefault();
    showPhoto(photos.indexOf(photo));
    dialog.showModal();
    close.focus();
  });

  dialog.querySelector('[data-gallery-prev]').addEventListener('click', () => showPhoto(current - 1));
  dialog.querySelector('[data-gallery-next]').addEventListener('click', () => showPhoto(current + 1));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus());
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') showPhoto(current - 1);
    if (event.key === 'ArrowRight') showPhoto(current + 1);
  });
}
