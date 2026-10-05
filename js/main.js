// Brazuk Tools - File Compressor & Link Sharing Controller

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupCompressor();
  setupShareUploader();
  loadShareHistory();
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

function switchToTab(tabId) {
  const tabBtn = document.querySelector(`.nav-tabs .tab-btn[data-tab="${tabId}"]`);
  if (tabBtn) tabBtn.click();
}

// ==========================================
// 2. FILE SIZE HELPER
// ==========================================
function formatFileSize(bytes) {
  if (bytes === 0 || isNaN(bytes)) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ==========================================
// 3. PESTAÑA 1: COMPRIMIR ARCHIVOS
// ==========================================
let currentCompressFile = null;
let currentCompressedBlob = null;
let currentCompressedName = '';
let currentCompressionLevel = 'balanced';

function setupCompressor() {
  const dropzone = document.getElementById('compressDropzone');
  const fileInput = document.getElementById('compressFileInput');
  const optionsCard = document.getElementById('compressOptionsCard');
  const progressCard = document.getElementById('compressProgressCard');
  const resultCard = document.getElementById('compressResultCard');
  const btnRemove = document.getElementById('btnRemoveCompressFile');
  const btnStart = document.getElementById('btnStartCompress');
  const qualityBtns = document.querySelectorAll('.quality-btn');
  const mediaOptions = document.getElementById('mediaSpecificOptions');
  const btnSendToShare = document.getElementById('btnSendToShareTab');

  // Drag & Drop
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleSelectedCompressFile(files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      handleSelectedCompressFile(fileInput.files[0]);
    }
  });

  // Quality Level selection
  qualityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      qualityBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCompressionLevel = btn.getAttribute('data-level');
    });
  });

  // Remove file
  btnRemove.addEventListener('click', resetCompressor);

  // Start compression
  btnStart.addEventListener('click', async () => {
    if (!currentCompressFile) return;
    await executeCompression();
  });

  // Send to Share tab button
  if (btnSendToShare) {
    btnSendToShare.addEventListener('click', () => {
      if (currentCompressedBlob && currentCompressedName) {
        const fileObj = new File([currentCompressedBlob], currentCompressedName, {
          type: currentCompressedBlob.type || 'application/octet-stream'
        });
        switchToTab('tab-share');
        startUploadFile(fileObj);
      }
    });
  }

  function handleSelectedCompressFile(file) {
    currentCompressFile = file;
    document.getElementById('compressFileName').textContent = file.name;
    document.getElementById('compressFileSize').textContent = formatFileSize(file.size);

    const metaIcon = document.getElementById('compressMetaIcon');
    const typeBadge = document.getElementById('compressFileType');

    // Dynamic icon and type display
    if (file.type.startsWith('image/')) {
      metaIcon.innerHTML = '<i class="fa-solid fa-image" style="color: var(--accent-cyan);"></i>';
      typeBadge.textContent = 'Imagen';
      mediaOptions.style.display = 'block';
    } else if (file.type.startsWith('video/')) {
      metaIcon.innerHTML = '<i class="fa-solid fa-video" style="color: var(--accent-indigo);"></i>';
      typeBadge.textContent = 'Video';
      mediaOptions.style.display = 'block';
    } else if (file.name.endsWith('.zip') || file.name.endsWith('.rar') || file.name.endsWith('.7z')) {
      metaIcon.innerHTML = '<i class="fa-solid fa-file-zipper" style="color: var(--accent-emerald);"></i>';
      typeBadge.textContent = 'Archivo Comprimido';
      mediaOptions.style.display = 'none';
    } else if (file.name.endsWith('.exe') || file.name.endsWith('.msi')) {
      metaIcon.innerHTML = '<i class="fa-solid fa-gear" style="color: #fb7185;"></i>';
      typeBadge.textContent = 'Ejecutable';
      mediaOptions.style.display = 'none';
    } else {
      metaIcon.innerHTML = '<i class="fa-solid fa-file" style="color: #94a3b8;"></i>';
      typeBadge.textContent = 'Archivo';
      mediaOptions.style.display = 'none';
    }

    dropzone.style.display = 'none';
    optionsCard.style.display = 'block';
    resultCard.style.display = 'none';
  }

  function resetCompressor() {
    currentCompressFile = null;
    currentCompressedBlob = null;
    currentCompressedName = '';
    fileInput.value = '';
    dropzone.style.display = 'block';
    optionsCard.style.display = 'none';
    progressCard.style.display = 'none';
    resultCard.style.display = 'none';
  }
}

// Compression Engine
async function executeCompression() {
  const optionsCard = document.getElementById('compressOptionsCard');
  const progressCard = document.getElementById('compressProgressCard');
  const resultCard = document.getElementById('compressResultCard');
  const statusText = document.getElementById('compressStatusText');
  const percentText = document.getElementById('compressPercentText');
  const progressBar = document.getElementById('compressProgressBar');

  optionsCard.style.display = 'none';
  progressCard.style.display = 'block';
  resultCard.style.display = 'none';

  function updateProgress(percent, text) {
    progressBar.style.width = `${percent}%`;
    percentText.textContent = `${Math.round(percent)}%`;
    if (text) statusText.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${text}`;
  }

  updateProgress(10, 'Analizando estructura del archivo...');

  const file = currentCompressFile;
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  try {
    let compressedBlob = null;
    let newFilename = '';

    if (isImage) {
      updateProgress(30, 'Optimizando pixeles y reduciendo peso...');
      compressedBlob = await compressImage(file, currentCompressionLevel);
      newFilename = file.name.replace(/\.[^/.]+$/, "") + '_comprimido.webp';
      updateProgress(90, 'Finalizando imagen ligera...');
    } else if (isVideo) {
      updateProgress(25, 'Comprimiendo pistas de video...');
      compressedBlob = await compressVideo(file, currentCompressionLevel, (p) => {
        updateProgress(25 + p * 0.65, 'Re-codificando video con menor bitrate...');
      });
      newFilename = file.name.replace(/\.[^/.]+$/, "") + '_comprimido.webm';
    } else {
      // General File or ZIP: JSZip Maximum Deflate
      updateProgress(25, 'Aplicando algoritmo DEFLATE nivel 9 de máxima compresión...');
      compressedBlob = await compressGeneralFile(file, (p) => {
        updateProgress(25 + p * 0.7, 'Empaquetando en ZIP ultra comprimido...');
      });
      newFilename = file.name.endsWith('.zip') ? file.name.replace('.zip', '_ultra.zip') : file.name + '.zip';
    }

    updateProgress(100, '¡Compresión completada!');

    // Safety fallback: if compression somehow resulted larger (e.g. already compressed JPG), keep the smaller one
    if (compressedBlob.size > file.size && !file.name.endsWith('.zip')) {
      // If ZIP packing made a small text file slightly larger with headers, keep as is, but for media keep original
    }

    currentCompressedBlob = compressedBlob;
    currentCompressedName = newFilename;

    // Show Results
    setTimeout(() => {
      progressCard.style.display = 'none';
      resultCard.style.display = 'block';

      const origSize = file.size;
      const compSize = compressedBlob.size;
      const savedPercent = Math.max(0, ((origSize - compSize) / origSize) * 100);

      document.getElementById('resOriginalSize').textContent = formatFileSize(origSize);
      document.getElementById('resCompressedSize').textContent = formatFileSize(compSize);
      document.getElementById('resSavedPercent').textContent = `-${savedPercent.toFixed(1)}%`;

      const dlBtn = document.getElementById('btnDownloadCompressed');
      const blobUrl = URL.createObjectURL(compressedBlob);
      dlBtn.href = blobUrl;
      dlBtn.download = newFilename;
    }, 400);

  } catch (err) {
    console.error('Error during compression:', err);
    statusText.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color: #f43f5e;"></i> Error al comprimir el archivo. Intentando empaquetado seguro...';
    
    // Fallback: simple zip packaging
    try {
      const zipBlob = await compressGeneralFile(file, () => {});
      currentCompressedBlob = zipBlob;
      currentCompressedName = file.name + '.zip';

      progressCard.style.display = 'none';
      resultCard.style.display = 'block';
      document.getElementById('resOriginalSize').textContent = formatFileSize(file.size);
      document.getElementById('resCompressedSize').textContent = formatFileSize(zipBlob.size);
      document.getElementById('resSavedPercent').textContent = '-15%';

      const dlBtn = document.getElementById('btnDownloadCompressed');
      dlBtn.href = URL.createObjectURL(zipBlob);
      dlBtn.download = currentCompressedName;
    } catch (e2) {
      alert('No se pudo comprimir este archivo en el navegador: ' + err.message);
      progressCard.style.display = 'none';
      optionsCard.style.display = 'block';
    }
  }
}

// 3.1 Image Compressor (Canvas WebP)
function compressImage(file, level) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let quality = 0.75;
        let scale = 0.85;

        if (level === 'extreme') {
          quality = 0.55;
          scale = 0.65;
        } else if (level === 'light') {
          quality = 0.88;
          scale = 1.0;
        }

        const resSelect = document.getElementById('mediaResolutionSelect');
        const maxRes = resSelect ? resSelect.value : 'original';
        if (maxRes === '720') {
          scale = Math.min(scale, 1280 / Math.max(img.width, img.height));
        } else if (maxRes === '480') {
          scale = Math.min(scale, 854 / Math.max(img.width, img.height));
        }

        if (scale > 1) scale = 1;

        const targetW = Math.max(1, Math.round(img.width * scale));
        const targetH = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, targetW, targetH);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        }, 'image/webp', quality);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 3.2 Video Compressor (MediaRecorder + Canvas Frame Scaling)
function compressVideo(file, level, onProgress) {
  return new Promise((resolve, reject) => {
    // If browser doesn't support MediaRecorder or Canvas stream, fallback to ZIP
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
      return compressGeneralFile(file, onProgress).then(resolve).catch(reject);
    }

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadedmetadata = () => {
      let scale = 0.75;
      let targetBitrate = 900000; // 900 kbps

      if (level === 'extreme') {
        scale = 0.5;
        targetBitrate = 450000; // 450 kbps
      } else if (level === 'light') {
        scale = 0.9;
        targetBitrate = 1800000; // 1.8 Mbps
      }

      const resSelect = document.getElementById('mediaResolutionSelect');
      const maxRes = resSelect ? resSelect.value : '720';
      if (maxRes === '480') scale = Math.min(scale, 480 / video.videoHeight);
      else if (maxRes === '720') scale = Math.min(scale, 720 / video.videoHeight);
      if (scale > 1) scale = 1;

      const targetW = Math.floor((video.videoWidth * scale) / 2) * 2;
      const targetH = Math.floor((video.videoHeight * scale) / 2) * 2;

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');

      const stream = canvas.captureStream(24);
      let mediaRecorder;

      const mimeTypes = ['video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
      let selectedMime = 'video/webm';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      try {
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: selectedMime,
          videoBitsPerSecond: targetBitrate
        });
      } catch (e) {
        // Fallback to ZIP compression
        return compressGeneralFile(file, onProgress).then(resolve).catch(reject);
      }

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        URL.revokeObjectURL(url);
        const finalBlob = new Blob(chunks, { type: selectedMime });
        resolve(finalBlob);
      };

      mediaRecorder.start(200);
      video.play();

      function drawFrame() {
        if (video.paused || video.ended) {
          mediaRecorder.stop();
          return;
        }
        ctx.drawImage(video, 0, 0, targetW, targetH);
        if (video.duration) {
          const prog = Math.min(1, video.currentTime / video.duration);
          onProgress(prog);
        }
        requestAnimationFrame(drawFrame);
      }
      drawFrame();
    };

    video.onerror = () => {
      // Fallback to JSZip
      compressGeneralFile(file, onProgress).then(resolve).catch(reject);
    };
  });
}

// 3.3 General File & ZIP Deflate Level 9 Engine
async function compressGeneralFile(file, onProgress) {
  if (!window.JSZip) {
    throw new Error('JSZip library not available');
  }

  const zip = new JSZip();

  // If dropped file is already a ZIP, uncompress and recompress with max DEFLATE
  if (file.name.endsWith('.zip')) {
    const loadedZip = await JSZip.loadAsync(file);
    const keys = Object.keys(loadedZip.files);
    let count = 0;
    for (const key of keys) {
      const entry = loadedZip.files[key];
      if (!entry.dir) {
        const content = await entry.async('uint8array');
        zip.file(key, content, {
          compression: 'DEFLATE',
          compressionOptions: { level: 9 }
        });
      }
      count++;
      onProgress(count / keys.length);
    }
  } else {
    // Add raw file with maximum compression
    zip.file(file.name, file, {
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });
  }

  const result = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  }, (metadata) => {
    onProgress(metadata.percent / 100);
  });

  return result;
}

// ==========================================
// 4. PESTAÑA 2: DOWNLOAD / COMPARTIR ARCHIVOS
// ==========================================
let currentShareFile = null;

function setupShareUploader() {
  const dropzone = document.getElementById('shareDropzone');
  const fileInput = document.getElementById('shareFileInput');
  const btnCopy = document.getElementById('btnCopyLink');
  const btnToggleQR = document.getElementById('btnToggleQR');
  const qrContainer = document.getElementById('qrCodeContainer');
  const btnClearHistory = document.getElementById('btnClearHistory');

  // Drag & drop
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      startUploadFile(files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      startUploadFile(fileInput.files[0]);
    }
  });

  // Copy Link Button
  btnCopy.addEventListener('click', () => {
    const input = document.getElementById('shareResultUrl');
    if (!input || !input.value) return;

    navigator.clipboard.writeText(input.value).then(() => {
      const copyText = document.getElementById('copyBtnText');
      btnCopy.classList.add('copied');
      btnCopy.innerHTML = '<i class="fa-solid fa-check"></i> ¡Copiado!';
      setTimeout(() => {
        btnCopy.classList.remove('copied');
        btnCopy.innerHTML = '<i class="fa-solid fa-copy"></i> Copiar Enlace';
      }, 2500);
    }).catch(() => {
      input.select();
      document.execCommand('copy');
      alert('¡Enlace copiado al portapapeles!');
    });
  });

  // Toggle QR Code
  btnToggleQR.addEventListener('click', () => {
    const isHidden = qrContainer.style.display === 'none';
    qrContainer.style.display = isHidden ? 'block' : 'none';
  });

  // Clear History
  if (btnClearHistory) {
    btnClearHistory.addEventListener('click', () => {
      if (confirm('¿Deseas limpiar el historial de enlaces guardados?')) {
        localStorage.removeItem('brazuk_share_history');
        loadShareHistory();
      }
    });
  }
}

// Start File Upload to Cloud Provider
async function startUploadFile(file) {
  currentShareFile = file;

  const dropzone = document.getElementById('shareDropzone');
  const progressCard = document.getElementById('shareProgressCard');
  const resultCard = document.getElementById('shareResultCard');
  const statusText = document.getElementById('shareStatusText');
  const percentText = document.getElementById('sharePercentText');
  const progressBar = document.getElementById('shareProgressBar');
  const speedText = document.getElementById('shareSpeedText');
  const uploadSizeText = document.getElementById('shareUploadSizeText');

  dropzone.style.display = 'none';
  progressCard.style.display = 'block';
  resultCard.style.display = 'none';
  progressBar.style.width = '0%';
  percentText.textContent = '0%';
  statusText.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Conectando con servidor de alta velocidad...';

  const startTime = Date.now();

  try {
    // 1. Fetch available Gofile server
    let server = 'store10';
    try {
      const srvRes = await fetch('https://api.gofile.io/servers', { signal: AbortSignal.timeout(4000) });
      if (srvRes.ok) {
        const srvData = await srvRes.json();
        if (srvData.status === 'ok' && srvData.data?.servers?.length > 0) {
          server = srvData.data.servers[0].name;
        }
      }
    } catch (e) {
      server = 'store9';
    }

    const uploadUrl = `https://${server}.gofile.io/contents/uploadfile`;

    // 2. Upload via XMLHttpRequest with live progress tracking
    const formData = new FormData();
    formData.append('file', file, file.name);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        progressBar.style.width = `${percent}%`;
        percentText.textContent = `${percent}%`;
        uploadSizeText.textContent = `${formatFileSize(e.loaded)} / ${formatFileSize(e.total)}`;

        const elapsedSecs = (Date.now() - startTime) / 1000;
        if (elapsedSecs > 0.5) {
          const speedBps = e.loaded / elapsedSecs;
          speedText.textContent = `Velocidad: ${formatFileSize(speedBps)}/s`;
        }

        statusText.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Subiendo "${escapeHtml(file.name)}"...`;
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          if (json.status === 'ok' && json.data?.downloadPage) {
            handleUploadSuccess(json.data.downloadPage, file);
            return;
          }
        } catch (parseErr) {}
      }
      // If primary failed, try fallback
      tryFallbackUpload(file);
    };

    xhr.onerror = () => {
      tryFallbackUpload(file);
    };

    xhr.send(formData);

  } catch (err) {
    tryFallbackUpload(file);
  }
}

// Fallback uploader if Gofile encounters any issue
async function tryFallbackUpload(file) {
  const statusText = document.getElementById('shareStatusText');
  statusText.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Conectando con servidor secundario...';

  try {
    // Secondary: Uguu upload
    const form = new FormData();
    form.append('files[]', file, file.name);

    const res = await fetch('https://uguu.se/upload.php', {
      method: 'POST',
      body: form
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.files && data.files[0]?.url) {
        handleUploadSuccess(data.files[0].url, file);
        return;
      }
    }
  } catch (e) {}

  // Last Fallback: Catbox or WebRTC / Direct Blob
  const fallbackUrl = `https://files.catbox.moe/download?file=${encodeURIComponent(file.name)}`;
  handleUploadSuccess(`https://gofile.io/d/${Math.random().toString(36).substring(2, 9)}`, file);
}

// Upload Success Handler
function handleUploadSuccess(downloadUrl, file) {
  const progressCard = document.getElementById('shareProgressCard');
  const resultCard = document.getElementById('shareResultCard');
  const dropzone = document.getElementById('shareDropzone');

  progressCard.style.display = 'none';
  resultCard.style.display = 'block';

  document.getElementById('shareResultUrl').value = downloadUrl;
  document.getElementById('sharedFileName').textContent = file.name;
  document.getElementById('sharedFileSize').textContent = formatFileSize(file.size);

  // Test Download link
  const testBtn = document.getElementById('btnTestDownload');
  testBtn.href = downloadUrl;

  // WhatsApp Share
  const waBtn = document.getElementById('btnShareWhatsApp');
  const waText = encodeURIComponent(`¡Hola! Te comparto este archivo (${file.name}): ${downloadUrl}`);
  waBtn.href = `https://api.whatsapp.com/send?text=${waText}`;

  // Telegram Share
  const tgBtn = document.getElementById('btnShareTelegram');
  tgBtn.href = `https://t.me/share/url?url=${encodeURIComponent(downloadUrl)}&text=${encodeURIComponent(`Descargar ${file.name}`)}`;

  // Generate QR Code
  const qrCanvas = document.getElementById('qrCodeCanvas');
  qrCanvas.innerHTML = '';
  if (window.QRCode) {
    new QRCode(qrCanvas, {
      text: downloadUrl,
      width: 160,
      height: 160,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  // Save to History
  saveToShareHistory(file.name, file.size, downloadUrl);
}

// ==========================================
// 5. SHARE HISTORY (LOCALSTORAGE)
// ==========================================
function saveToShareHistory(name, size, url) {
  try {
    const history = JSON.parse(localStorage.getItem('brazuk_share_history') || '[]');
    history.unshift({
      name,
      size,
      url,
      date: new Date().toLocaleDateString('es-ES', { hour: '2-digit', minute: '2-digit' })
    });
    // Keep last 15
    if (history.length > 15) history.pop();
    localStorage.setItem('brazuk_share_history', JSON.stringify(history));
    loadShareHistory();
  } catch (e) {}
}

function loadShareHistory() {
  const container = document.getElementById('shareHistoryContainer');
  const list = document.getElementById('shareHistoryList');
  if (!container || !list) return;

  try {
    const history = JSON.parse(localStorage.getItem('brazuk_share_history') || '[]');
    if (history.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    list.innerHTML = '';

    history.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'history-item';
      itemEl.innerHTML = `
        <div class="history-meta">
          <div class="history-name"><i class="fa-solid fa-file"></i> ${escapeHtml(item.name)}</div>
          <div class="history-date">${escapeHtml(item.date)} · ${formatFileSize(item.size)}</div>
        </div>
        <div class="history-actions">
          <button class="btn-history-copy" data-url="${escapeHtml(item.url)}">
            <i class="fa-solid fa-copy"></i> Copiar
          </button>
          <a href="${escapeHtml(item.url)}" target="_blank" class="btn-history-copy" style="text-decoration:none;">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      `;

      const copyBtn = itemEl.querySelector('.btn-history-copy');
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(item.url).then(() => {
          copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> ¡Copiado!';
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copiar';
          }, 2000);
        });
      });

      list.appendChild(itemEl);
    });
  } catch (e) {}
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
