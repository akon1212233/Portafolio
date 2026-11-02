/* Expansión FLIP desde el monitor real de la página hasta el modo arcade. */
(() => {
  let animation = null;
  let activeModal = null;
  let activeScreen = null;
  let veil = null;
  let finishTimer = null;
  let generation = 0;
  function clear() {
    generation++;
    clearTimeout(finishTimer); finishTimer = null;
    if (animation) { animation.cancel(); animation = null; }
    activeModal?.classList.remove('arcade-entering');
    if (activeScreen) activeScreen.inert = false;
    veil?.remove(); veil = null;
    activeModal = null; activeScreen = null;
  }
  window.AkonTransition = {
    capture(pc) {
      const rect = pc.querySelector('.monitor').getBoundingClientRect();
      return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    },
    enter(modal, pc, origin) {
      clear();
      if (matchMedia('(prefers-reduced-motion: reduce)').matches || !pc.animate) return;
      const monitor = pc.querySelector('.monitor');
      const target = monitor.getBoundingClientRect();
      if (!origin || !target.width || !target.height) return;
      // Si la PC estaba fuera del viewport, entra desde un monitor pequeño centrado.
      if (origin.top + origin.height < 0 || origin.top > innerHeight || origin.width < 1) {
        origin = { left: innerWidth * .35, top: innerHeight * .3, width: innerWidth * .3, height: innerHeight * .4 };
      }
      activeModal = modal; activeScreen = pc.querySelector('.pc-workspace');
      activeScreen.inert = true;
      veil = document.createElement('div'); veil.className = 'crt-boot-veil'; veil.setAttribute('aria-hidden', 'true');
      const line = document.createElement('i'); veil.append(line); pc.querySelector('.screen').append(veil);
      modal.classList.add('arcade-entering');
      const sx = origin.width / target.width, sy = origin.height / target.height;
      const dx = origin.left - target.left, dy = origin.top - target.top;
      const reduced = sx < .8;
      const transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
      const ownGeneration = generation;
      animation = monitor.animate([
        { transform, borderRadius: '16px', filter: 'brightness(.58)', offset: 0 },
        { transform, borderRadius: '16px', filter: 'brightness(.65)', offset: .12 },
        { transform: 'translate(0, 0) scale(1, 1) rotateX(.6deg)', borderRadius: '44px 44px 28px 28px', filter: 'brightness(1)', offset: 1 }
      ], { duration: reduced ? 1200 : 1000, easing: 'cubic-bezier(.22,.7,.16,1)', fill: 'both' });
      monitor.style.transformOrigin = '0 0';
      const finish = () => {
        if (generation !== ownGeneration) return;
        clear(); monitor.style.removeProperty('transform-origin');
      };
      // La escena termina tras el encendido, incluso si el navegador pausa la animación.
      finishTimer = setTimeout(finish, 1500);
    },
    cancel(pc) { clear(); pc?.querySelector('.monitor')?.style.removeProperty('transform-origin'); }
  };
})();
