window.addEventListener('DOMContentLoaded', function() {
  // Force light theme programmatically
  function forceTheme() {
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute('content', 'light only');
    }
    
    // Force CSS properties
    document.documentElement.style.setProperty('color-scheme', 'light only', 'important');
    document.body.style.setProperty('color-scheme', 'light only', 'important');
    document.body.style.setProperty('background-color', '#faf7f5', 'important');
  }
  
  // Apply immediately and on theme changes
  forceTheme();
  
  // Listen for theme changes and force light theme
  if (window.matchMedia) {
    const darkThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkThemeQuery.addListener(forceTheme);
  }
  
  // Audio configuration - Moved to top for loading screen access
  const AUDIO_SRC = 'audio/photograph.mp3';
  
  let audio = null;
  let audioEnabled = false;
  
  // Función para habilitar audio después de interacción del usuario
  function enableAudio() {
    if (!audioEnabled && AUDIO_SRC) {
      audio = new Audio(AUDIO_SRC);
      audio.volume = 0.5;
      audio.loop = true;
      audio.preload = 'auto';
      audioEnabled = true;
      console.log('Audio habilitado');
    }
  }

  // Función para mostrar notificación visual del audio
  function showAudioNotification() {
    const btn = document.getElementById('audioToggle');
    if (btn) {
      // Agregar clase de animación pulsante
      btn.classList.add('pulse-attention');
      
      // Mostrar tooltip temporal
      const tooltip = document.createElement('div');
      tooltip.textContent = 'Haz clic para escuchar música';
      tooltip.style.cssText = `
        position: fixed;
        right: 70px;
        bottom: 30px;
        background: #faf7f5;
        color: #B2663E;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 0.9rem;
        z-index: 10000;
        animation: fadeInOut 6s ease-in-out;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      `;
      
      document.body.appendChild(tooltip);
      
      // Remover tooltip y animación después de 6 segundos
      setTimeout(() => {
        if (tooltip && tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
        btn.classList.remove('pulse-attention');
      }, 6000);
    }
  }

  // Loading screen functionality
  const loadingScreen = document.getElementById('loadingScreen');
  
  // Hide loading screen after 3 seconds and attempt auto-start music
  setTimeout(function() {
    if (loadingScreen) {
      loadingScreen.classList.add('hide');
      
      // Start music automatically when loading screen disappears
      setTimeout(function() {
        // Enable audio and start playing
        if (!audioEnabled && AUDIO_SRC) {
          enableAudio();
        }
        
        // Auto-start music after a brief delay
        setTimeout(function() {
          if (audio && audioEnabled) {
            audio.play()
              .then(() => {
                const btn = document.getElementById('audioToggle');
                if (btn) {
                  btn.setAttribute('aria-pressed', 'true');
                  btn.title = 'Pausar música';
                  btn.querySelector('span').textContent = '||';
                }
                console.log('Música iniciada automáticamente');
              })
              .catch((error) => {
                console.log('Música no se puede iniciar automáticamente - Se requiere interacción del usuario');
                // Mostrar la notificación del botón de audio
                showAudioNotification();
              });
          }
        }, 200); // Small delay to ensure audio is ready
      }, 300); // Start music during the transition
      
      // Remove from DOM after transition completes
      setTimeout(function() {
        if (loadingScreen && loadingScreen.parentNode) {
          loadingScreen.parentNode.removeChild(loadingScreen);
        }
      }, 800); // Match the CSS transition duration
    }
  }, 3000); // 3 seconds delay

  // Load sections dynamically
  const sections = ['hero', 'versiculo', 'info', 'timeline', 'memories', 'details', 'rsvp', 'location', 'countdown'];
  sections.forEach(section => {
    fetch(`sections/${section}.html`)
      .then(response => response.text())
      .then(html => {
        document.getElementById(`${section}-section`).innerHTML = html;
        // Update hero h1 after loading
        if (section === 'hero') {
          updateHeroH1();
        }
        // Initialize flip cards after loading memories section
        if (section === 'memories') {
          initializeFlipCards();
        }
        // Initialize RSVP functionality after loading rsvp section
        if (section === 'rsvp') {
          initializeRSVP();
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

  // Initialize flip cards functionality
  function initializeFlipCards() {
    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(card => {
      card.addEventListener('click', function() {
        // Si esta tarjeta ya está volteada, solo la devolvemos
        if (this.classList.contains('flipped')) {
          this.classList.remove('flipped');
        } else {
          // Devolver todas las demás tarjetas a su estado normal
          flipCards.forEach(otherCard => {
            if (otherCard !== this) {
              otherCard.classList.remove('flipped');
            }
          });
          // Voltear esta tarjeta
          this.classList.add('flipped');
        }
      });
    });
  }

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
      const guests = (form.guests.value || '').trim();
      const names = (form.names.value || '').trim();
      const message = (form.message.value || '').trim();

      if (!guests || !names) {
        showCustomAlert('Campos requeridos', 'Por favor, completa el número de personas y los nombres para continuar.', 'warning');
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

      // Mostrar modal de selección de contacto
      showContactModal(whatsappMessage, form);
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

  // Audio player setup - Get button reference
  const btn = document.getElementById('audioToggle');
  
  if (AUDIO_SRC && btn) {
    btn.hidden = false;
    btn.setAttribute('aria-pressed', 'false');
    btn.title = 'Reproducir música';
    btn.querySelector('span').textContent = '♫';
    
    btn.addEventListener('click', () => {
      // Asegurar que el audio esté habilitado
      if (!audioEnabled) {
        enableAudio();
      }
      
      if (!audio) {
        alert('Error: No se pudo cargar el archivo de audio.');
        return;
      }
      
      if (audio.paused) {
        audio.play()
          .then(() => {
            btn.setAttribute('aria-pressed', 'true');
            btn.title = 'Pausar música';
            btn.querySelector('span').textContent = '||';
            console.log('Audio reproduciendo');
          })
          .catch((error) => {
            console.error('Error al reproducir:', error);
           });
      } else {
        audio.pause();
        btn.setAttribute('aria-pressed', 'false');
        btn.title = 'Reproducir música';
        btn.querySelector('span').textContent = '♫';
        console.log('Audio pausado');
      }
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
      showCustomAlert('Campos requeridos', 'Por favor, completa todos los campos obligatorios para continuar.', 'warning');
      return; 
    }

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

    // Mostrar modal de selección de contacto
    showContactModal(whatsappMessage, form);
  }, { capture: true });

  // Funcionalidad RSVP avanzada
  function initializeRSVP() {
    // Variables globales para RSVP
    let maxGuests = 1; // Por defecto 1 invitado
    let currentGuests = [];

    // Leer parámetro de URL para número máximo de invitados
    const urlParams = new URLSearchParams(window.location.search);
    const invParam = urlParams.get('inv');
    if (invParam && !isNaN(invParam) && parseInt(invParam) > 0) {
      maxGuests = parseInt(invParam);
    }

    // Elementos del DOM
    const guestLimitInfo = document.getElementById('guestLimitInfo');
    const availableGuestsSpan = document.getElementById('availableGuests');
    const guestNameInput = document.getElementById('guestName');
    const addGuestBtn = document.getElementById('addGuestBtn');
    const guestsTable = document.getElementById('guestsTable');
    const guestsTableBody = document.getElementById('guestsTableBody');
    const submitBtn = document.getElementById('submitBtn');

    // Mostrar información de límite de invitados
    if (maxGuests > 1) {
      guestLimitInfo.style.display = 'block';
      updateAvailableGuests();
    }

    // Función para actualizar contador de invitados disponibles
    function updateAvailableGuests() {
      const remaining = maxGuests - currentGuests.length;
      availableGuestsSpan.textContent = remaining;
      
      // Deshabilitar botón si se alcanzó el límite
      addGuestBtn.disabled = remaining <= 0;
      
      // Habilitar/deshabilitar submit según si hay invitados
      submitBtn.disabled = currentGuests.length === 0;
    }

    // Función para agregar invitado
    function addGuest() {
      const name = guestNameInput.value.trim();
      
      if (!name) {
        showCustomAlert('Campo requerido', 'Por favor ingresa un nombre para continuar.', 'warning');
        return;
      }

      if (currentGuests.length >= maxGuests) {
        showCustomAlert('Límite alcanzado', `Solo puedes agregar hasta ${maxGuests} invitado(s).`, 'warning');
        return;
      }

      if (currentGuests.some(guest => guest.toLowerCase() === name.toLowerCase())) {
        showCustomAlert('Nombre duplicado', 'Este nombre ya fue agregado a la lista.', 'warning');
        return;
      }

      // Agregar a la lista
      currentGuests.push(name);
      
      // Limpiar input
      guestNameInput.value = '';
      
      // Actualizar tabla
      updateGuestsTable();
      
      // Actualizar contador
      updateAvailableGuests();
    }

    // Función para remover invitado
    function removeGuest(index) {
      currentGuests.splice(index, 1);
      updateGuestsTable();
      updateAvailableGuests();
    }

    // Función para actualizar tabla de invitados
    function updateGuestsTable() {
      // Mostrar/ocultar tabla
      guestsTable.style.display = currentGuests.length > 0 ? 'block' : 'none';
      
      // Limpiar tabla
      guestsTableBody.innerHTML = '';
      
      // Agregar filas
      currentGuests.forEach((guest, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${guest}</td>
          <td>
            <button type="button" class="btn-remove" onclick="removeGuest(${index})">
              Eliminar
            </button>
          </td>
        `;
        guestsTableBody.appendChild(row);
      });
    }

    // Event listeners
    addGuestBtn.addEventListener('click', addGuest);
    
    guestNameInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addGuest();
      }
    });

    // Modificar el envío del formulario para usar la nueva lista
    const rsvpForm = document.getElementById('rsvpForm');
    if (rsvpForm) {
      rsvpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (currentGuests.length === 0) {
          showCustomAlert('Lista vacía', 'Debes agregar al menos un invitado para continuar.', 'warning');
          return;
        }

        const message = document.getElementById('message').value.trim();
        
        // Crear mensaje para WhatsApp
        let whatsappMessage = `🎉 *Confirmación de Asistencia - Boda Victor & Sidney*\n\n`;
        whatsappMessage += `👥 *Número de personas:* ${currentGuests.length}\n\n`;
        whatsappMessage += `👤 *Nombres de los asistentes:*\n`;
        
        currentGuests.forEach((guest, index) => {
          whatsappMessage += `${index + 1}. ${guest}\n`;
        });
        
        if (message) {
          whatsappMessage += `\n💬 *Comentario adicional:*\n${message}\n\n`;
        } else {
          whatsappMessage += `\n`;
        }
        
        whatsappMessage += `¡Nos emociona mucho celebrar con ustedes! 💕`;

        // Mostrar modal de selección de contacto
        showContactModal(whatsappMessage, null, () => {
          // Callback para limpiar formulario después del envío
          currentGuests = [];
          updateGuestsTable();
          updateAvailableGuests();
          document.getElementById('message').value = '';
        });
      });
    }

    // Hacer removeGuest accesible globalmente
    window.removeGuest = removeGuest;
  }
  
  // Función para mostrar modal de selección de contacto
  function showContactModal(whatsappMessage, form, callback) {
    // Crear el modal si no existe
    let modal = document.getElementById('contactModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'contactModal';
      modal.className = 'contact-modal';
      modal.innerHTML = `
        <div class="contact-modal-content">
          <h3>¿A quién enviar?</h3>
          <p>Selecciona a quién quieres enviar la confirmación:</p>
          <div class="contact-options">
            <button class="contact-option" data-number="+50489564882">
               Victor Enamorado
            </button>
            <button class="contact-option" data-number="+50497544917">
               Sidney Gómez
            </button>
          </div>
          <button class="contact-cancel">Cancelar</button>
        </div>
      `;
      document.body.appendChild(modal);
    }
    
    // Mostrar modal
    modal.classList.add('show');
    
    // Manejar clics en las opciones
    const options = modal.querySelectorAll('.contact-option');
    const cancelBtn = modal.querySelector('.contact-cancel');
    
    // Función para cerrar modal
    const closeModal = () => {
      modal.classList.remove('show');
    };
    
    // Función para enviar mensaje
    const sendMessage = (phoneNumber) => {
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodedMessage}`;
      
      // Abrir WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // Limpiar formulario si se proporcionó
      if (form) {
        form.reset();
        form.querySelectorAll('.field').forEach(field => {
          field.classList.remove('filled', 'invalid');
        });
      }
      
      // Ejecutar callback si se proporcionó
      if (callback) {
        callback();
      }
      
      closeModal();
    };
    
    // Event listeners
    options.forEach(option => {
      option.onclick = () => sendMessage(option.dataset.number);
    });
    
    cancelBtn.onclick = closeModal;
    
    // Cerrar al hacer clic fuera del modal
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeModal();
      }
    };
  }
  
  // Función para mostrar modal de alerta personalizado
  function showCustomAlert(title, message, type = 'info') {
    // Crear el modal si no existe
    let alertModal = document.getElementById('customAlertModal');
    if (!alertModal) {
      alertModal = document.createElement('div');
      alertModal.id = 'customAlertModal';
      alertModal.className = 'alert-modal';
      document.body.appendChild(alertModal);
    }
    
    // Iconos según el tipo
    const icons = {
      info: '💡',
      warning: '⚠️',
      error: '❌',
      success: '✅'
    };
    
    // Crear contenido del modal
    alertModal.innerHTML = `
      <div class="alert-modal-content">
        <div class="alert-modal-icon ${type}">${icons[type] || icons.info}</div>
        <h4>${title}</h4>
        <p>${message}</p>
        <button class="alert-modal-button" onclick="closeCustomAlert()">Entendido</button>
      </div>
    `;
    
    // Mostrar modal
    alertModal.classList.add('show');
    
    // Función para cerrar (hacer accesible globalmente)
    window.closeCustomAlert = () => {
      alertModal.classList.remove('show');
    };
    
    // Cerrar al hacer clic fuera del modal
    alertModal.onclick = (e) => {
      if (e.target === alertModal) {
        window.closeCustomAlert();
      }
    };
    
    // Cerrar con Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        window.closeCustomAlert();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }
});