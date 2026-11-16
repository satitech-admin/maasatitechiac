/* Maa Sati IAC: accessible, opt-in header menu for narrow devices.
   Native menu on the home page is preserved; no auth or lesson state is altered. */
(() => {
 'use strict';
 const header = document.querySelector('header');
 const nav = header?.querySelector('nav');
 if (!header || !nav || header.querySelector('.menu-toggle, #menuToggle, [aria-controls="nav"].menu-toggle')) return;
 const count = Array.from(nav.children).filter(node => node.matches('a,button,details')).length;
 if (count < 2 || nav.hasAttribute('data-iac-mobile-nav')) return;
 const parent = nav.parentElement;
 if (!parent) return;
 const button = document.createElement('button');
 button.type = 'button';
 button.className = 'iac-mobile-nav-toggle';
 button.setAttribute('aria-label','Open institute navigation');
 button.setAttribute('aria-expanded','false');
 if (!nav.id) nav.id = 'iac-mobile-navigation';
 button.setAttribute('aria-controls',nav.id);
 button.innerHTML = '<span aria-hidden="true">☰</span><span>Menu</span>';
 nav.setAttribute('data-iac-mobile-nav','');
 parent.classList.add('iac-has-mobile-nav');
 parent.insertBefore(button,nav);
 const setOpen = open => {
   nav.classList.toggle('iac-mobile-nav-expanded',open);
   button.setAttribute('aria-expanded',String(open));
   button.setAttribute('aria-label',open?'Close institute navigation':'Open institute navigation');
   button.querySelector('span:last-child').textContent = open?'Close':'Menu';
 };
 setOpen(false);
 button.addEventListener('click',()=>setOpen(!nav.classList.contains('iac-mobile-nav-expanded')));
 nav.addEventListener('click',event => {
   if (event.target.closest('a[href],button[data-route],button[data-page]')) setOpen(false);
 });
 document.addEventListener('keydown',event => {
   if (event.key === 'Escape' && nav.classList.contains('iac-mobile-nav-expanded')) {
     setOpen(false);
     button.focus();
   }
 });
 document.addEventListener('click',event => {
   if (nav.classList.contains('iac-mobile-nav-expanded') && !parent.contains(event.target)) setOpen(false);
 });
 if (typeof window.matchMedia === 'function') {
   const wider = window.matchMedia('(min-width: 761px)');
   const onWidth = event => { if (event.matches) setOpen(false); };
   if (wider.addEventListener) wider.addEventListener('change',onWidth);
   else if (wider.addListener) wider.addListener(onWidth);
 }
})();
