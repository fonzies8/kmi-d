/**
 * Admin Panel Helper Functions
 * Tüm admin sayfaları tarafından kullanılan ortak fonksiyonlar
 */

/**
 * API çağrısı yapan fonksiyon
 * @param {string} url - API endpoint'i
 * @param {object} options - fetch options (method, body, vb.)
 * @returns {Promise} - Response data
 */
async function fetchAPI(url, options = {}) {
  const defaultOptions = {
    method: 'GET',
    credentials: 'include', // Session cookies
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const finalOptions = { ...defaultOptions, ...options };

  // FormData kullanılıyorsa Content-Type'ı kaldır
  if (options.body instanceof FormData) {
    delete finalOptions.headers['Content-Type'];
  }

  try {
    console.log(`[API] ${finalOptions.method} ${url}`);
    const response = await fetch(url, finalOptions);

    // 401 Unauthorized - Session süresi dolmuş
    if (response.status === 401 || response.url.includes('/login')) {
      window.location.href = '/admin/login';
      throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
    }

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      if (contentType?.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // JSON parse hatası, hata mesajını kullan
        }
      }

      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error('Sunucu JSON döndürmedi');
    }

    const data = await response.json();
    console.log(`[API] Response:`, data);

    if (!data.success && data.message) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    console.error(`[API ERROR] ${error.message}`);
    throw error;
  }
}

/**
 * Uyarı/Bildirim mesajı göster
 * @param {string} message - Mesaj metni
 * @param {string} type - Mesaj türü (success, danger, warning, info)
 * @param {number} duration - Gösterilme süresi (ms), 0 = kapalı
 */
function showAlert(message, type = 'info', duration = 4000) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show alert-fixed`;
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  document.body.appendChild(alertDiv);
  
  // Auto close
  if (duration > 0) {
    setTimeout(() => {
      alertDiv.remove();
    }, duration);
  }

  // Bootstrap toast ekle
  return new bootstrap.Alert(alertDiv);
}

/**
 * Silme işlemi için onay isteği
 * @param {string} message - Onay mesajı
 * @returns {boolean} - Kullanıcı onay verdi mi
 */
function confirmDelete(message = 'Bu işlem geri alınamaz. Emin misiniz?') {
  return confirm(message);
}

/**
 * Resim önizlemesi göster
 * @param {HTMLInputElement} input - File input elemanı
 * @param {string} previewElementId - Önizleme div'inin ID'si
 */
function previewImages(input, previewElementId) {
  const previewDiv = document.getElementById(previewElementId);
  if (!previewDiv) return;

  previewDiv.innerHTML = '';

  const files = input.files;
  if (!files || files.length === 0) return;

  for (let i = 0; i < Math.min(files.length, 10); i++) {
    const file = files[i];

    // Resim formatı kontrolü
    if (!file.type.startsWith('image/')) {
      showAlert(`${file.name} bir resim dosyası değildir`, 'warning');
      continue;
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5242880) {
      showAlert(`${file.name} çok büyük (max 5MB)`, 'warning');
      continue;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.className = 'image-preview';
      previewDiv.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
}

/**
 * Tarih formatı
 * @param {Date} date - Tarih nesnesi
 * @returns {string} - Türkçe formatında tarih
 */
function formatDate(date) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleDateString('tr-TR');
}

/**
 * Tarih ve saat formatı
 * @param {Date} date - Tarih nesnesi
 * @returns {string} - Türkçe formatında tarih ve saat
 */
function formatDateTime(date) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleString('tr-TR');
}

/**
 * Sayfa başında loading göster
 */
function showLoading() {
  document.body.style.pointerEvents = 'none';
  document.body.style.opacity = '0.6';
}

/**
 * Loading bitir
 */
function hideLoading() {
  document.body.style.pointerEvents = 'auto';
  document.body.style.opacity = '1';
}

/**
 * Sayfayı yenile
 */
function reloadPage() {
  location.reload();
}

// Console logunu debug modunda etkinleştir
const DEBUG = true;
function debugLog(...args) {
  if (DEBUG && console) {
    console.log('[DEBUG]', ...args);
  }
}
