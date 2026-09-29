// C.S.ANALYTICS — script partagé
document.addEventListener('DOMContentLoaded', () => {

  /* ---- Menu mobile ---- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('is-open'));
    });
  }

  /* ---- Marquer le lien de nav actif ---- */
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === here) a.classList.add('active');
  });

  /* ---- Révélation au scroll ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---- Compteurs de chiffres clés ---- */
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1200;
    let started = false;

    const run = () => {
      if (started) return;
      started = true;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target % 1 === 0 ? Math.round(target * eased) : (target * eased).toFixed(1);
        el.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
      const io2 = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) run(); });
      }, { threshold: 0.4 });
      io2.observe(el);
    } else {
      run();
    }
  });

  /* ---- Formulaires (contact + diagnostic) ----
     Validation simple côté navigateur, puis envoi réel à Formspree
     (https://formspree.io) via fetch, sans recharger la page.
     Tant que l'action du <form> contient "TON-ID" (valeur non remplacée),
     l'envoi est simulé pour ne pas bloquer les tests en local. */
  document.querySelectorAll('form[data-form]').forEach(form => {
    const status = form.querySelector('.form-status');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // 1. Validation des champs obligatoires
      const required = form.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        if (!field.value.trim()) valid = false;
        if (field.type === 'email' && field.value && !/^\S+@\S+\.\S+$/.test(field.value)) valid = false;
      });

      if (!valid) {
        if (status) {
          status.textContent = "Merci de vérifier les champs obligatoires avant d'envoyer.";
          status.className = 'form-status err';
        }
        return;
      }

      const action = form.getAttribute('action') || '';
      const isConfigured = action.startsWith('https://formspree.io') && !action.includes('TON-ID');

      // 2. Formulaire pas encore configuré (ID Formspree non remplacé) : on simule
      if (!isConfigured) {
        if (status) {
          status.textContent = "Formulaire non connecté pour l'instant (ID Formspree à renseigner dans le HTML). Message non envoyé réellement.";
          status.className = 'form-status err';
        }
        return;
      }

      // 3. Envoi réel à Formspree en arrière-plan (sans recharger la page)
      if (status) {
        status.textContent = "Envoi en cours...";
        status.className = 'form-status ok';
      }

      try {
        const response = await fetch(action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          if (status) {
            status.textContent = "Message envoyé. Notre équipe C.S.ANALYTICS vous recontacte sous 24h ouvrées.";
            status.className = 'form-status ok';
          }
          form.reset();
        } else {
          if (status) {
            status.textContent = "Une erreur est survenue lors de l'envoi. Merci de réessayer ou de nous écrire directement par e-mail.";
            status.className = 'form-status err';
          }
        }
      } catch (err) {
        if (status) {
          status.textContent = "Connexion impossible. Vérifiez votre connexion Internet puis réessayez.";
          status.className = 'form-status err';
        }
      }
    });
  });

  /* ---- Année dans le footer ---- */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
});
