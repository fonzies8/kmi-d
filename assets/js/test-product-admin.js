// Check session status on page load
async function checkSession() {
    try {
        console.log('[TEST PRODUCT] Checking session...');
        const response = await fetch('/admin/api/test/session', {
            credentials: 'include'
        });
        const data = await response.json();
        console.log('[TEST PRODUCT] Session check result:', data);

        const statusBadge = document.getElementById('sessionStatus');
        if (data.success && data.authenticated) {
            statusBadge.className = 'badge bg-success';
            statusBadge.textContent = 'Oturum Aktif (User ID: ' + data.session.userId + ')';
        } else {
            statusBadge.className = 'badge bg-danger';
            statusBadge.textContent = 'Oturum Yok - Giriş Yapın';
            statusBadge.innerHTML = 'Oturum Yok - <a href="/admin/login" class="text-white">Giriş Yap</a>';
        }
    } catch (error) {
        const statusBadge = document.getElementById('sessionStatus');
        statusBadge.className = 'badge bg-warning';
        statusBadge.textContent = 'Kontrol Edilemedi';
        console.error('[TEST PRODUCT] Session check error:', error);
    }
}

// Initialize
window.addEventListener('load', function () {
    checkSession();

    const testProductForm = document.getElementById('testProductForm');
    if (testProductForm) {
        testProductForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const resultsDiv = document.getElementById('testResults');
            resultsDiv.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Yükleniyor...</span></div><p class="mt-2">Ürün kaydediliyor...</p></div>';

            const formData = new FormData(this);

            try {
                console.log('[TEST PRODUCT] Starting product creation...');
                console.log('[TEST PRODUCT] Form Data:', {
                    name: formData.get('name'),
                    description: formData.get('description'),
                    category: formData.get('category'),
                    images: formData.getAll('images').length + ' dosya'
                });

                const response = await fetch('/admin/api/test/create-product', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                console.log('[TEST PRODUCT] Response URL:', response.url);
                console.log('[TEST PRODUCT] Response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('[TEST PRODUCT] Error response:', errorText);
                    throw new Error('HTTP ' + response.status + ': ' + errorText);
                }

                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    throw new Error('Beklenmeyen yanıt formatı: ' + text.substring(0, 100));
                }

                const data = await response.json();
                console.log('[TEST PRODUCT] Response data:', data);

                if (data.success) {
                    let html = '<div class="alert alert-success"><h6><i class="fas fa-check-circle"></i> Başarılı!</h6>';
                    html += '<p class="mb-1"><strong>Mesaj:</strong> ' + (data.message || 'Ürün başarıyla kaydedildi!') + '</p>';

                    if (data.product) {
                        html += '<hr>';
                        html += '<p class="mb-1"><strong>Ürün ID:</strong> #' + data.product.id + '</p>';
                        html += '<p class="mb-1"><strong>Ürün Adı:</strong> ' + data.product.name + '</p>';
                        html += '<p class="mb-1"><strong>Kategori:</strong> ' + (data.product.category || '-') + '</p>';
                        html += '<p class="mb-1"><strong>Durum:</strong> <span class="badge bg-success">' + (data.product.status || 'active') + '</span></p>';
                        html += '<p class="mb-0"><strong>Resim Sayısı:</strong> ' + (data.product.images ? data.product.images.length : 0) + '</p>';
                    }

                    html += '</div>';
                    html += '<div class="mt-3">';
                    html += '<button class="btn btn-sm btn-outline-primary" onclick="location.reload()"><i class="fas fa-redo"></i> Yeni Ürün Ekle</button>';
                    html += '<a href="/admin/products" class="btn btn-sm btn-outline-success"><i class="fas fa-list"></i> Tüm Ürünleri Gör</a>';
                    html += '</div>';

                    resultsDiv.innerHTML = html;
                    testProductForm.reset();
                } else {
                    let html = '<div class="alert alert-danger"><h6><i class="fas fa-times-circle"></i> Hata!</h6>';
                    html += '<p class="mb-1"><strong>Mesaj:</strong> ' + (data.message || 'Bir hata oluştu!') + '</p>';

                    if (data.error) {
                        html += '<p class="mb-1 mt-2"><small><strong>Detay:</strong> ' + data.error + '</small></p>';
                    }

                    if (data.requiresLogin) {
                        html += '<p class="mb-0 mt-2"><a href="/admin/login" class="btn btn-sm btn-primary">Giriş Yap</a></p>';
                    }

                    html += '</div>';
                    resultsDiv.innerHTML = html;
                }
            } catch (error) {
                console.error('[TEST PRODUCT] Error:', error);
                console.error('[TEST PRODUCT] Error stack:', error.stack);

                let html = '<div class="alert alert-danger"><h6><i class="fas fa-exclamation-triangle"></i> Hata Oluştu!</h6>';
                html += '<p class="mb-1"><strong>Hata:</strong> ' + error.message + '</p>';
                html += '<p class="mb-1"><small>Console\'u kontrol edin (F12) daha fazla detay için.</small></p>';
                html += '<p class="mb-0"><small><strong>Olası Nedenler:</strong><br>';
                html += '- Session süresi dolmuş olabilir. <a href="/admin/login">Giriş yapın</a><br>';
                html += '- Veritabanı bağlantısı sorunu olabilir<br>';
                html += '- Network hatası olabilir</small></p>';
                html += '</div>';

                resultsDiv.innerHTML = html;
            }
        });
    }
});
