window.addEventListener('DOMContentLoaded', function() {
  // Load sections dynamically
  const sections = ['hero', 'info', 'timeline', 'memories', 'details', 'rsvp', 'location', 'countdown'];
  sections.forEach(section => {
    fetch(`sections/${section}.html`)
      .then(response => response.text())
      .then(html => {
        document.getElementById(`${section}-section`).innerHTML = html;
        // Update hero h1 after loading
        if (section === 'hero') {
          updateHeroH1();
        }
      })
      .catch(error => console.error(`Error loading ${section}:`, error));
  });

  // Function to update hero h1 based on screen size
  function updateHeroH1() {
    const h1 = document.querySelector('.hero h1');
    if (h1) {
      if (window.innerWidth <= 768) {
        h1.innerHTML = 'Victor<br>&<br>Sidney';
      } else {
        h1.innerHTML = 'Victor & Sidney';
      }
    }
  }

  // Update on resize
  window.addEventListener('resize', updateHeroH1);

  // Galería removida - Swiper ya no necesario
  // const swiper = new Swiper('.swiper', {
  //   loop: true,
  //   autoplay: { delay: 3500, disableOnInteraction: false },
  //   pagination: { el: '.swiper-pagination', clickable: true },
  //   navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
  //   a11y: true
  // });

  // Form handler (WhatsApp)
  const form = document.getElementById('rsvpForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const whatsappNumber = form.dataset.whatsapp || '+50489564882';
      const guests = (form.guests.value || '').trim();
      const names = (form.names.value || '').trim();
      const message = (form.message.value || '').trim();

      if (!guests || !names) {
        alert('Por favor, completa los campos obligatorios (número de personas y nombres).');
        return;
      }

      // Crear mensaje para WhatsApp
      let whatsappMessage = `🎉 *Confirmación de Asistencia - Boda Victor & Sidney*\n\n`;
      whatsappMessage += `👥 *Número de personas:* ${guests}\n\n`;
      whatsappMessage += `👤 *Nombres de los asistentes:*\n${names}\n\n`;
      
      if (message) {
        whatsappMessage += `💬 *Comentario adicional:*\n${message}\n\n`;
      }
      
      whatsappMessage += `¡Nos emociona mucho celebrar con ustedes! 💕`;

      // Codificar mensaje para URL
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodedMessage}`;
      
      // Abrir WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // Limpiar formulario
      form.reset();
      
      // Remover clases de validación
      form.querySelectorAll('.field').forEach(field => {
        field.classList.remove('filled', 'invalid');
      });
    });
  }

  // Toggle menú móvil
  const menuBtn = document.querySelector('.menu-toggle');
  const primaryMenu = document.getElementById('primary-menu');
  if (menuBtn && primaryMenu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = primaryMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    // Cerrar al elegir una opción
    primaryMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      primaryMenu.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }));
    // Reset al cambiar tamaño
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        primaryMenu.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Countdown (ajusta la fecha/hora del evento)
  const target = new Date('2025-11-15T15:00:00');
  function tick() {
    const now = new Date();
    let diff = Math.max(0, target - now);
    const s = Math.floor(diff / 1000);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = String(val).padStart(2,'0'); };
    set('d-count', days);
    set('h-count', hours);
    set('m-count', mins);
    set('s-count', secs);
  }
  tick();
  setInterval(tick, 1000);

  // Audio player (configura tu archivo MP3 o link externo)
  const AUDIO_SRC = ''; // Para archivo MP3 local
  const EXTERNAL_MUSIC_LINK = 'https://music.youtube.com/watch?v=TU_LINK_AQUI'; // Para link externo
  
  const audio = new Audio();
  const btn = document.getElementById('audioToggle');
  
  if (AUDIO_SRC) {
    // Modo archivo MP3
    audio.src = AUDIO_SRC;
    audio.preload = 'none';
    btn.hidden = false;
    btn.addEventListener('click', async () => {
      if (audio.paused) {
        try { 
          await audio.play(); 
          btn.setAttribute('aria-pressed','true'); 
          btn.title = 'Pausar música'; 
          btn.querySelector('span').textContent = '⏸'; 
        } catch(e) { 
          alert('El navegador bloqueó la reproducción automática. Toca de nuevo para reproducir.'); 
        }
      } else {
        audio.pause(); 
        btn.setAttribute('aria-pressed','false'); 
        btn.title = 'Reproducir música'; 
        btn.querySelector('span').textContent = '♫';
      }
    });
  } else if (EXTERNAL_MUSIC_LINK) {
    // Modo link externo
    btn.hidden = false;
    btn.title = 'Escuchar nuestra canción';
    btn.addEventListener('click', () => {
      window.open(EXTERNAL_MUSIC_LINK, '_blank');
    });
  } else {
    // Sin música configurada
    if (btn) btn.hidden = true;
  }

  // Scroll reveal: aplica a secciones y tarjetas
  const revealTargets = document.querySelectorAll('section, .detail-card, .event, .map-card, .count-box, .story, .masonry figure');
  revealTargets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      } else {
        entry.target.classList.remove('is-visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });

  revealTargets.forEach(el => observer.observe(el));

  // Form UI: labels estáticos simplificados
  const fields = form.querySelectorAll('.field input, .field select, .field textarea');
  fields.forEach(el => {
    // Remover validación al escribir
    el.addEventListener('input', () => {
      el.closest('.field')?.classList.remove('invalid');
      el.setAttribute('aria-invalid', 'false');
    });
    el.addEventListener('change', () => {
      el.closest('.field')?.classList.remove('invalid');
      el.setAttribute('aria-invalid', 'false');
    });
  });

  // Validación simplificada para el formulario
  form.addEventListener('submit', function(e) {
    // Validación visual previa
    const guestsEl = form.guests;
    const namesEl = form.names;

    let ok = true;
    if (!guestsEl.value) { 
      guestsEl.closest('.field')?.classList.add('invalid'); 
      guestsEl.setAttribute('aria-invalid','true'); 
      ok = false; 
    }
    if (!namesEl.value.trim()) { 
      namesEl.closest('.field')?.classList.add('invalid'); 
      namesEl.setAttribute('aria-invalid','true'); 
      ok = false; 
    }
    
    if (!ok) { 
      e.preventDefault(); 
      alert('Por favor, completa los campos obligatorios.'); 
      return; 
    }

    const whatsappNumber = form.dataset.whatsapp || '+50498564882';
    const guests = (form.guests.value || '').trim();
    const names = (form.names.value || '').trim();
    const message = (form.message.value || '').trim();

    // Crear mensaje para WhatsApp
    let whatsappMessage = `🎉 *Confirmación de Asistencia - Boda Victor & Sidney*\n\n`;
    whatsappMessage += `👥 *Número de personas:* ${guests}\n\n`;
    whatsappMessage += `👤 *Nombres de los asistentes:*\n${names}\n\n`;
    
    if (message) {
      whatsappMessage += `💬 *Comentario adicional:*\n${message}\n\n`;
    }
    
    whatsappMessage += `¡Nos emociona mucho celebrar con ustedes! 💕`;

    // Codificar mensaje para URL
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodedMessage}`;
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Limpiar formulario
    form.reset();
    
    // Remover clases de validación
    form.querySelectorAll('.field').forEach(field => {
      field.classList.remove('invalid');
    });
  }, { capture: true });
});