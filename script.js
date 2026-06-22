// ===== Navbar: blur/shadow on scroll =====
const navbar = document.getElementById('navbar');

function updateNavbar() {
    if (window.scrollY > 12) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

updateNavbar();
window.addEventListener('scroll', updateNavbar, { passive: true });

// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        navToggle.classList.toggle('open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            navToggle.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// ===== Hero CTA: en móvil lleva al chat de mobile.html en vez de #contacto =====
const heroPrimaryCta = document.getElementById('heroPrimaryCta');

if (heroPrimaryCta) {
    heroPrimaryCta.addEventListener('click', (event) => {
        if (window.innerWidth <= 768) {
            event.preventDefault();
            window.location.href = 'mobile.html';
        }
    });
}

// ===== Metric / result count-up =====
function animateCount(el) {
    const target = Number(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        el.textContent = prefix + value.toLocaleString('es-ES') + suffix;

        if (progress < 1) {
            requestAnimationFrame(tick);
        }
    }

    requestAnimationFrame(tick);
}

const metricValues = document.querySelectorAll('.metric-value[data-count], .result-value[data-count]');

if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.4 }
    );

    metricValues.forEach((el) => observer.observe(el));
} else {
    metricValues.forEach(animateCount);
}

// ===== Scroll reveal for sections below the fold =====
const scrollRevealEls = document.querySelectorAll('.reveal-scroll');

if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.2 }
    );

    scrollRevealEls.forEach((el) => revealObserver.observe(el));
} else {
    scrollRevealEls.forEach((el) => el.classList.add('in-view'));
}

// ===== Contact form =====
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    const submitBtn = contactForm.querySelector('.btn-form');
    let errorEl = null;

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!contactForm.reportValidity()) {
            return;
        }

        const formValues = Object.fromEntries(new FormData(contactForm).entries());
        // formValues: { name, email, business, phone, goal, referral } (atributos name del HTML)

        const goalSelect = document.getElementById('goal');
        const referralSelect = document.getElementById('referral');
        const goalLabel = goalSelect.options[goalSelect.selectedIndex]?.text || '';
        const referralLabel = referralSelect.options[referralSelect.selectedIndex]?.text || '';

        const mensaje = `Objetivo: ${goalLabel}. Conocido por: ${referralLabel}.`;

        const formData = {
            name: formValues.name,
            email: formValues.email,
            phone: formValues.phone,
            company: formValues.business,
            message: mensaje,
            date: new Date().toISOString(),
            objetivo: goalLabel,
            fuente: referralLabel,
        };

        if (errorEl) {
            errorEl.remove();
            errorEl = null;
        }
        submitBtn.disabled = true;

        const webhookUrl = 'https://n8n-n8n-n8n.pkzggw.easypanel.host/webhook-test/zapynai-contacto';
        console.log('[ZapynAI form] enviando a:', webhookUrl, 'payload:', formData);

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Webhook respondió con error');
            }

            window.location.href = 'gracias.html';
        } catch (err) {
            errorEl = document.createElement('p');
            errorEl.textContent = 'No pudimos enviar tus datos. Inténtalo de nuevo en unos segundos.';
            errorEl.style.cssText = 'color:#ff6b6b; font-size:0.85rem; text-align:center; margin-top:14px;';
            contactForm.appendChild(errorEl);
        } finally {
            submitBtn.disabled = false;
        }
    });
}

// ===== Floating chat (Zapyn agent) =====
(function () {
    const triggerBtn = document.getElementById('chatTriggerBtn');
    const chatBadge = document.getElementById('chatBadge');
    const chatWindow = document.getElementById('chatWindow');
    const closeBtn = document.getElementById('chatCloseBtn');
    const messagesEl = document.getElementById('chatMessages');
    const chatForm = document.getElementById('chatForm');
    const chatInputField = document.getElementById('chatInputField');

    if (!triggerBtn || !chatWindow || !chatBadge || !closeBtn || !messagesEl || !chatForm || !chatInputField) {
        return;
    }

    const CHAT_WEBHOOK_URL = 'https://n8n-n8n-n8n.pkzggw.easypanel.host/webhook/72aa1dee-a9a7-4274-9a20-efff21ccd71d/chat';
    const sessionId = Math.random().toString(36).substring(7);

    let hasOpenedBefore = false;
    let isWaitingResponse = false;

    function scrollToBottom() {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function addMessage(text, role) {
        const bubble = document.createElement('div');
        bubble.className = 'chat-msg ' + role;
        bubble.textContent = text;
        messagesEl.appendChild(bubble);
        scrollToBottom();
        return bubble;
    }

    function showTyping() {
        const typing = document.createElement('div');
        typing.className = 'chat-typing-indicator';
        typing.id = 'chatTypingIndicator';
        typing.innerHTML = '<span></span><span></span><span></span>';
        messagesEl.appendChild(typing);
        scrollToBottom();
    }

    function hideTyping() {
        const typing = document.getElementById('chatTypingIndicator');
        if (typing) {
            typing.remove();
        }
    }

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    function openChat() {
        chatWindow.classList.add('open');
        chatBadge.classList.add('hide');
        triggerBtn.classList.add('chat-trigger-hidden');

        if (!hasOpenedBefore) {
            hasOpenedBefore = true;
            setTimeout(() => addMessage('¡Hola! 👋 Soy Zapyn, el asistente de ZapynAI.', 'bot'), 500);
            setTimeout(() => addMessage('¿En qué puedo ayudarte hoy? Estoy aquí para resolver tus dudas.', 'bot'), 1500);
        }

        // En móvil NO forzamos el foco: abrir el teclado automáticamente es lo que
        // provoca el solape con el botón de enviar, y Safari iOS además ignora el
        // foco programático cuando no ocurre de forma síncrona en el propio toque.
        if (!isTouchDevice) {
            setTimeout(() => chatInputField.focus(), 300);
        }
    }

    function closeChat() {
        chatWindow.classList.remove('open');
        triggerBtn.classList.remove('chat-trigger-hidden');
    }

    triggerBtn.addEventListener('click', () => {
        if (chatWindow.classList.contains('open')) {
            closeChat();
        } else {
            openChat();
        }
    });

    closeBtn.addEventListener('click', closeChat);

    chatForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const text = chatInputField.value.trim();
        if (!text || isWaitingResponse) {
            return;
        }

        addMessage(text, 'user');
        chatInputField.value = '';
        isWaitingResponse = true;
        showTyping();

        try {
            const response = await fetch(CHAT_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatInput: text, sessionId: sessionId }),
            });

            if (!response.ok) {
                throw new Error('Webhook respondió con error');
            }

            const data = await response.json();
            const reply = data.output || data.text || data.message || 'Gracias por tu mensaje, en breve te responderemos.';

            hideTyping();
            addMessage(reply, 'bot');
        } catch (err) {
            hideTyping();
            addMessage('Lo siento, ha habido un error. Inténtalo de nuevo.', 'bot');
        } finally {
            isWaitingResponse = false;
        }
    });
})();

// ===== Embedded chat (mobile.html — Zapyn agent, inline not floating) =====
(function () {
    const messagesEl = document.getElementById('mobileChatMessages');
    const chatForm = document.getElementById('mobileChatForm');
    const chatInputField = document.getElementById('mobileChatInputField');

    if (!messagesEl || !chatForm) {
        return;
    }

    const CHAT_WEBHOOK_URL = 'https://n8n-n8n-n8n.pkzggw.easypanel.host/webhook/72aa1dee-a9a7-4274-9a20-efff21ccd71d/chat';
    const sessionId = Math.random().toString(36).substring(7);
    let isWaitingResponse = false;

    function scrollToBottom() {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function addMessage(text, role) {
        const bubble = document.createElement('div');
        bubble.className = 'chat-msg ' + role;
        bubble.textContent = text;
        messagesEl.appendChild(bubble);
        scrollToBottom();
        return bubble;
    }

    function showTyping() {
        const typing = document.createElement('div');
        typing.className = 'chat-typing-indicator';
        typing.id = 'mobileChatTypingIndicator';
        typing.innerHTML = '<span></span><span></span><span></span>';
        messagesEl.appendChild(typing);
        scrollToBottom();
    }

    function hideTyping() {
        const typing = document.getElementById('mobileChatTypingIndicator');
        if (typing) {
            typing.remove();
        }
    }

    window.addEventListener('load', function () {
        setTimeout(function () {
            addMessage('¡Hola! 👋 Soy Zapyn, el asistente de ZapynAI.', 'bot');
        }, 800);
        setTimeout(function () {
            addMessage('¿En qué puedo ayudarte hoy? Estoy aquí para resolver tus dudas sobre nuestros servicios.', 'bot');
        }, 2000);
    });

    chatForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const text = chatInputField.value.trim();
        if (!text || isWaitingResponse) {
            return;
        }

        addMessage(text, 'user');
        chatInputField.value = '';
        isWaitingResponse = true;
        showTyping();

        try {
            const response = await fetch(CHAT_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatInput: text, sessionId: sessionId }),
            });

            if (!response.ok) {
                throw new Error('Webhook respondió con error');
            }

            const data = await response.json();
            const reply = data.output || data.text || data.message || 'Gracias por tu mensaje, en breve te responderemos.';

            hideTyping();
            addMessage(reply, 'bot');
        } catch (err) {
            hideTyping();
            addMessage('Lo siento, ha habido un error. Inténtalo de nuevo.', 'bot');
        } finally {
            isWaitingResponse = false;
        }
    });
})();
