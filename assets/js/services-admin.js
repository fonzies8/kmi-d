let services = [];

async function loadServices() {
    const tbody = document.getElementById('servicesBody');
    if (!tbody) {
        console.error('[LOAD SERVICES] servicesBody not found!');
        return;
    }

    try {
        console.log('[LOAD SERVICES] ========== BAŞLADI ==========');
        console.log('[LOAD SERVICES] Sayfası yükleniyor...');
        tbody.innerHTML = '<tr><td colspan="6" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Yükleniyor...</span></div><p class="mt-2">Hizmetler yükleniyor...</p></td></tr>';

        const response = await fetch('/admin/api/services', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });

        console.log('[LOAD SERVICES] Response status:', response.status);

        // Check if redirected to login
        if (response.status === 401 || response.redirected || response.url.includes('/login')) {
            console.error('[LOAD SERVICES] ❌ 401 Unauthorized - redirecting to login');
            window.location.href = '/admin/login';
            return;
        }

        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            let errorText = 'HTTP ' + response.status + ': ' + response.statusText;

            if (contentType && contentType.includes('application/json')) {
                try {
                    const errorData = await response.json();
                    errorText = errorData.message || errorText;
                } catch (e) {
                    // JSON parse failed
                }
            } else {
                errorText = await response.text();
            }

            console.error('[LOAD SERVICES] ❌ Response not ok:', errorText);
            throw new Error(errorText);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('[LOAD SERVICES] ❌ Non-JSON response:', text.substring(0, 200));
            throw new Error('Beklenmeyen yanıt formatı: ' + text.substring(0, 100));
        }

        const data = await response.json();
        console.log('[LOAD SERVICES] ✅ Data alındı');

        if (data && data.success) {
            services = data.services || [];
            console.log('[LOAD SERVICES] ✅ Toplam hizmet sayısı:', services.length);
            renderServices();
            console.log('[LOAD SERVICES] ========== TAMAMLANDI ==========');
        } else {
            console.error('[LOAD SERVICES] ❌ Response success false:', data);
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Hizmetler yüklenirken hata oluştu: ' + (data?.message || 'Bilinmeyen hata') + '</td></tr>';
            showAlert('Hizmetler yüklenirken hata oluştu: ' + (data?.message || 'Bilinmeyen hata'), 'danger');
        }
    } catch (error) {
        console.error('[LOAD SERVICES] ❌ CATCH ERROR:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger"><strong>Hata:</strong> ' + error.message + '<br><small>Console\'u kontrol edin (F12) daha fazla detay için.</small></td></tr>';
        showAlert('Hizmetler yüklenirken hata oluştu: ' + error.message, 'danger');
    }
}

function renderServices() {
    const tbody = document.getElementById('servicesBody');

    if (services.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Henüz hizmet eklenmemiş.</td></tr>';
        return;
    }

    tbody.innerHTML = services.map(service => {
        const primaryImage = service.images?.find(img => img.is_primary) || service.images?.[0];
        let imgUrl = '';
        if (primaryImage) {
            imgUrl = primaryImage.image_url || primaryImage.imageUrl || primaryImage.url || '';
            if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('/')) imgUrl = '/' + imgUrl;
        }

        let html = '<tr>';
        html += '<td>' + service.id + '</td>';
        html += '<td>';
        if (imgUrl) {
            html += '<img src="' + imgUrl + '" class="image-preview" style="max-width: 50px;">';
        } else {
            html += '<span class="text-muted">Resim yok</span>';
        }
        html += '</td>';
        html += '<td>' + service.name + '</td>';
        // Sıra (display_order)
        html += '<td>';
        html += '<span class="badge bg-info">' + (service.display_order || 0) + '</span>';
        html += '</td>';
        // Durum (status)
        html += '<td>';
        html += '<span class="badge bg-' + (service.status === 'active' ? 'success' : 'secondary') + '">';
        html += service.status === 'active' ? 'Aktif' : 'Pasif';
        html += '</span>';
        html += '</td>';
        html += '<td>' + new Date(service.created_at || service.createdAt).toLocaleDateString('tr-TR') + '</td>';
        html += '<td>';
        html += '<button class="btn btn-sm btn-primary edit-service-btn" data-service-id="' + service.id + '"><i class="fas fa-edit"></i></button>';
        html += '<button class="btn btn-sm btn-danger delete-service-btn" data-service-id="' + service.id + '"><i class="fas fa-trash"></i></button>';
        html += '</td>';
        html += '</tr>';

        return html;
    }).join('');
}

function openServiceModal(id = null) {
    document.getElementById('serviceForm').reset();
    document.getElementById('serviceId').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('existingImages').innerHTML = '';
    document.getElementById('modalTitle').textContent = 'Yeni Hizmet Ekle';

    if (id) {
        const service = services.find(s => s.id === id);
        if (service) {
            document.getElementById('modalTitle').textContent = 'Hizmet Düzenle';
            document.getElementById('serviceId').value = service.id;
            document.getElementById('name').value = service.name;
            document.getElementById('short_description').value = service.short_description || '';
            document.getElementById('description').value = service.description || '';
            document.getElementById('display_order').value = service.display_order || 0;
            document.getElementById('status').value = service.status;

            if (service.images && service.images.length > 0) {
                let imagesHtml = '';
                service.images.forEach(img => {
                    let url = img.image_url || img.imageUrl || img.url || '';
                    if (url && !url.startsWith('http') && !url.startsWith('/')) url = '/' + url;
                    imagesHtml += '<div class="d-inline-block position-relative m-2">';
                    imagesHtml += '<img src="' + url + '" class="image-preview">';
                    imagesHtml += '<button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 delete-image-btn" data-image-id="' + img.id + '"><i class="fas fa-times"></i></button>';
                    imagesHtml += '</div>';
                });
                document.getElementById('existingImages').innerHTML = '<label>Mevcut Resimler:</label><br>' + imagesHtml;
            }
        }
    }
}

function editService(id) {
    openServiceModal(id);
    new bootstrap.Modal(document.getElementById('serviceModal')).show();
}

async function deleteService(id) {
    if (!confirmDelete('Bu hizmeti silmek istediğinize emin misiniz?')) return;

    try {
        await fetchAPI('/admin/api/services/' + id, { method: 'DELETE' });
        showAlert('Hizmet başarıyla silindi!', 'success');
        loadServices();
    } catch (error) {
        console.error('Delete error:', error);
    }
}

async function deleteImage(imageId) {
    if (!confirmDelete('Bu resmi silmek istediğinize emin misiniz?')) return;

    try {
        await fetchAPI('/admin/api/service-images/' + imageId, { method: 'DELETE' });
        showAlert('Resim başarıyla silindi!', 'success');
        loadServices();
        document.getElementById('serviceModal').querySelector('.btn-close').click();
    } catch (error) {
        console.error('Delete image error:', error);
    }
}

// Initialize all event listeners when DOM is ready
function initializeEventListeners() {
    console.log('[SERVICES PAGE] Initializing event listeners...');

    // Form submit event listener
    const serviceForm = document.getElementById('serviceForm');
    if (serviceForm) {
        serviceForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            e.stopPropagation();

            const formData = new FormData(this);
            const serviceId = document.getElementById('serviceId').value;
            const url = serviceId ? '/admin/api/services/' + serviceId : '/admin/api/services';
            const method = serviceId ? 'PUT' : 'POST';

            try {
                console.log('[SERVICE FORM] Submitting:', { url, method, serviceId });

                const response = await fetch(url, {
                    method: method,
                    credentials: 'include',
                    body: formData
                });

                console.log('[SERVICE FORM] Response status:', response.status);

                if (!response.ok) {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Bir hata oluştu');
                    } else {
                        const errorText = await response.text();
                        throw new Error('HTTP ' + response.status + ': ' + errorText);
                    }
                }

                const data = await response.json();
                console.log('[SERVICE FORM] Response data:', data);

                if (data.success) {
                    showAlert(data.message || 'İşlem başarılı!', 'success');
                    const modal = bootstrap.Modal.getInstance(document.getElementById('serviceModal'));
                    if (modal) modal.hide();
                    loadServices();
                } else {
                    showAlert(data.message || 'Bir hata oluştu!', 'danger');
                }
            } catch (error) {
                console.error('[SERVICE FORM] Save error:', error);
                showAlert(error.message || 'Bir hata oluştu!', 'danger');
            }
        });
    } else {
        console.error('[SERVICES PAGE] serviceForm not found!');
    }

    // Event listener for add service button
    const addServiceBtn = document.getElementById('addServiceBtn');
    if (addServiceBtn) {
        addServiceBtn.addEventListener('click', function () {
            openServiceModal();
        });
    }

    // Event listeners for edit and delete buttons (delegated)
    document.addEventListener('click', function (e) {
        if (e.target.closest('.edit-service-btn')) {
            const serviceId = parseInt(e.target.closest('.edit-service-btn').getAttribute('data-service-id'));
            editService(serviceId);
        }
        if (e.target.closest('.delete-service-btn')) {
            const serviceId = parseInt(e.target.closest('.delete-service-btn').getAttribute('data-service-id'));
            deleteService(serviceId);
        }
        if (e.target.closest('.delete-image-btn')) {
            const imageId = parseInt(e.target.closest('.delete-image-btn').getAttribute('data-image-id'));
            deleteImage(imageId);
        }
    });

    // Event listener for modal show event (when modal is opened)
    const serviceModal = document.getElementById('serviceModal');
    if (serviceModal) {
        serviceModal.addEventListener('show.bs.modal', function () {
            if (!document.getElementById('serviceId').value) {
                openServiceModal();
            }
        });
    }

    // Load services
    console.log('[SERVICES PAGE] Loading services...');
    loadServices();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEventListeners);
} else {
    initializeEventListeners();
}
