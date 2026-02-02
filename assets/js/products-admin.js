let products = [];

async function loadProducts() {
    const tbody = document.getElementById('productsBody');
    if (!tbody) {
        console.error('[LOAD PRODUCTS] productsBody not found!');
        return;
    }

    try {
        console.log('[LOAD PRODUCTS] ========== BAŞLADI ==========');
        console.log('[LOAD PRODUCTS] Sayfası yükleniyor...');
        console.log('[LOAD PRODUCTS] URL: /admin/api/products');

        // Show loading state
        tbody.innerHTML = `<tr><td colspan="7" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Yükleniyor...</span></div><p class="mt-2">Ürünler yükleniyor...</p></td></tr>`;

        console.log('[LOAD PRODUCTS] Fetch çağrısı yapılıyor...');

        const response = await fetch('/admin/api/products', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });

        console.log('[LOAD PRODUCTS] Response geldi!');
        console.log('[LOAD PRODUCTS] Response status:', response.status);
        console.log('[LOAD PRODUCTS] Response ok:', response.ok);

        // Check if redirected to login
        if (response.status === 401 || response.redirected || response.url.includes('/login')) {
            console.error('[LOAD PRODUCTS] ❌ 401 Unauthorized - redirecting to login');
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

            console.error('[LOAD PRODUCTS] ❌ Response not ok:', errorText);
            throw new Error(errorText);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('[LOAD PRODUCTS] ❌ Non-JSON response:', text.substring(0, 200));
            throw new Error('Beklenmeyen yanıt formatı: ' + text.substring(0, 100));
        }

        const data = await response.json();
        console.log('[LOAD PRODUCTS] ✅ Data alındı');
        console.log('[LOAD PRODUCTS] Data structure:', data);

        if (data && data.success) {
            products = data.products || [];
            console.log('[LOAD PRODUCTS] ✅ Toplam ürün sayısı:', products.length);
            console.log('[LOAD PRODUCTS] Product IDs:', products.map(p => p.id).join(', '));
            renderProducts();
            console.log('[LOAD PRODUCTS] ========== TAMAMLANDI ==========');
        } else {
            console.error('[LOAD PRODUCTS] ❌ Response success false:', data);
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Ürünler yüklenirken hata oluştu: ' + (data?.message || 'Bilinmeyen hata') + '</td></tr>';
            showAlert('Ürünler yüklenirken hata oluştu: ' + (data?.message || 'Bilinmeyen hata'), 'danger');
        }
    } catch (error) {
        console.error('[LOAD PRODUCTS] ❌ CATCH ERROR:', error);
        console.error('[LOAD PRODUCTS] Error message:', error.message);
        console.error('[LOAD PRODUCTS] Error stack:', error.stack);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger"><strong>Hata:</strong> ' + error.message + '<br><small>Console\'u kontrol edin (F12) daha fazla detay için.</small></td></tr>';
        showAlert('Ürünler yüklenirken hata oluştu: ' + error.message, 'danger');
    }
}

function renderProducts(filteredProducts = null) {
    const tbody = document.getElementById('productsBody');
    const productsToRender = filteredProducts || products;

    // Update count
    const countElement = document.getElementById('productCount');
    if (countElement) {
        countElement.textContent = productsToRender.length + ' Ürün';
    }

    if (productsToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4"><i class="fas fa-box-open fa-2x mb-2"></i><br>Henüz ürün eklenmemiş.</td></tr>';
        return;
    }

    tbody.innerHTML = productsToRender.map(product => {
        const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
        const imageCount = product.images?.length || 0;
        const description = product.description ? (product.description.length > 50 ?
            product.description.substring(0, 50) + '...' : product.description) : '';

        let html = '<tr class="product-row" data-product-id="' + product.id + '">';
        html += '<td><strong>#' + product.id + '</strong></td>';
        html += '<td>';

        if (primaryImage) {
            html += '<img src="' + primaryImage.image_url + '" class="img-thumbnail view-product-image-btn" style="max-width: 60px; max-height: 60px; object-fit: cover; cursor: pointer;" data-product-id="' + product.id + '" title="' + imageCount + ' resim - Tıklayarak görüntüle">';
        } else {
            html += '<span class="text-muted"><i class="fas fa-image"></i> Yok</span>';
        }

        if (imageCount > 1) {
            html += '<br><small class="text-muted">+' + (imageCount - 1) + ' resim</small>';
        }

        html += '</td>';
        html += '<td>';
        html += '<strong>' + product.name + '</strong>';
        if (description) {
            html += '<br><small class="text-muted">' + description + '</small>';
        }
        html += '</td>';
        html += '<td>';
        if (product.category) {
            html += '<span class="badge bg-secondary">' + product.category + '</span>';
        } else {
            html += '<span class="text-muted">-</span>';
        }
        html += '</td>';
        html += '<td>';
        html += '<span class="badge bg-' + (product.status === 'active' ? 'success' : 'secondary') + '">';
        html += product.status === 'active' ? '<i class="fas fa-check-circle"></i> Aktif' : '<i class="fas fa-times-circle"></i> Pasif';
        html += '</span>';
        html += '</td>';
        html += '<td>';
        html += '<span class="badge bg-info">' + (product.display_order || 0) + '</span>';
        html += '</td>';
        html += '<td>';
        html += '<small>' + new Date(product.created_at).toLocaleDateString('tr-TR') + '</small><br>';
        html += '<small class="text-muted">' + new Date(product.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + '</small>';
        html += '</td>';
        html += '<td>';
        html += '<div class="btn-group btn-group-sm" role="group">';
        html += '<button class="btn btn-primary edit-product-btn" data-product-id="' + product.id + '" title="Düzenle"><i class="fas fa-edit"></i></button>';
        html += '<button class="btn btn-info view-product-btn" data-product-id="' + product.id + '" title="Detaylar"><i class="fas fa-eye"></i></button>';
        html += '<button class="btn btn-danger delete-product-btn" data-product-id="' + product.id + '" title="Sil"><i class="fas fa-trash"></i></button>';
        html += '</div>';
        html += '</td>';
        html += '</tr>';

        return html;
    }).join('');
}

// Filter and search functions
function filterProducts() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';

    let filtered = products.filter(product => {
        const matchesSearch = !searchTerm ||
            product.name.toLowerCase().includes(searchTerm) ||
            (product.category && product.category.toLowerCase().includes(searchTerm)) ||
            (product.description && product.description.toLowerCase().includes(searchTerm));

        const matchesStatus = !statusFilter || product.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    renderProducts(filtered);
}

function viewProductImages(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || !product.images || product.images.length === 0) {
        showAlert('Bu ürünün resmi bulunmuyor.', 'warning');
        return;
    }

    // Create modal for image gallery
    let modalHtml = '<div class="modal fade" id="imageGalleryModal" tabindex="-1">';
    modalHtml += '<div class="modal-dialog modal-lg">';
    modalHtml += '<div class="modal-content">';
    modalHtml += '<div class="modal-header">';
    modalHtml += '<h5 class="modal-title">' + product.name + ' - Resimler (' + product.images.length + ')</h5>';
    modalHtml += '<button type="button" class="btn-close" data-bs-dismiss="modal"></button>';
    modalHtml += '</div>';
    modalHtml += '<div class="modal-body">';
    modalHtml += '<div class="row">';

    product.images.forEach((img, index) => {
        modalHtml += '<div class="col-md-4 mb-3">';
        modalHtml += '<div class="card">';
        modalHtml += '<img src="' + img.image_url + '" class="card-img-top" style="height: 200px; object-fit: cover;">';
        modalHtml += '<div class="card-body p-2">';
        modalHtml += '<small class="text-muted">Resim ' + (index + 1) + '</small>';
        if (img.is_primary) {
            modalHtml += '<span class="badge bg-primary ms-2">Ana Resim</span>';
        }
        modalHtml += '</div>';
        modalHtml += '</div>';
        modalHtml += '</div>';
    });

    modalHtml += '</div>';
    modalHtml += '</div>';
    modalHtml += '</div>';
    modalHtml += '</div>';
    modalHtml += '</div>';

    // Remove existing modal if any
    const existingModal = document.getElementById('imageGalleryModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('imageGalleryModal'));
    modal.show();

    // Remove modal when hidden
    document.getElementById('imageGalleryModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

function viewProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showAlert('Ürün bulunamadı.', 'danger');
        return;
    }

    let detailsHtml = '<div class="modal fade" id="productDetailsModal" tabindex="-1">';
    detailsHtml += '<div class="modal-dialog modal-lg">';
    detailsHtml += '<div class="modal-content">';
    detailsHtml += '<div class="modal-header">';
    detailsHtml += '<h5 class="modal-title">Ürün Detayları - #' + product.id + '</h5>';
    detailsHtml += '<button type="button" class="btn-close" data-bs-dismiss="modal"></button>';
    detailsHtml += '</div>';
    detailsHtml += '<div class="modal-body">';
    detailsHtml += '<div class="row">';
    detailsHtml += '<div class="col-md-6">';
    detailsHtml += '<h6>Ürün Bilgileri</h6>';
    detailsHtml += '<table class="table table-sm">';
    detailsHtml += '<tr><th>ID:</th><td>#' + product.id + '</td></tr>';
    detailsHtml += '<tr><th>Ad:</th><td>' + product.name + '</td></tr>';
    detailsHtml += '<tr><th>Kategori:</th><td>' + (product.category || '-') + '</td></tr>';
    detailsHtml += '<tr><th>Durum:</th><td><span class="badge bg-' + (product.status === 'active' ? 'success' : 'secondary') + '">' + (product.status === 'active' ? 'Aktif' : 'Pasif') + '</span></td></tr>';
    detailsHtml += '<tr><th>Oluşturulma:</th><td>' + new Date(product.created_at).toLocaleString('tr-TR') + '</td></tr>';
    detailsHtml += '<tr><th>Güncellenme:</th><td>' + new Date(product.updated_at).toLocaleString('tr-TR') + '</td></tr>';
    detailsHtml += '</table>';
    detailsHtml += '</div>';
    detailsHtml += '<div class="col-md-6">';
    detailsHtml += '<h6>Açıklama</h6>';
    detailsHtml += '<p>' + (product.description || '<span class="text-muted">Açıklama yok</span>') + '</p>';
    detailsHtml += '<h6>Resimler (' + (product.images?.length || 0) + ')</h6>';
    detailsHtml += '<div class="d-flex flex-wrap gap-2">';

    if (product.images && product.images.length > 0) {
        product.images.forEach(img => {
            detailsHtml += '<img src="' + img.image_url + '" class="img-thumbnail" style="max-width: 100px; max-height: 100px; object-fit: cover;">';
        });
    } else {
        detailsHtml += '<span class="text-muted">Resim yok</span>';
    }

    detailsHtml += '</div>';
    detailsHtml += '</div>';
    detailsHtml += '</div>';
    detailsHtml += '</div>';
    detailsHtml += '<div class="modal-footer">';
    detailsHtml += '<button type="button" class="btn btn-primary edit-from-details-btn" data-product-id="' + product.id + '"><i class="fas fa-edit"></i> Düzenle</button>';
    detailsHtml += '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Kapat</button>';
    detailsHtml += '</div>';
    detailsHtml += '</div>';
    detailsHtml += '</div>';
    detailsHtml += '</div>';

    // Remove existing modal if any
    const existingModal = document.getElementById('productDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', detailsHtml);
    const modal = new bootstrap.Modal(document.getElementById('productDetailsModal'));
    modal.show();

    // Remove modal when hidden
    document.getElementById('productDetailsModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

function openProductModal(id = null) {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('existingImages').innerHTML = '';
    document.getElementById('modalTitle').textContent = 'Yeni Ürün Ekle';

    if (id) {
        const product = products.find(p => p.id === id);
        if (product) {
            document.getElementById('modalTitle').textContent = 'Ürün Düzenle';
            document.getElementById('productId').value = product.id;
            document.getElementById('name').value = product.name;
            document.getElementById('description').value = product.description || '';
            document.getElementById('category').value = product.category || '';
            document.getElementById('display_order').value = product.display_order || 0;
            document.getElementById('status').value = product.status;

            if (product.images && product.images.length > 0) {
                let imagesHtml = '';
                product.images.forEach(img => {
                    imagesHtml += '<div class="d-inline-block position-relative m-2">';
                    imagesHtml += '<img src="' + img.image_url + '" class="image-preview">';
                    imagesHtml += '<button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 delete-image-btn" data-image-id="' + img.id + '"><i class="fas fa-times"></i></button>';
                    imagesHtml += '</div>';
                });
                document.getElementById('existingImages').innerHTML = '<label>Mevcut Resimler:</label><br>' + imagesHtml;
            }
        }
    }
}

function editProduct(id) {
    openProductModal(id);
    new bootstrap.Modal(document.getElementById('productModal')).show();
}

async function deleteProduct(id) {
    if (!confirmDelete('Bu ürünü silmek istediğinize emin misiniz?')) return;

    try {
        await fetchAPI('/admin/api/products/' + id, { method: 'DELETE' });
        showAlert('Ürün başarıyla silindi!', 'success');
        loadProducts();
    } catch (error) {
        console.error('Delete error:', error);
    }
}

async function deleteImage(imageId) {
    if (!confirmDelete('Bu resmi silmek istediğinize emin misiniz?')) return;

    try {
        await fetchAPI('/admin/api/product-images/' + imageId, { method: 'DELETE' });
        showAlert('Resim başarıyla silindi!', 'success');
        loadProducts();
        document.getElementById('productModal').querySelector('.btn-close').click();
    } catch (error) {
        console.error('Delete image error:', error);
    }
}

// Initialize all event listeners when DOM is ready
function initializeEventListeners() {
    console.log('[PRODUCTS PAGE] Initializing event listeners...');

    // Form submit event listener
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            e.stopPropagation();

            const formData = new FormData(this);
            const productId = document.getElementById('productId').value;
            const url = productId ? '/admin/api/products/' + productId : '/admin/api/products';
            const method = productId ? 'PUT' : 'POST';

            try {
                console.log('[PRODUCT FORM] Submitting:', { url, method, productId });

                const response = await fetch(url, {
                    method: method,
                    credentials: 'include',
                    body: formData
                });

                console.log('[PRODUCT FORM] Response status:', response.status);

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
                console.log('[PRODUCT FORM] Response data:', data);

                if (data.success) {
                    showAlert(data.message || 'İşlem başarılı!', 'success');
                    const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
                    if (modal) modal.hide();
                    loadProducts();
                } else {
                    showAlert(data.message || 'Bir hata oluştu!', 'danger');
                }
            } catch (error) {
                console.error('[PRODUCT FORM] Save error:', error);
                showAlert(error.message || 'Bir hata oluştu!', 'danger');
            }
        });
    } else {
        console.error('[PRODUCTS PAGE] productForm not found!');
    }

    // Event listener for add product button
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function () {
            openProductModal();
        });
    }

    // Event listeners for edit and delete buttons (delegated)
    document.addEventListener('click', function (e) {
        if (e.target.closest('.edit-product-btn')) {
            const productId = parseInt(e.target.closest('.edit-product-btn').getAttribute('data-product-id'));
            editProduct(productId);
        }
        if (e.target.closest('.view-product-btn')) {
            const productId = parseInt(e.target.closest('.view-product-btn').getAttribute('data-product-id'));
            viewProductDetails(productId);
        }
        if (e.target.closest('.delete-product-btn')) {
            const productId = parseInt(e.target.closest('.delete-product-btn').getAttribute('data-product-id'));
            deleteProduct(productId);
        }
        if (e.target.closest('.delete-image-btn')) {
            const imageId = parseInt(e.target.closest('.delete-image-btn').getAttribute('data-image-id'));
            deleteImage(imageId);
        }
        if (e.target.closest('.view-product-image-btn')) {
            const productId = parseInt(e.target.closest('.view-product-image-btn').getAttribute('data-product-id'));
            viewProductImages(productId);
        }
        if (e.target.closest('.edit-from-details-btn')) {
            const productId = parseInt(e.target.closest('.edit-from-details-btn').getAttribute('data-product-id'));
            const modal = bootstrap.Modal.getInstance(document.getElementById('productDetailsModal'));
            if (modal) modal.hide();
            editProduct(productId);
        }
    });

    // Search and filter event listeners
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }

    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterProducts);
    }

    // Event listener for modal show event (when modal is opened)
    const productModal = document.getElementById('productModal');
    if (productModal) {
        productModal.addEventListener('show.bs.modal', function () {
            if (!document.getElementById('productId').value) {
                openProductModal();
            }
        });
    }

    // Load products
    console.log('[PRODUCTS PAGE] Loading products...');
    loadProducts();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEventListeners);
} else {
    initializeEventListeners();
}
