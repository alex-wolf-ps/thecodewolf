/* =========================================================================
   The Code Wolf - site behavior
   No dependencies. Everything degrades gracefully without JS.
   ========================================================================= */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------------------------------------------------------------
       Typewriter in the hero
       --------------------------------------------------------------------- */
    (function typewriter() {
        var el = document.getElementById('typed');
        if (!el) return;

        var lead = el.querySelector('.typed__lead');
        var role = el.querySelector('.typed__role');
        if (!lead || !role) return;

        // [article, role]: the article renders outside the tinted span.
        var phrases = [
            ['', 'Alex Wolf.'],
            ['a ', 'Software Developer.'],
            ['a ', 'Cloud Architect.'],
            ['an ', 'AI Engineer.'],
            ['a ', 'Technical Trainer.'],
            ['a ', 'Content Creator.']
        ];

        function lengthOf(phrase) {
            return phrase[0].length + phrase[1].length;
        }

        function render(phrase, count) {
            lead.textContent = phrase[0].slice(0, count);
            role.textContent = count > phrase[0].length
                ? phrase[1].slice(0, count - phrase[0].length)
                : '';
        }

        if (reduceMotion) {
            render(phrases[0], lengthOf(phrases[0]));
            return;
        }

        var TYPE = 90, ERASE = 45, HOLD = 2200, GAP = 400;
        var index = 0, chars = 0, erasing = false;

        (function tick() {
            var phrase = phrases[index];
            render(phrase, chars);

            var delay;
            if (!erasing) {
                if (chars < lengthOf(phrase)) {
                    chars++;
                    delay = TYPE;
                } else {
                    erasing = true;
                    delay = HOLD;
                }
            } else {
                if (chars > 0) {
                    chars--;
                    delay = ERASE;
                } else {
                    erasing = false;
                    index = (index + 1) % phrases.length;
                    delay = GAP;
                }
            }
            setTimeout(tick, delay);
        })();
    })();

    /* ---------------------------------------------------------------------
       Mobile nav
       --------------------------------------------------------------------- */
    (function mobileNav() {
        var toggle = document.getElementById('navToggle');
        var menu = document.getElementById('navMenu');
        if (!toggle || !menu) return;

        function close() {
            menu.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        }

        toggle.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(open));
        });

        menu.addEventListener('click', function (e) {
            if (e.target.closest('a')) close();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });
    })();

    /* ---------------------------------------------------------------------
       Sticky nav background + back-to-top visibility
       --------------------------------------------------------------------- */
    (function onScrollChrome() {
        var nav = document.getElementById('nav');
        var toTop = document.getElementById('toTop');
        var ticking = false;

        function update() {
            var y = window.scrollY;
            if (nav) nav.classList.toggle('is-stuck', y > 40);
            if (toTop) toTop.classList.toggle('is-visible', y > 600);
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        }, { passive: true });

        update();
    })();

    /* ---------------------------------------------------------------------
       Active nav link based on the section in view
       --------------------------------------------------------------------- */
    (function scrollSpy() {
        var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link[href^="#"]'));
        if (!links.length || !('IntersectionObserver' in window)) return;

        var byId = {};
        var sections = [];

        links.forEach(function (link) {
            var id = link.getAttribute('href').slice(1);
            var section = document.getElementById(id);
            if (section) {
                byId[id] = link;
                sections.push(section);
            }
        });

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                links.forEach(function (l) { l.classList.remove('is-active'); });
                var link = byId[entry.target.id];
                if (link) link.classList.add('is-active');
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

        sections.forEach(function (s) { observer.observe(s); });
    })();

    /* ---------------------------------------------------------------------
       Scroll reveal
       --------------------------------------------------------------------- */
    (function reveal() {
        var items = document.querySelectorAll('.reveal');
        if (!items.length) return;

        if (reduceMotion || !('IntersectionObserver' in window)) {
            items.forEach(function (el) { el.classList.add('is-in'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    obs.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

        items.forEach(function (el) { observer.observe(el); });
    })();

    /* ---------------------------------------------------------------------
       Contact form - AJAX submit to Formspree
       Falls back to a normal form POST if fetch is unavailable.
       --------------------------------------------------------------------- */
    (function contactForm() {
        var form = document.getElementById('contactForm');
        if (!form || typeof window.fetch !== 'function') return;

        var status = document.getElementById('formStatus');
        var submit = document.getElementById('formSubmit');
        var label = submit ? submit.querySelector('.btn__label') : null;
        var defaultLabel = label ? label.textContent : '';

        function setStatus(message, state) {
            if (!status) return;
            status.textContent = message;
            status.classList.remove('is-ok', 'is-err');
            if (state) status.classList.add(state);
        }

        function fieldOf(input) {
            return input.closest('.field');
        }

        function clearError(input) {
            var field = fieldOf(input);
            if (!field) return;
            field.classList.remove('is-invalid');
            var msg = field.querySelector('.field__error');
            if (msg) msg.remove();
        }

        function showError(input, message) {
            var field = fieldOf(input);
            if (!field) return;
            field.classList.add('is-invalid');
            if (!field.querySelector('.field__error')) {
                var p = document.createElement('p');
                p.className = 'field__error';
                p.textContent = message;
                field.appendChild(p);
            }
        }

        // Clear a field's error as soon as the visitor starts fixing it.
        form.addEventListener('input', function (e) {
            if (e.target.matches('input, textarea')) clearError(e.target);
        });

        function validate() {
            var fields = form.querySelectorAll('input[required], textarea[required]');
            var firstBad = null;

            Array.prototype.forEach.call(fields, function (input) {
                clearError(input);
                var value = input.value.trim();
                var message = '';

                if (!value) {
                    message = 'This field is required.';
                } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
                    message = 'Please enter a valid email address.';
                }

                if (message) {
                    showError(input, message);
                    if (!firstBad) firstBad = input;
                }
            });

            if (firstBad) firstBad.focus();
            return !firstBad;
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!validate()) {
                setStatus('Please fix the highlighted fields.', 'is-err');
                return;
            }

            if (submit) submit.disabled = true;
            if (label) label.textContent = 'Sending...';
            setStatus('');

            fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            })
                .then(function (res) {
                    if (res.ok) {
                        form.reset();
                        setStatus('Thanks! Your message is on its way. I\'ll get back to you soon.', 'is-ok');
                        return;
                    }
                    return res.json().then(function (data) {
                        var detail = data && data.errors
                            ? data.errors.map(function (x) { return x.message; }).join(', ')
                            : 'Something went wrong. Please try again.';
                        throw new Error(detail);
                    });
                })
                .catch(function (err) {
                    setStatus(err.message || 'Network error. Please try again, or reach out on LinkedIn.', 'is-err');
                })
                .finally(function () {
                    if (submit) submit.disabled = false;
                    if (label) label.textContent = defaultLabel;
                });
        });
    })();

    /* ---------------------------------------------------------------------
       Footer year
       --------------------------------------------------------------------- */
    (function year() {
        var el = document.getElementById('year');
        if (el) el.textContent = String(new Date().getFullYear());
    })();
})();
