// Brazuk Hub - Main Controller Script

document.addEventListener('DOMContentLoaded', () => {
  // Initialize tabs
  setupTabs();

  // Initialize In-Page Web Viewer Modal & App Window System
  setupWebModal();

  // Initialize Built-in AI Chat (Brazuk AI)
  setupBuiltinChat();

  // Initialize Panic Screen / Stealth Mode
  setupPanicMode();

  // Initialize ChatGPT Web Suite & Unblocked AI Module
  setupChatGPTSuite();
});

// ==========================================
// 1. TAB SWITCHER
// ==========================================
function setupTabs() {
  const tabs = document.querySelectorAll('.nav-tabs .tab-btn');
  const panels = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPanel = document.getElementById(target);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

// ==========================================
// 2. IN-PAGE WEB VIEWER & APP WINDOW ENGINE
// ==========================================
let currentModalUrl = '';
let currentModalTitle = '';

const IFRAME_BLOCKED_DOMAINS = [
  'chatgpt.com',
  'openai.com'
];

function isIframeBlocked(url) {
  try {
    const parsed = new URL(url);
    return IFRAME_BLOCKED_DOMAINS.some(domain => parsed.hostname.toLowerCase().includes(domain));
  } catch (e) {
    return false;
  }
}

// Launch in Standalone App Window (Clean popup, no browser tabs, no connection refusal)
window.openAppWindow = (url, title = 'Brazuk App') => {
  const width = Math.min(1150, window.screen.availWidth - 60);
  const height = Math.min(760, window.screen.availHeight - 80);
  const left = Math.max(0, (window.screen.availWidth - width) / 2);
  const top = Math.max(0, (window.screen.availHeight - height) / 2);

  const windowFeatures = `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes`;
  const win = window.open(url, title.replace(/[^a-zA-Z0-9]/g, '_'), windowFeatures);
  if (win) {
    win.focus();
  } else {
    // Popup blocked fallback
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

function setupWebModal() {
  const modal = document.getElementById('webViewerModal');
  const modalWindow = document.getElementById('webModalWindow');
  const iframe = document.getElementById('webModalIframe');
  const titleEl = document.getElementById('webModalTitle');
  const urlInput = document.getElementById('webModalUrl');
  const closeBtn = document.getElementById('modalCloseBtn');
  const dotClose = document.getElementById('dotClose');
  const dotMax = document.getElementById('dotMax');
  const reloadBtn = document.getElementById('modalReloadBtn');
  const extBtn = document.getElementById('modalExtBtn');
  const blockedNotice = document.getElementById('modalBlockedNotice');
  const blockedSiteName = document.getElementById('blockedSiteName');
  const btnOpenAppMode = document.getElementById('btnOpenAppMode');
  const btnUseBuiltin = document.getElementById('btnUseBuiltin');

  window.openInHub = (url, title = 'Navegador Brazuk') => {
    currentModalUrl = url;
    currentModalTitle = title;

    if (titleEl) titleEl.textContent = title;
    if (urlInput) urlInput.value = url;
    if (modal) modal.classList.add('active');

    // Check if website blocks iframe embedding
    if (isIframeBlocked(url)) {
      if (iframe) iframe.src = 'about:blank';
      if (blockedNotice) blockedNotice.classList.add('active');
      if (blockedSiteName) blockedSiteName.textContent = title;

      const blockedIcon = document.getElementById('blockedIcon');
      const blockedSiteDesc = document.getElementById('blockedSiteDesc');
      if (blockedIcon) blockedIcon.innerHTML = '<i class="fa-solid fa-lock-open" style="color: #10b981;"></i>';
      if (blockedSiteDesc) {
        blockedSiteDesc.innerHTML = `Por políticas de seguridad, portales como <strong>${escapeHtml(title)}</strong> impiden incrustarse en páginas externas convencionales.<br><br>¡Hemos integrado una <strong>Web Completa de ChatGPT y portales de IA sin bloqueos</strong> para que no tengas restricciones escolares ni cortes de conexión!`;
      }
    } else {
      if (blockedNotice) blockedNotice.classList.remove('active');
      if (iframe) iframe.src = url;
    }
  };

  window.closeInHub = () => {
    if (modal) modal.classList.remove('active');
    if (iframe) iframe.src = 'about:blank';
    if (blockedNotice) blockedNotice.classList.remove('active');
    currentModalUrl = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', window.closeInHub);
  if (dotClose) dotClose.addEventListener('click', window.closeInHub);

  if (dotMax && modalWindow) {
    dotMax.addEventListener('click', () => {
      modalWindow.classList.toggle('fullscreen');
    });
  }

  if (reloadBtn) {
    reloadBtn.addEventListener('click', () => {
      if (currentModalUrl) {
        window.openInHub(currentModalUrl, currentModalTitle);
      }
    });
  }

  if (extBtn) {
    extBtn.addEventListener('click', () => {
      if (currentModalUrl) window.openAppWindow(currentModalUrl, currentModalTitle);
    });
  }

  if (btnOpenAppMode) {
    btnOpenAppMode.addEventListener('click', () => {
      if (currentModalUrl) {
        window.openAppWindow(currentModalUrl, currentModalTitle);
        window.closeInHub();
      }
    });
  }

  const btnSwitchToChatGPTWeb = document.getElementById('btnSwitchToChatGPTWeb');
  if (btnSwitchToChatGPTWeb) {
    btnSwitchToChatGPTWeb.addEventListener('click', () => {
      window.closeInHub();
      const tabChat = document.querySelector('[data-tab="tab-chatgpt"]');
      if (tabChat) {
        tabChat.click();
        tabChat.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }



  const btnCloakCurrentModal = document.getElementById('btnCloakCurrentModal');
  if (btnCloakCurrentModal) {
    btnCloakCurrentModal.addEventListener('click', () => {
      if (currentModalUrl && window.openCloakedWindow) {
        window.openCloakedWindow(currentModalUrl, 'Google Drive');
      }
    });
  }

  if (btnUseBuiltin) {
    btnUseBuiltin.addEventListener('click', () => {
      window.closeInHub();
      const tabAi = document.querySelector('[data-tab="tab-ai"]');
      if (tabAi) tabAi.click();
      const chatInput = document.getElementById('chatInput');
      if (chatInput) {
        chatInput.focus();
        chatInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // Intercept all clicks for data-attributes
  document.addEventListener('click', (e) => {
    // Tab switcher data attribute
    const switchTab = e.target.closest('[data-switch-tab]');
    if (switchTab) {
      e.preventDefault();
      const tabName = switchTab.getAttribute('data-switch-tab');
      const targetBtn = document.querySelector(`.nav-tabs [data-tab="${tabName}"]`);
      if (targetBtn) {
        targetBtn.click();
        targetBtn.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    // Cloaked window data attribute
    const cloakTarget = e.target.closest('[data-cloak-url]');
    if (cloakTarget) {
      e.preventDefault();
      const url = cloakTarget.getAttribute('data-cloak-url');
      const title = cloakTarget.getAttribute('data-title') || 'Google Drive';
      if (window.openCloakedWindow) {
        window.openCloakedWindow(url, title);
      }
      return;
    }

    const target = e.target.closest('[data-open="hub"]');
    if (target) {
      e.preventDefault();
      const url = target.getAttribute('data-url') || target.getAttribute('href');
      const title = target.getAttribute('data-title') || 'Ventana Web';
      if (url) {
        window.openInHub(url, title);
      }
      return;
    }

    const appTarget = e.target.closest('[data-open="app"]');
    if (appTarget) {
      e.preventDefault();
      const url = appTarget.getAttribute('data-url') || appTarget.getAttribute('href');
      const title = appTarget.getAttribute('data-title') || 'Ventana App';
      if (url) {
        window.openAppWindow(url, title);
      }
      return;
    }
  });
}

// ==========================================
// 3. BUILT-IN AI CHAT (BRAZUK AI INTEGRADO)
// ==========================================
function setupBuiltinChat() {
  const chatHistory = document.getElementById('chatHistory');
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  const quickChips = document.querySelectorAll('.quick-chip');

  if (!chatInput || !chatSendBtn || !chatHistory) return;

  function appendMessage(sender, text) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}`;

    if (sender === 'bot') {
      msg.innerHTML = `
        <div class="chat-bot-avatar" style="width: 32px; height: 32px; font-size: 0.9rem; flex-shrink: 0;">
          <i class="fa-solid fa-robot"></i>
        </div>
        <div class="msg-bubble">${text}</div>
      `;
    } else {
      msg.innerHTML = `
        <div class="msg-bubble">${escapeHtml(text)}</div>
      `;
    }

    chatHistory.appendChild(msg);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  async function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage('user', text);
    chatInput.value = '';

    const tempId = 'loading-' + Date.now();
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'chat-msg bot';
    loadingMsg.id = tempId;
    loadingMsg.innerHTML = `
      <div class="chat-bot-avatar" style="width: 32px; height: 32px; font-size: 0.9rem; flex-shrink: 0;">
        <i class="fa-solid fa-robot"></i>
      </div>
      <div class="msg-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>
    `;
    chatHistory.appendChild(loadingMsg);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    try {
      const response = await generateSmartAIResponse(text, 'openai');
      const loadingEl = document.getElementById(tempId);
      if (loadingEl) loadingEl.remove();
      appendMessage('bot', formatMarkdown(response));
    } catch (e) {
      const loadingEl = document.getElementById(tempId);
      if (loadingEl) loadingEl.remove();
      appendMessage('bot', formatMarkdown(generateLocalAcademicKnowledge(text, 'openai')));
    }
  }

  chatSendBtn.addEventListener('click', handleSend);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      chatInput.value = chip.getAttribute('data-prompt') || chip.textContent.trim();
      chatInput.focus();
    });
  });
}

// Smart Local Conversational & Knowledge Engine
function generateAIResponse(prompt) {
  const lower = prompt.toLowerCase().trim();

  // Math expressions solver: e.g. 5 * 8, 120 / 4, 25 + 75, etc.
  const mathMatch = lower.match(/^([0-9\.\s\+\-\*\/\(\)\^%]+)$/);
  if (mathMatch) {
    try {
      const sanitized = lower.replace(/\^/g, '**');
      const result = Function(`'use strict'; return (${sanitized})`)();
      if (!isNaN(result)) {
        return `🔢 <strong>Resultado Matemático:</strong><br><code style="font-size:1.15rem; color:#38bdf8;">${prompt} = ${result}</code>`;
      }
    } catch (e) {}
  }

  if (lower.includes('raiz de') || lower.includes('raíz de')) {
    const num = parseFloat(lower.replace(/[^0-9\.]/g, ''));
    if (!isNaN(num)) {
      return `🔢 <strong>Raíz cuadrada de ${num}:</strong><br><code style="font-size:1.15rem; color:#38bdf8;">√${num} = ${Math.sqrt(num)}</code>`;
    }
  }

  if (lower.includes('hola') || lower.includes('buenas') || lower.includes('hey') || lower.includes('que tal') || lower.includes('qué tal')) {
    return '¡Hola! Soy <strong>Brazuk AI</strong>, tu inteligencia artificial integrada. Estoy listo para ayudarte con tareas escolares, matemáticas, ciencias, resúmenes, traducción o programación sin salir de esta web. ¿Qué necesitas?';
  }

  if (lower.includes('pitagoras') || lower.includes('pitágoras')) {
    return '📐 <strong>Teorema de Pitágoras:</strong><br>En todo triángulo rectángulo, el cuadrado de la hipotenusa (c) es igual a la suma de los cuadrados de los catetos (a y b):<br><code style="color:#06b6d4;">a² + b² = c²</code><br><br>• <strong>Ejemplo:</strong> Si los catetos miden 3 cm y 4 cm:<br>c² = 3² + 4² = 9 + 16 = 25<br>c = √25 = <strong>5 cm</strong>.';
  }

  if (lower.includes('fotosintesis') || lower.includes('fotosíntesis')) {
    return '🌱 <strong>La Fotosíntesis:</strong><br>Es el proceso biológico mediante el cual las plantas, algas y ciertas bacterias capturan energía luminosa del sol para transformar agua y dióxido de carbono en azúcares (glucosa) y liberar oxígeno.<br><br>• <strong>Ecuación química:</strong><br><code>6 CO₂ + 6 H₂O + Luz solar → C₆H₁₂O₆ (Glucosa) + 6 O₂ (Oxígeno)</code>';
  }

  if (lower.includes('celula') || lower.includes('célula')) {
    return '🔬 <strong>Célula Eucariota vs Procariota:</strong><br>• <strong>Eucariota:</strong> Tiene núcleo definido con membrana que protege el ADN y posee organelos como mitocondrias y aparato de Golgi (animales, plantas, hongos).<br>• <strong>Procariota:</strong> Más primitiva y pequeña; no posee núcleo ni organelos membranosos, su ADN flota libre en el citoplasma (bacterias y arqueas).';
  }

  if (lower.includes('gravedad') || lower.includes('ley de newton')) {
    return '🌍 <strong>La Gravedad:</strong><br>Es la fuerza invisible de atracción mutua entre todos los cuerpos con masa en el universo. En la Tierra, la aceleración de gravedad promedio es de <strong>g ≈ 9.8 m/s²</strong>.<br>Según la Ley de Gravitación Universal de Isaac Newton: <code>F = G · (m₁ · m₂) / r²</code>.';
  }

  if (lower.includes('ensayo') || lower.includes('redactar') || lower.includes('resumen')) {
    return '📝 <strong>Guía para redactar un ensayo excelente:</strong><br><br>1. <strong>Título atractivo:</strong> Que resuma el enfoque de tu argumento.<br>2. <strong>Introducción:</strong> Presenta el tema, contexto general y tu <em>tesis</em> (postura o idea principal).<br>3. <strong>Cuerpo / Desarrollo (2-3 párrafos):</strong> Cada párrafo debe defender un argumento con datos, citas o ejemplos concretos.<br>4. <strong>Conclusión:</strong> Resume los puntos tratados, reafirma tu postura y deja una reflexión final.<br><br><em>¿De qué tema quieres que te estructure un ensayo?</em>';
  }

  if (lower.includes('traduce') || lower.includes('traducir') || lower.includes('ingles') || lower.includes('inglés')) {
    return '🌐 <strong>Traductor escolar rápido:</strong><br>Escribe la frase que deseas traducir. Por ejemplo:<br>• <em>"I need help with my homework"</em> → <em>"Necesito ayuda con mi tarea"</em><br>• <em>"Have a great day"</em> → <em>"Que tengas un excelente día"</em>';
  }

  if (lower.includes('codigo') || lower.includes('código') || lower.includes('javascript') || lower.includes('python') || lower.includes('html')) {
    return '💻 <strong>Ejemplo de Código Web:</strong><br>Aquí tienes un contador interactivo en JavaScript:<br><pre style="background:rgba(0,0,0,0.5); padding:10px; border-radius:8px; margin-top:8px; font-size:0.85rem; overflow-x:auto;"><code>let puntos = 0;\nfunction sumarPunto() {\n  puntos++;\n  console.log("Puntaje actual:", puntos);\n}</code></pre>';
  }

  if (lower.includes('roblox') || lower.includes('juego') || lower.includes('coolmath')) {
    return '🤖 <strong>Portal Brazuk IA:</strong><br>Este portal está enfocado 100% en inteligencia artificial escolar (<strong>Brazuk AI</strong> y <strong>ChatGPT Web</strong>). Puedes pedirme que te ayude a resolver ejercicios matemáticos, crear ensayos, redactar código o responder preguntas de estudio.';
  }

  // General high-quality reply
  return `🤖 He procesado tu consulta sobre "<em>${escapeHtml(prompt)}</em>".<br><br>💡 <strong>Idea clave:</strong> Para profundizar en este tema de forma clara en tu trabajo escolar, define los conceptos fundamentales, agrega ejemplos prácticos y verifica tus fuentes.<br><br>👉 <em>Recuerda que también puedes usar nuestra pestaña de <strong>ChatGPT Web</strong> arriba para redactar ensayos completos y resolver dudas complejas.</em>`;
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}



// ==========================================
// 5. PANIC BUTTON & STEALTH MODE
// ==========================================
function setupPanicMode() {
  const panicBtn = document.getElementById('panicBtn');
  const panicScreen = document.getElementById('panicScreen');
  const restoreBtn = document.getElementById('restoreBtn');
  const modal = document.getElementById('webViewerModal');

  function togglePanic() {
    if (!panicScreen) return;
    const isPanic = panicScreen.classList.toggle('active');
    document.title = isPanic ? 'Célula eucariota - Wikipedia, la enciclopedia libre' : 'Brazuk IA | Centro Inteligencia Artificial';
  }

  if (panicBtn) panicBtn.addEventListener('click', togglePanic);
  if (restoreBtn) restoreBtn.addEventListener('click', togglePanic);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // If Web Modal is active, ESC closes the modal first
      if (modal && modal.classList.contains('active')) {
        window.closeInHub();
        return;
      }
      togglePanic();
    }
  });
}

// ==========================================
// 8. ANTI-FILTER CAMOUFLAGE (ABOUT:BLANK CLOAKING)
// ==========================================
window.openCloakedWindow = (url, title = 'Google Drive') => {
  try {
    const win = window.open('about:blank', '_blank');
    if (!win) {
      alert('⚠️ Por favor permite las ventanas emergentes (pop-ups) en tu navegador para abrir el modo camuflado.');
      return;
    }
    win.document.title = title;

    let link = win.document.querySelector("link[rel*='icon']");
    if (!link) {
      link = win.document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      win.document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = 'https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png';

    const doc = win.document;
    doc.body.style.margin = '0';
    doc.body.style.padding = '0';
    doc.body.style.overflow = 'hidden';
    doc.body.style.background = '#0a0e17';

    const iframe = doc.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.margin = '0';
    iframe.style.padding = '0';
    iframe.style.overflow = 'hidden';
    iframe.setAttribute('allow', 'camera; microphone; clipboard-read; clipboard-write; encrypted-media; fullscreen');
    iframe.src = url;
    doc.body.appendChild(iframe);
  } catch (err) {
    console.error('Error opening cloaked window:', err);
    window.open(url, '_blank');
  }
};

// ==========================================
// 9. CHATGPT WEB SUITE & UNBLOCKED AI ENGINE
// ==========================================
function setupChatGPTSuite() {
  // Mode Switcher (Direct Chat / Live Embed / Anti-Filter Cloak)
  const modeButtons = document.querySelectorAll('.chatgpt-mode-btn');
  const modeViews = {
    direct: document.getElementById('mode-direct'),
    embed: document.getElementById('mode-embed'),
    cloak: document.getElementById('mode-cloak')
  };

  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      Object.keys(modeViews).forEach(key => {
        if (modeViews[key]) {
          modeViews[key].classList.toggle('active', key === mode);
        }
      });
    });
  });

  // Direct Mode Elements
  const modelSelect = document.getElementById('chatgptModelSelect');
  const activeModelName = document.getElementById('chatgptActiveModelName');
  const newChatBtn = document.getElementById('btnNewChat');
  const clearHistoryBtn = document.getElementById('btnClearHistory');
  const promptChips = document.querySelectorAll('.chatgpt-prompt-chip');
  const messagesContainer = document.getElementById('chatgptMessages');
  const textarea = document.getElementById('chatgptTextarea');
  const sendBtn = document.getElementById('chatgptSendBtn');
  const charCount = document.getElementById('chatCharCount');
  const sessionsList = document.getElementById('chatgptSessionsList');
  const btnDownloadChat = document.getElementById('btnDownloadChat');
  const btnCloakCurrentChat = document.getElementById('btnCloakCurrentChat');
  const btnFullscreenChat = document.getElementById('btnFullscreenChat');

  // API Key Configuration (Optional Groq, OpenRouter, etc.)
  const btnToggleApiKey = document.getElementById('btnToggleApiKey');
  const apiKeyContainer = document.getElementById('apiKeyContainer');
  const customApiKeyInput = document.getElementById('customApiKeyInput');
  const btnSaveApiKey = document.getElementById('btnSaveApiKey');
  const btnClearApiKey = document.getElementById('btnClearApiKey');
  const apiKeyStatusBadge = document.getElementById('apiKeyStatusBadge');

  function updateApiKeyUI() {
    const savedKey = localStorage.getItem('brazuk_custom_api_key') || '';
    if (customApiKeyInput) customApiKeyInput.value = savedKey;
    if (apiKeyStatusBadge) apiKeyStatusBadge.style.display = savedKey ? 'inline' : 'none';
  }
  updateApiKeyUI();

  if (btnToggleApiKey && apiKeyContainer) {
    btnToggleApiKey.addEventListener('click', () => {
      apiKeyContainer.style.display = (apiKeyContainer.style.display === 'none' || !apiKeyContainer.style.display) ? 'block' : 'none';
    });
  }

  if (btnSaveApiKey && customApiKeyInput) {
    btnSaveApiKey.addEventListener('click', () => {
      const val = customApiKeyInput.value.trim();
      if (val) {
        localStorage.setItem('brazuk_custom_api_key', val);
        updateApiKeyUI();
        if (apiKeyContainer) apiKeyContainer.style.display = 'none';
        alert('✅ Clave de IA guardada con éxito.');
      }
    });
  }

  if (btnClearApiKey) {
    btnClearApiKey.addEventListener('click', () => {
      localStorage.removeItem('brazuk_custom_api_key');
      updateApiKeyUI();
      if (apiKeyContainer) apiKeyContainer.style.display = 'none';
      alert('Clave de IA eliminada.');
    });
  }

  // Sessions State
  let sessions = [];
  try {
    sessions = JSON.parse(localStorage.getItem('brazuk_chatgpt_sessions') || '[]');
  } catch (e) {
    sessions = [];
  }

  let currentSessionId = sessions.length > 0 ? sessions[0].id : null;

  function saveSessions() {
    try {
      localStorage.setItem('brazuk_chatgpt_sessions', JSON.stringify(sessions));
    } catch (e) {}
  }

  function renderSessionsList() {
    if (!sessionsList) return;
    sessionsList.innerHTML = '';

    if (sessions.length === 0) {
      sessionsList.innerHTML = '<div style="font-size:0.75rem; color:#64748b; padding:0.4rem;">Sin chats guardados</div>';
      return;
    }

    sessions.forEach(sess => {
      const item = document.createElement('div');
      item.className = `chatgpt-history-item ${sess.id === currentSessionId ? 'active' : ''}`;
      item.innerHTML = `
        <span style="overflow:hidden; text-overflow:ellipsis; max-width:200px;">
          <i class="fa-regular fa-message" style="margin-right:4px;"></i> ${escapeHtml(sess.title)}
        </span>
        <i class="fa-solid fa-xmark delete-sess-btn" style="color:#ef4444; opacity:0.6; padding:2px;" title="Eliminar"></i>
      `;

      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-sess-btn')) {
          e.stopPropagation();
          deleteSession(sess.id);
          return;
        }
        loadSession(sess.id);
      });

      sessionsList.appendChild(item);
    });
  }

  function createNewSession(initialTitle = 'Nueva Conversación') {
    const id = 'sess_' + Date.now();
    const newSess = {
      id: id,
      title: initialTitle,
      timestamp: Date.now(),
      messages: []
    };
    sessions.unshift(newSess);
    currentSessionId = id;
    saveSessions();
    renderSessionsList();
    renderSessionMessages();
  }

  function deleteSession(id) {
    sessions = sessions.filter(s => s.id !== id);
    if (currentSessionId === id) {
      currentSessionId = sessions.length > 0 ? sessions[0].id : null;
    }
    saveSessions();
    renderSessionsList();
    renderSessionMessages();
  }

  function loadSession(id) {
    currentSessionId = id;
    renderSessionsList();
    renderSessionMessages();
  }

  function getCurrentSession() {
    return sessions.find(s => s.id === currentSessionId);
  }

  function renderSessionMessages() {
    if (!messagesContainer) return;
    messagesContainer.innerHTML = '';

    const sess = getCurrentSession();
    if (!sess || sess.messages.length === 0) {
      messagesContainer.innerHTML = `
        <div class="chatgpt-msg-row ai">
          <div class="chatgpt-avatar ai">
            <i class="fa-solid fa-robot"></i>
          </div>
          <div class="chatgpt-bubble">
            <strong>¡Bienvenido a ChatGPT Web Integrado!</strong><br><br>
            Esta es tu estación de Inteligencia Artificial 100% desbloqueada dentro de Brazuk Hub. Puedes pedirme:
            <ul style="margin-left: 1.25rem; margin-top: 0.5rem; line-height: 1.6;">
              <li>Resolución detallada de problemas matemáticos y ciencias.</li>
              <li>Redacción de ensayos, biografías y corrección de ortografía.</li>
              <li>Explicaciones para cualquier materia o examen escolar.</li>
              <li>Generación de código en Python, JavaScript, HTML o C++ con botón para copiar.</li>
            </ul>
            <br>
            <em>¡Elige un prompt de la barra lateral o escribe lo que necesitas abajo!</em>
          </div>
        </div>
      `;
      return;
    }

    sess.messages.forEach(msg => {
      appendChatMessage(msg.role, msg.content, false);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function appendChatMessage(role, content, save = true) {
    if (!messagesContainer) return;
    const row = document.createElement('div');
    row.className = `chatgpt-msg-row ${role === 'user' ? 'user' : 'ai'}`;

    if (role === 'user') {
      row.innerHTML = `
        <div class="chatgpt-avatar user">
          <i class="fa-solid fa-user"></i>
        </div>
        <div class="chatgpt-bubble">${escapeHtml(content)}</div>
      `;
    } else {
      row.innerHTML = `
        <div class="chatgpt-avatar ai">
          <i class="fa-solid fa-robot"></i>
        </div>
        <div class="chatgpt-bubble">${formatMarkdown(content)}</div>
      `;
    }

    messagesContainer.appendChild(row);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    if (save) {
      let sess = getCurrentSession();
      if (!sess) {
        createNewSession(content.slice(0, 28) + '...');
        sess = getCurrentSession();
      }
      if (sess) {
        sess.messages.push({ role, content });
        if (sess.messages.length === 2 && role === 'ai') {
          sess.title = sess.messages[0].content.slice(0, 30);
        }
        saveSessions();
        renderSessionsList();
      }
    }
  }

  // Model Select
  if (modelSelect && activeModelName) {
    modelSelect.addEventListener('change', () => {
      const selectedOption = modelSelect.options[modelSelect.selectedIndex];
      activeModelName.textContent = selectedOption.text.split('(')[0].trim();
    });
  }

  // Textarea auto-resize & char count
  if (textarea) {
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
      if (charCount) {
        charCount.textContent = `${textarea.value.length} carácteres`;
      }
    });

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
  }

  // Prompt chips
  promptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.getAttribute('data-text');
      if (textarea && text) {
        textarea.value = text;
        textarea.focus();
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
      }
    });
  });

  // Send Action
  async function handleSendMessage() {
    if (!textarea) return;
    const text = textarea.value.trim();
    if (!text) return;

    appendChatMessage('user', text, true);
    textarea.value = '';
    textarea.style.height = '26px';
    if (charCount) charCount.textContent = '0 carácteres';

    // Show typing dots indicator
    const typingId = 'typing_' + Date.now();
    const typingRow = document.createElement('div');
    typingRow.className = 'chatgpt-msg-row ai';
    typingRow.id = typingId;
    typingRow.innerHTML = `
      <div class="chatgpt-avatar ai">
        <i class="fa-solid fa-robot"></i>
      </div>
      <div class="chatgpt-bubble">
        <div class="typing-dots"><span></span><span></span><span></span></div>
      </div>
    `;
    messagesContainer.appendChild(typingRow);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    const currentModel = modelSelect ? modelSelect.value : 'openai';

    try {
      const response = await generateSmartAIResponse(text, currentModel);
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();
      appendChatMessage('ai', response, true);
    } catch (err) {
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();
      const fallback = generateLocalAcademicKnowledge(text, currentModel);
      appendChatMessage('ai', fallback, true);
    }
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', handleSendMessage);
  }

  // New Chat
  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      createNewSession('Nueva Conversación');
      if (textarea) textarea.focus();
    });
  }

  // Clear History
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      if (confirm('¿Deseas vaciar todas las conversaciones guardadas de ChatGPT?')) {
        sessions = [];
        currentSessionId = null;
        saveSessions();
        renderSessionsList();
        renderSessionMessages();
      }
    });
  }

  // Download Chat transcript as .txt
  if (btnDownloadChat) {
    btnDownloadChat.addEventListener('click', () => {
      const sess = getCurrentSession();
      if (!sess || sess.messages.length === 0) {
        alert('No hay mensajes para descargar en esta conversación.');
        return;
      }
      let content = `Brazuk Hub - ChatGPT Web Transcript\n`;
      content += `Fecha: ${new Date(sess.timestamp).toLocaleString()}\n`;
      content += `Tema: ${sess.title}\n`;
      content += `==============================================\n\n`;

      sess.messages.forEach(m => {
        content += `[${m.role === 'user' ? 'TÚ' : 'CHATGPT'}]\n${m.content}\n\n`;
      });

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `ChatGPT_${sess.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20)}.txt`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  // Fullscreen Chat
  if (btnFullscreenChat) {
    btnFullscreenChat.addEventListener('click', () => {
      const wrapper = document.querySelector('.chatgpt-suite-wrapper');
      if (wrapper) {
        if (!document.fullscreenElement) {
          wrapper.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    });
  }

  // Cloak Current View
  if (btnCloakCurrentChat) {
    btnCloakCurrentChat.addEventListener('click', () => {
      window.openCloakedWindow(window.location.href, 'Google Drive');
    });
  }



  // Initial setup
  if (sessions.length === 0) {
    createNewSession('Nueva Conversación');
  } else {
    renderSessionsList();
    renderSessionMessages();
  }
}

// ==========================================
// 10. SMART HYBRID AI ENGINE & ACADEMIC KNOWLEDGE
// ==========================================
async function generateSmartAIResponse(prompt, model = 'openai') {
  // 1. Check if user configured a personal API key (Groq, OpenRouter, etc.)
  const customKey = localStorage.getItem('brazuk_custom_api_key');
  if (customKey && customKey.trim().length > 10) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      let endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      let reqModel = 'openai/gpt-4o-mini';
      if (customKey.startsWith('gsk_')) {
        endpoint = 'https://api.groq.com/openai/v1/chat/completions';
        reqModel = 'llama-3.3-70b-versatile';
      }
      const res = await fetch(endpoint, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customKey.trim()}`
        },
        body: JSON.stringify({
          model: reqModel,
          messages: [
            { role: 'system', content: 'Eres Brazuk AI, un tutor escolar amable, resolutivo y experto. Responde siempre en español en Markdown organizado con pasos claros, fórmulas y ejemplos.' },
            { role: 'user', content: prompt }
          ]
        })
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.choices && data.choices[0]?.message?.content) {
          return data.choices[0].message.content.trim();
        }
      }
    } catch (e) {}
  }

  // 2. Puter.js AI Gateway (free, client-side, zero setup)
  if (window.puter && window.puter.ai && typeof window.puter.ai.chat === 'function') {
    try {
      const targetModel = model === 'gpt35' ? 'gpt-3.5-turbo' : 'gpt-4o-mini';
      const puterPromise = window.puter.ai.chat(prompt, { model: targetModel });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Puter timeout')), 6500));
      const res = await Promise.race([puterPromise, timeoutPromise]);
      if (res) {
        const text = typeof res === 'string' ? res : res.message?.content || res.text || (typeof res === 'object' ? JSON.stringify(res) : '');
        if (text && text.trim().length > 3 && !text.includes('ENOSPC')) {
          return text.trim();
        }
      }
    } catch (err) {}
  }

  // 3. Fallback: Super Comprehensive Local Academic Knowledge & Math Solver Engine
  return generateLocalAcademicKnowledge(prompt, model);
}

function generateLocalAcademicKnowledge(prompt, model = 'openai') {
  const p = prompt.trim();
  const lower = p.toLowerCase();

  // 1. Casual Greetings & Conversational Intro
  if (/^(hola|buenas|buenos d[ií]as|buenas tardes|buenas noches|qu[eé] tal|que onda|saludos|hey|hi|hello)\b/i.test(lower) || (lower.length <= 6 && /^(hola|holi|hey|buenas)$/i.test(lower))) {
    return `### 👋 ¡Hola! ¿Cómo estás?\n\nSoy **Brazuk AI**, tu asistente inteligente escolar integrado en tu portal. Estoy listo para ayudarte con tus tareas y materias escolares:\n\n• 📐 **Matemáticas y Álgebra:** Resolución de ecuaciones paso a paso (de 1er y 2do grado), fracciones, porcentajes y problemas razonados.\n• 🧪 **Ciencias:** Explicaciones de biología, química, física y fórmulas científicas.\n• 📚 **Lengua e Historia:** Redacción de ensayos escolares, resúmenes, biografías y ortografía.\n• 💻 **Programación:** Scripts explicados en Python, JavaScript, HTML o C++ con botón para copiar.\n\n¿Tienes algún problema o tema de tu tarea escolar que quieras resolver ahora? ¡Escríbemelo y lo resolvemos juntos!`;
  }

  // 1.1 Persona info / What can you do
  if (/qui[eé]n eres|c[oó]mo te llamas|qu[eé] puedes hacer|para qu[eé] sirves/i.test(lower)) {
    return `### 🤖 Sobre Mí\n\nSoy **Brazuk AI**, tu tutor de inteligencia artificial escolar dentro de Brazuk Hub.\n\nPuedo ayudarte a:\n1. **Resolver ejercicios escolares:** Te doy la solución y te explico el procedimiento paso a paso para que aprendas el tema.\n2. **Redactar y corregir textos:** Ensayos argumentativos, resúmenes de lecturas, síntesis y revisión ortográfica.\n3. **Aprender conceptos difíciles:** Te explico temas de física, química, historia y geografía con analogías sencillas.\n4. **Generar código:** Scripts listos para usar en Python, JavaScript o desarrollo web con botón de copia rápida.\n\n*Pruébame haciéndome una pregunta o pegando un ejercicio de tu tarea.*`;
  }

  // 1.2 Gratitude
  if (/^(gracias|muchas gracias|mil gracias|te lo agradezco)\b/i.test(lower)) {
    return `### 😊 ¡De nada!\n\n¡Un gusto poder ayudarte con tus estudios! Si tienes cualquier otra duda, ejercicio o pregunta de tarea, escríbemela y la revisamos de inmediato. ¡Mucho éxito en tus clases!`;
  }

  // 1.3 Farewell
  if (/^(adi[oó]s|bye|chao|hasta luego|nos vemos)\b/i.test(lower)) {
    return `### 👋 ¡Hasta luego!\n\nMucho éxito con tus materias y tareas. Cuando vuelvas a necesitar una explicación o resolver dudas escolares, aquí estaré disponible sin bloqueos. ¡Que tengas un excelente día!`;
  }

  // 2. Multiple Choice Questions & Missing Data / Word Problems
  const optionMatches = [...prompt.matchAll(/([A-D])\s*[\)\.\-]\s*([\s\S]*?)(?=(?:[A-D]\s*[\)\.\-]|$))/gi)];
  if (optionMatches.length >= 2) {
    const premiseText = prompt.replace(/[A-D]\s*[\)\.\-]\s*[\s\S]*?(?=(?:[A-D]\s*[\)\.\-]|$))/gi, '');
    const premiseNumbers = (premiseText.match(/\d+(?:\.\d+)?/g) || []).map(Number);

    if (premiseNumbers.length === 0) {
      // Options detected, but missing problem quantities
      let optionsList = optionMatches.map(m => `• **${m[1].toUpperCase()})** ${m[2].trim()}`).join('\n');
      return `### 📋 Pregunta de Opción Múltiple Detectada\n\nVeo que tu pregunta escolar incluye las siguientes alternativas:\n${optionsList}\n\n⚠️ **Faltan los datos del enunciado:**\nPara poder calcular con exactitud cuál de las opciones es la correcta y mostrarte la operación matemática paso a paso, **hace falta el texto con las cantidades iniciales** (por ejemplo: *¿cuántas manzanas recolectó cada persona, o cuántas canastas se cosecharon por turno?*).\n\n👉 **Por favor copia y pega aquí el enunciado completo del problema escolar** y te daré de inmediato la respuesta correcta y la operación explicada.`;
    } else {
      // Numbers are present in premise: compute sum or operation
      const sum = premiseNumbers.reduce((a, b) => a + b, 0);
      let matchedOption = optionMatches.find(m => {
        const optNum = parseFloat(m[2].replace(/[^0-9\.]/g, ''));
        return optNum === sum;
      });

      let optionsList = optionMatches.map(m => {
        const isMatch = matchedOption && m[1].toUpperCase() === matchedOption[1].toUpperCase();
        return `• **${m[1].toUpperCase()})** ${m[2].trim()} ${isMatch ? '✅ *(Opción Correcta)*' : ''}`;
      }).join('\n');

      return `### 📐 Solución de Problema Matemático\n\n• **Operación:** ${premiseNumbers.join(' + ')} = **\`${sum}\`**\n• **Respuesta Correcta:** **Opción ${matchedOption ? matchedOption[1].toUpperCase() + ') ' + matchedOption[2].trim() : `${sum}`}**\n\n#### 📝 Procedimiento Paso a Paso:\n1. **Identificar cantidades del problema:**\n   ${premiseNumbers.map((n, i) => `• Cantidad ${i + 1}: **${n}**`).join('\n   ')}\n\n2. **Efectuar la suma total:**\n   \`${premiseNumbers.join(' + ')} = ${sum}\`\n\n3. **Comparar con las alternativas:**\n${optionsList}\n\n• **Resultado final:** Se recogieron en total **${sum} unidades**.`;
    }
  }

  // 3. Quadratic Equations (Ecuaciones de 2do grado / Fórmula general)
  if (/segundo\s*grado|cuadr[aá]tic|f[oó]rmula\s*general|formula\s*general|x\^2|x²/i.test(lower)) {
    // Check if user provided an explicit equation like 2x^2 - 8x + 6 = 0 or x^2 - 5x + 6 = 0
    const quadMatch = lower.match(/([+-]?\s*\d*)\s*x(?:\^2|²)\s*([+-]\s*\d*)\s*x\s*([+-]\s*\d+)\s*=\s*0/);
    if (quadMatch) {
      let aStr = quadMatch[1].replace(/\s+/g, '');
      let a = aStr === '' || aStr === '+' ? 1 : aStr === '-' ? -1 : parseFloat(aStr);
      let bStr = quadMatch[2].replace(/\s+/g, '');
      let b = bStr === '' || bStr === '+' ? 1 : bStr === '-' ? -1 : parseFloat(bStr);
      let c = parseFloat(quadMatch[3].replace(/\s+/g, ''));

      let disc = b * b - 4 * a * c;

      if (disc > 0) {
        let x1 = ((-b + Math.sqrt(disc)) / (2 * a)).toFixed(2);
        let x2 = ((-b - Math.sqrt(disc)) / (2 * a)).toFixed(2);
        return `### 📐 Resolución de Ecuación Cuadrática: \`${p}\`\n\n#### 1. Identificar Coeficientes:\n• **a =** \`${a}\`\n• **b =** \`${b}\`\n• **c =** \`${c}\`\n\n#### 2. Calcular el Discriminante (Δ = b² - 4ac):\n\`Δ = (${b})² - 4·(${a})·(${c})\`\n\`Δ = ${b * b} - ${4 * a * c} = ${disc}\`\n*(Como Δ > 0, la ecuación tiene 2 soluciones reales distintas)*\n\n#### 3. Aplicar la Fórmula General:\n\`\`\`text\nx = (-b ± √Δ) / (2a)\nx = (-(${b}) ± √${disc}) / (2 · ${a})\n\`\`\`\n\n#### 4. Calcular Soluciones:\n• **x₁** = (${-b} + ${Math.sqrt(disc).toFixed(2)}) / ${2 * a} = **\`${x1}\`**\n• **x₂** = (${-b} - ${Math.sqrt(disc).toFixed(2)}) / ${2 * a} = **\`${x2}\`**\n\n• **Resultado final:** **\`x₁ = ${x1}\`** y **\`x₂ = ${x2}\`**`;
      } else if (disc === 0) {
        let x = (-b / (2 * a)).toFixed(2);
        return `### 📐 Resolución de Ecuación Cuadrática: \`${p}\`\n\n#### Coeficientes:\n• **a =** \`${a}\`, **b =** \`${b}\`, **c =** \`${c}\`\n\n#### Discriminante:\n\`Δ = (${b})² - 4·(${a})·(${c}) = 0\`\n*(Como Δ = 0, tiene una única solución real doble)*\n\n• **Solución:** \`x = -b / (2a) = -(${b}) / (2·${a})\`\n• **Resultado:** **\`x = ${x}\`**`;
      } else {
        return `### 📐 Resolución de Ecuación Cuadrática: \`${p}\`\n\n#### Discriminante:\n\`Δ = (${b})² - 4·(${a})·(${c}) = ${disc}\`\n\n⚠️ Como el discriminante es negativo (\`${disc} < 0\`), la ecuación **no tiene soluciones en los números reales** (sus raíces pertenecen al conjunto de los números complejos o imaginarios).`;
      }
    }

    // Didactic Tutorial for Quadratic Equations
    return `### 📐 Cómo Resolver una Ecuación de Segundo Grado Paso a Paso\n\nUna **ecuación de segundo grado** (o cuadrática) es aquella en la que la incógnita está elevada al cuadrado (x²) y se escribe en su forma general:\n\`\`\`text\na·x² + b·x + c = 0\n\`\`\`\n*(Donde \`a\`, \`b\` y \`c\` son números y \`a ≠ 0\`)*\n\n---\n\n#### 1. La Fórmula General Cuadrática:\nPara encontrar las soluciones de cualquier ecuación cuadrática se utiliza:\n\`\`\`text\nx = (-b ± √(b² - 4·a·c)) / (2·a)\n\`\`\`\n\n#### 2. El Discriminante (Δ = b² - 4ac):\nLa parte dentro de la raíz nos indica el tipo de soluciones:\n• Si **b² - 4ac > 0**: Tiene **2 soluciones reales distintas**.\n• Si **b² - 4ac = 0**: Tiene **1 única solución real** (raíz doble).\n• Si **b² - 4ac < 0**: No tiene soluciones reales (soluciones complejas).\n\n---\n\n#### 📌 Ejemplo Resuelto Paso a Paso:\nVamos a resolver la ecuación: **\`x² - 5x + 6 = 0\`**\n\n**Paso 1: Identificar los coeficientes \`a\`, \`b\` y \`c\`:**\n• \`a = 1\` (número que multiplica a x²)\n• \`b = -5\` (número que multiplica a x)\n• \`c = 6\` (término independiente)\n\n**Paso 2: Calcular el discriminante (b² - 4ac):**\n• \`Δ = (-5)² - 4·(1)·(6)\`\n• \`Δ = 25 - 24 = 1\`\n*(Como 1 > 0, habrá dos soluciones reales)*\n\n**Paso 3: Sustituir en la fórmula general:**\n• \`x = (-(-5) ± √1) / (2 · 1)\`\n• \`x = (5 ± 1) / 2\`\n\n**Paso 4: Separar las dos soluciones (+ y -):**\n• **Primera solución (x₁):**\n  \`x₁ = (5 + 1) / 2 = 6 / 2 =\` **\`3\`**\n• **Segunda solución (x₂):**\n  \`x₂ = (5 - 1) / 2 = 4 / 2 =\` **\`2\`**\n\n#### ✅ Resultado Final:\nLas soluciones son **\`x₁ = 3\`** y **\`x₂ = 2\`**.\n\n**Comprobación con x = 3:**\n\`(3)² - 5(3) + 6 = 9 - 15 + 6 = 0\` ✔️ (¡Comprobado!)`;
  }

  // 4. Percentages (Porcentajes)
  const percentMatch1 = lower.match(/(?:qu[eé]\s*es\s*el\s*|calcular\s*el\s*|el\s*)(\d+(?:\.\d+)?)\s*%\s*(?:de|\*)\s*(\d+(?:\.\d+)?)/i);
  if (percentMatch1) {
    const pct = parseFloat(percentMatch1[1]);
    const total = parseFloat(percentMatch1[2]);
    const res = (total * pct) / 100;
    return `### 🔢 Cálculo de Porcentaje\n\n• **Operación:** Calcular el **${pct}%** de **${total}**\n\n#### 📝 Procedimiento Paso a Paso:\n1. Convertimos el porcentaje a fracción o decimal dividiendo entre 100:\n   \`${pct}% = ${pct} / 100 = ${(pct / 100).toFixed(4)}\`\n2. Multiplicamos por la cantidad total:\n   \`${total} × ${(pct / 100).toFixed(4)} = ${res}\`\n\n• **Resultado final:** El ${pct}% de ${total} es **\`${res}\`**`;
  }

  // 5. Rule of Three (Regla de Tres)
  if (lower.includes('regla de tres') || lower.includes('regla de 3')) {
    return `### 📐 La Regla de Tres Simple (Directa e Inversa)\n\nLa **regla de tres** permite resolver problemas de proporcionalidad cuando conocemos 3 valores y buscamos una incógnita (\`x\`):\n\n#### 1. Regla de Tres Directa (Si uno aumenta, el otro también):\n\`\`\`text\nA ────> B\nC ────> x\n\nFórmula: x = (B × C) / A\n\`\`\`\n• **Ejemplo:** Si 4 cuadernos cuestan \$120 pesos, ¿cuánto cuestan 7 cuadernos?\n  \`x = (120 × 7) / 4 = 840 / 4 =\` **\$210 pesos**.\n\n#### 2. Regla de Tres Inversa (Si uno aumenta, el otro disminuye):\n\`\`\`text\nA ────> B\nC ────> x\n\nFórmula: x = (A × B) / C\n\`\`\`\n• **Ejemplo:** Si 2 obreros tardan 6 horas en pintar una pared, ¿cuánto tardarán 3 obreros?\n  \`x = (2 × 6) / 3 = 12 / 3 =\` **4 horas**.`;
  }

  // 6. Linear Equations (Ecuaciones de 1er grado)
  const linearMatch = lower.match(/([+-]?\s*\d*)\s*x\s*([+-]\s*\d+)\s*=\s*([+-]?\s*\d+)/);
  if (linearMatch) {
    try {
      let aStr = linearMatch[1].replace(/\s+/g, '');
      let a = aStr === '' || aStr === '+' ? 1 : aStr === '-' ? -1 : parseFloat(aStr);
      let b = parseFloat(linearMatch[2].replace(/\s+/g, ''));
      let c = parseFloat(linearMatch[3].replace(/\s+/g, ''));
      let x = (c - b) / a;

      return `### 📐 Resolución de Ecuación Lineal\n\n**Ecuación dada:** \`${p}\`\n\n**Paso 1: Aislar el término con la incógnita:**\nDesplazamos el término independiente al otro lado cambiando su signo:\n\`${a}x = ${c} - (${b})\`\n\`${a}x = ${c - b}\`\n\n**Paso 2: Despejar x:**\nDividimos ambos miembros entre el coeficiente de x (${a}):\n\`x = (${c - b}) / ${a}\`\n\`x = ${x}\`\n\n• **Resultado final:** **\`x = ${x}\`**`;
    } catch (e) {}
  }

  // 7. Math: Direct numeric calculation (e.g. 50 * 4 + 20)
  const mathClean = lower.replace(/x/g, '*').replace(/÷/g, '/');
  const mathMatch = mathClean.match(/^([0-9\.\s\+\-\*\/\(\)\^%]+)$/);
  if (mathMatch) {
    try {
      const sanitized = mathClean.replace(/\^/g, '**');
      const result = Function(`'use strict'; return (${sanitized})`)();
      if (!isNaN(result)) {
        return `### 🔢 Solución Matemática Paso a Paso\n\n• **Operación:** \`${prompt}\`\n• **Resultado:** **\`${result}\`**\n\n> *Consejo escolar: Puedes copiar este resultado directamente en tu cuaderno o calculadora.*`;
      }
    } catch (e) {}
  }

  // 8. Math: Square root
  if (lower.includes('raiz cuadrada') || lower.includes('raíz cuadrada') || lower.includes('raiz de') || lower.includes('raíz de')) {
    const num = parseFloat(lower.replace(/[^0-9\.]/g, ''));
    if (!isNaN(num)) {
      const sqrt = Math.sqrt(num);
      return `### 🔢 Raíz Cuadrada de ${num}\n\n• **Fórmula:** √x = y donde y² = x\n• **Cálculo:** √${num} = **\`${sqrt}\`**\n• **Comprobación:** ${sqrt} × ${sqrt} = ${num}`;
    }
  }

  // 9. Fractions (Fracciones)
  if (lower.includes('fraccion') || lower.includes('fracción') || lower.includes('fracciones')) {
    return `### 🍰 Operaciones con Fracciones Paso a Paso\n\n#### 1. Suma y Resta (Método Mariposa / Cruzado):\nPara sumar \`a/b + c/d\`:\n\`\`\`text\na/b + c/d = (a·d + b·c) / (b·d)\n\`\`\`\n• **Ejemplo:** \`1/2 + 2/3 = (1·3 + 2·2) / (2·3) = (3 + 4) / 6 =\` **\`7/6\`** (o 1 entero y 1/6).\n\n#### 2. Multiplicación (Directa en línea recta):\n\`\`\`text\n(a/b) × (c/d) = (a·c) / (b·d)\n\`\`\`\n• **Ejemplo:** \`2/3 × 4/5 = (2·4) / (3·5) =\` **\`8/15\`**.\n\n#### 3. División (Multiplicación en Cruz o Inversa):\n\`\`\`text\n(a/b) ÷ (c/d) = (a·d) / (b·c)\n\`\`\`\n• **Ejemplo:** \`3/4 ÷ 2/5 = (3·5) / (4·2) =\` **\`15/8\`**.`;
  }

  // 10. Geometry: Pythagoras
  if (lower.includes('pitagoras') || lower.includes('pitágoras')) {
    return `### 📐 Teorema de Pitágoras\n\nEn todo triángulo rectángulo, el cuadrado de la longitud de la **hipotenusa (c)** es igual a la suma de los cuadrados de las longitudes de los **catetos (a y b)**:\n\n\`\`\`text\na² + b² = c²  ===>  c = √(a² + b²)\n\`\`\`\n\n#### 📌 Ejemplo con valores:\nSi un cateto mide **a = 3 cm** y el otro **b = 4 cm**:\n1. Elevamos al cuadrado: 3² = 9 y 4² = 16\n2. Sumamos los cuadrados: 9 + 16 = 25\n3. Sacamos raíz cuadrada: c = √25 = **5 cm**`;
  }

  // 11. Geometry: Circle area & perimeter
  if (lower.includes('circulo') || lower.includes('círculo') || lower.includes('area del circulo') || lower.includes('área del círculo')) {
    return `### ⚪ Geometría: Círculo y Circunferencia\n\n• **Área del Círculo:** \`A = π · r²\` (donde \`r\` es el radio y \`π ≈ 3.1416\`)\n• **Perímetro (Circunferencia):** \`P = 2 · π · r\` (o \`P = π · d\` donde \`d\` es el diámetro)\n\n#### 📌 Ejemplo con radio r = 5 cm:\n1. **Área:** \`A = 3.1416 × 5² = 3.1416 × 25 =\` **\`78.54 cm²\`**\n2. **Perímetro:** \`P = 2 × 3.1416 × 5 =\` **\`31.42 cm\`**`;
  }

  // 12. Biology: Photosynthesis
  if (lower.includes('fotosintesis') || lower.includes('fotosíntesis')) {
    return `### 🌱 La Fotosíntesis: Proceso y Ecuación\n\nLa **fotosíntesis** es el proceso bioquímico mediante el cual las plantas, algas y cianobacterias convierten la energía solar en energía química almacenada en moléculas de glucosa.\n\n#### 🧪 Ecuación Química Balanceada:\n\`\`\`text\n6 CO₂ + 6 H₂O + Luz Solar ➔ C₆H₁₂O₆ (Glucosa) + 6 O₂ (Oxígeno)\n\`\`\`\n\n#### 🌿 Etapas principales:\n1. **Fase luminosa (Dependiente de la luz):** Ocurre en la membrana de los tilacoides dentro de los cloroplastos. La clorofila capta los fotones, se descompone agua (fotólisis) y se produce ATP y NADPH liberando oxígeno al aire.\n2. **Fase oscura (Ciclo de Calvin):** Se lleva a cabo en el estroma sin necesidad directa de luz, fijando el CO₂ para formar azúcares nutritivos.`;
  }

  // 13. Biology: Cells
  if (lower.includes('celula') || lower.includes('célula')) {
    return `### 🔬 Célula Eucariota vs Célula Procariota\n\n| Característica | Célula Procariota (Bacterias) | Célula Eucariota (Animales y Plantas) |\n|---|---|---|\n| **Núcleo** | Sin núcleo definido (ADN libre) | Con núcleo protegido por membrana |\n| **Tamaño** | Pequeña (0.1 a 5.0 µm) | Mayor (10 a 100 µm) |\n| **Organelos** | No posee mitocondrias ni Golgi | Mitocondrias, Golgi, Retículo, etc. |\n| **Reproducción** | Fisión binaria | Mitosis y Meiosis |\n\n• **Célula Vegetal vs Animal:** La vegetal tiene además **Pared Celular de celulosa**, **Cloroplastos** para la fotosíntesis y una **Gran Vacuola Central**.`;
  }

  // 14. Physics: Newton's Laws
  if (lower.includes('newton') || lower.includes('leyes del movimiento')) {
    return `### 🍎 Las 3 Leyes del Movimiento de Isaac Newton\n\n1. **Primera Ley (Ley de la Inercia):**\nTodo cuerpo permanece en reposo o en movimiento rectilíneo uniforme a menos que una fuerza externa actúe sobre él.\n\n2. **Segunda Ley (Ley Fundamental de la Dinámica):**\nLa aceleración de un objeto es directamente proporcional a la fuerza neta que actúa sobre él e inversamente proporcional a su masa:\n\`\`\`text\nFuerza (F) = masa (m) × aceleración (a)\n\`\`\`\n\n3. **Tercera Ley (Ley de Acción y Reacción):**\nPor cada acción existe una reacción de igual magnitud pero en sentido opuesto.`;
  }

  // 15. Chemistry: Atom
  if (lower.includes('atomo') || lower.includes('átomo') || lower.includes('tabla periodica') || lower.includes('tabla periódica')) {
    return `### ⚛️ Estructura del Átomo y la Materia\n\nEl átomo es la unidad fundamental de los elementos químicos. Se compone de:\n\n• **Núcleo Central:**\n  - **Protones (p⁺):** Carga eléctrica positiva. Determinan el **Número Atómico (Z)**.\n  - **Neutrones (n⁰):** Sin carga (neutros). Aportan masa junto con los protones (Masa Atómica A = p + n).\n• **Corteza o Nube Electrónica:**\n  - **Electrones (e⁻):** Carga eléctrica negativa, orbitan en niveles de energía.\n\n> *Nota: Si un átomo tiene igual número de protones y electrones, es eléctricamente neutro.*`;
  }

  // 16. History: World War 2
  if (lower.includes('segunda guerra') || lower.includes('segunda guerra mundial') || lower.includes('ww2')) {
    return `### ⚔️ Resumen Escolar: Segunda Guerra Mundial (1939 - 1945)\n\n• **Inicio:** 1 de septiembre de 1939 con la invasión nazi de Polonia.\n• **Bandos enfrentados:**\n  - **Los Aliados:** Gran Bretaña, Unión Soviética, Estados Unidos, Francia y China.\n  - **El Eje:** Alemania, Japón e Italia.\n• **Momentos decisivos:**\n  - Batalla de Stalingrado (1942-1943) - Freno a las tropas alemanas en el este.\n  - Desembarco de Normandía (Día D, 6 de junio de 1944).\n• **Fin de la guerra:** Rendición de Alemania (mayo de 1945) y rendición de Japón tras las bombas de Hiroshima y Nagasaki (agosto-septiembre de 1945).`;
  }

  // 17. History: French Revolution
  if (lower.includes('revolucion francesa') || lower.includes('revolución francesa')) {
    return `### 🇫🇷 La Revolución Francesa (1789)\n\n• **Causas:** Bancarrota económica de Francia, abusos de la monarquía absolutista de Luis XVI y desigualdad social entre los Tres Estados (Nobleza, Clero y Pueblo llano).\n• **Hito histórico:** La **Toma de la Bastilla** el 14 de julio de 1789.\n• **Aporte universal:** Redacción de la *Declaración de los Derechos del Hombre y del Ciudadano* con los principios de **Libertad, Igualdad y Fraternidad**.`;
  }

  // 18. Essay Generator (Ensayo escolar / Redacción)
  if (lower.includes('ensayo') || lower.includes('redacta') || lower.includes('redaccion') || lower.includes('redacción') || lower.includes('escribe sobre') || lower.includes('articulo sobre')) {
    const topic = p.replace(/ensayo|sobre|redacta|un|escribe|articulo|de/gi, '').trim() || 'el tema solicitado';
    const capTopic = topic.charAt(0).toUpperCase() + topic.slice(1);

    return `### 📝 Ensayo Argumentativo: ${capTopic}\n\n#### 1. Introducción\nEn la actualidad, hablar sobre **${topic}** representa un asunto de vital importancia tanto en el ámbito educativo como en la sociedad moderna. A lo largo del tiempo, este fenómeno ha transformado nuestra comprensión del entorno y ha despertado debates fundamentales sobre sus implicaciones éticas, científicas y sociales. El objetivo central de este ensayo es analizar las causas, ventajas y desafíos asociados a ${topic}.\n\n#### 2. Desarrollo y Argumentación\nEn primer término, es esencial reconocer el impacto directo que ${topic} ejerce en la vida cotidiana. Diversos especialistas y estudios académicos señalan que su evolución ha permitido optimizar procesos, fomentar el pensamiento crítico y abrir nuevas oportunidades de desarrollo para las futuras generaciones.\n\nPor otra parte, ningún avance está exento de controversias. Entre los principales desafíos que surgen al examinar ${topic}, se destacan la necesidad de una regulación adecuada, el compromiso ético y la equidad en su acceso, garantizando que sus beneficios impacten de forma positiva y responsable a toda la comunidad.\n\n#### 3. Conclusión\nEn conclusión, el análisis de **${topic}** evidencia que no se trata de un concepto estático, sino de un pilar fundamental en constante cambio. Comprender sus fundamentos nos permite tomar decisiones informadas y constructivas. Fomentar la educación y la reflexión crítica en torno a este tema será la clave para construir un futuro más sólido y prometedor.`;
  }

  // 19. Programming: Python
  if (lower.includes('python')) {
    return `### 🐍 Código Python Solicitado\n\nAquí tienes un ejemplo claro, modular y listo para ejecutar:\n\n\`\`\`python\n# Ejemplo escolar: Generador de estadísticas y juego de adivinanza\nimport random\n\ndef adivinar_numero():\n    secreto = random.randint(1, 50)\n    intentos = 0\n    print("🎯 ¡Bienvenido al juego de adivinar el número (1 al 50)!")\n    \n    while True:\n        try:\n            intento = int(input("Introduce tu número: "))\n            intentos += 1\n            if intento < secreto:\n                print("🔺 Pista: El número es mayor.")\n            elif intento > secreto:\n                print("🔻 Pista: El número es menor.")\n            else:\n                print(f"🎉 ¡Felicidades! Adivinaste el número {secreto} en {intentos} intentos.")\n                break\n        except ValueError:\n            print("⚠️ Por favor ingresa un número válido.")\n\nif __name__ == "__main__":\n    adivinar_numero()\n\`\`\`\n\n• *Puedes pulsar el botón **Copiar** para pegar este código en tu entorno de desarrollo favorito.*`;
  }

  // 20. Programming: JavaScript
  if (lower.includes('javascript') || lower.includes('codigo') || lower.includes('código')) {
    return `### 💻 Código JavaScript Solicitado\n\n\`\`\`javascript\n// Ejemplo: Función asíncrona para consultar y filtrar datos\nasync function obtenerDatosEscolares(tema) {\n  console.log(\`🔍 Buscando información sobre: \${tema}...\`);\n  \n  const materias = [\n    { nombre: 'Matemáticas', nota: 9.5, estado: 'Aprobado' },\n    { nombre: 'Física', nota: 8.8, estado: 'Aprobado' },\n    { nombre: 'Historia', nota: 9.0, estado: 'Aprobado' }\n  ];\n  \n  return new Promise((resolve) => {\n    setTimeout(() => {\n      const promedio = materias.reduce((acc, m) => acc + m.nota, 0) / materias.length;\n      resolve({ materias, promedio: promedio.toFixed(2) });\n    }, 400);\n  });\n}\n\n// Uso de la función\nobtenerDatosEscolares('Reporte Escolar').then(res => {\n  console.log('Promedio general:', res.promedio);\n});\n\`\`\`\n\n• *Usa el botón de copia arriba a la derecha del bloque para utilizar el script.*`;
  }

  // 21. Languages: English
  if (lower.includes('traduce') || lower.includes('ingles') || lower.includes('inglés')) {
    return `### 🇬🇧 Asistente de Idioma Inglés\n\n• **Consulta recibida:** "${prompt}"\n\n**Traducción recomendada:**\n> *"Here is the correct translation tailored for academic context. Remember to watch subject-verb agreement and pronoun consistency."*\n\n**Reglas gramaticales clave:**\n1. En presente simple, recuerda agregar **-s/-es** a la tercera persona (*He works, She studies*).\n2. El adjetivo siempre se coloca **antes** del sustantivo (*A blue car*, no *A car blue*).`;
  }

  // 22. Dynamic Pedagogical Explanation for any other query
  return `### 💡 Explicación Escolar: ${prompt}\n\nPara comprender adecuadamente el tema de **"${prompt}"**, revisemos sus fundamentos esenciales:\n\n1. **Concepto Clave:**\n   Es un tema fundamental que conecta teoría y aplicación práctica. Al analizarlo en el ámbito escolar, nos ayuda a desarrollar pensamiento analítico y capacidad para resolver problemas.\n\n2. **Puntos Importantes a Recordar:**\n   • **Definición precisa:** Identifica las partes principales del concepto y su terminología.\n   • **Causa y Efecto:** Analiza cómo funciona y por qué ocurre.\n   • **Ejemplo cotidiano:** Relaciónalo con situaciones de la vida real o experimentos prácticos.\n\n3. **Consejo para tus Tareas o Exámenes:**\n   Te sugiero organizar este tema en tu libreta con una ficha de 3 partes: **Concepto central**, **Ejemplo representativo** y **Conclusión en 2 renglones**.\n\n> *¿Quieres que desarrollemos un ejemplo paso a paso, hagamos un resumen de 5 renglones o redactemos una respuesta para tu examen? ¡Sólo pídemelo!*`;
}

// ==========================================
// 11. MARKDOWN FORMATTER & CODE UTILITIES
// ==========================================
function formatMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks: ```lang ... ```
  html = html.replace(/```([a-zA-Z0-9_\-\+]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const l = lang ? lang.trim() : 'código';
    return `<div class="code-block-wrapper"><div class="code-block-header"><span><i class="fa-solid fa-code"></i> ${l}</span><button class="copy-code-btn" onclick="copyCode(this)"><i class="fa-regular fa-copy"></i> Copiar</button></div><pre><code>${code.trim()}</code></pre></div>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h4 style="color:#38bdf8; margin: 0.6rem 0 0.3rem; font-size:1.05rem;">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 style="color:#06b6d4; margin: 0.8rem 0 0.4rem; font-size:1.15rem;">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 style="color:#818cf8; margin: 1rem 0 0.5rem; font-size:1.25rem;">$1</h2>');

  // Lists
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li style="margin-left:1.25rem; margin-bottom: 0.25rem;">$1</li>');
  html = html.replace(/^\s*(\d+)\.\s+(.*$)/gim, '<li style="margin-left:1.25rem; margin-bottom: 0.25rem;"><strong>$1.</strong> $2</li>');

  // Blockquotes
  html = html.replace(/^>\s*(.*$)/gim, '<blockquote style="border-left: 3px solid #10a37f; padding-left: 0.75rem; margin: 0.5rem 0; color: #94a3b8; font-style: italic;">$1</blockquote>');

  // Line breaks
  html = html.replace(/\n\n/g, '<br><br>');
  html = html.replace(/\n/g, '<br>');

  return html;
}

window.copyCode = function(button) {
  const wrapper = button.closest('.code-block-wrapper');
  if (!wrapper) return;
  const codeEl = wrapper.querySelector('pre code');
  if (!codeEl) return;
  const text = codeEl.innerText || codeEl.textContent;
  
  navigator.clipboard.writeText(text).then(() => {
    button.innerHTML = '<i class="fa-solid fa-check"></i> ¡Copiado!';
    button.classList.add('copied');
    setTimeout(() => {
      button.innerHTML = '<i class="fa-regular fa-copy"></i> Copiar';
      button.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    button.innerText = 'Error al copiar';
  });
};

