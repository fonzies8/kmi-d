let cards = [];

async function loadCards() {
    try {
        const data = await fetchAPI('/admin/api/homepage-cards');
        if (data && data.success) {
            cards = data.cards || [];
            renderCards();
        } else {
            showAlert('Kartlar yüklenirken hata oluştu.', 'danger');
        }
    } catch (error) {
        showAlert('Kartlar yüklenirken hata oluştu: ' + error.message, 'danger');
    }
}

function renderCards() {
    const container = document.getElementById('cardsContainer');

    if (cards.length === 0) {
        container.innerHTML = '<div class="col-12 text-center">Henüz kart eklenmemiş.</div>';
        return;
    }

    container.innerHTML = cards.map(card => {
        const images = card.images || [];
        const imgCount = images.length;

        // Debug log
        if (images.length > 0) {
            console.log(`Card: ${card.title}, Images: ${images.length}, First URL: ${images[0].image_url}`);
        }

        let html = '<div class="col-md-6 col-lg-4 mb-4">';
        html += '<div class="card h-100">';

        if (images.length > 0) {
            html += '<img src="' + images[0].image_url + '" class="card-img-top" style="height: 200px; object-fit: cover;" onerror="console.log(\'Image load failed: ' + images[0].image_url + '\')">';
        }

        html += '<div class="card-body">';
        html += '<h6 class="card-title">' + card.title + '</h6>';
        html += '<p class="card-text text-muted small">' + (card.content || '') + '</p>';
        html += '<div class="d-flex justify-content-between align-items-center">';
        html += '<span class="badge bg-' + (card.status === 'active' ? 'success' : 'secondary') + '">';
        html += card.status === 'active' ? 'Aktif' : 'Pasif';
        html += '</span>';
        html += '<small class="text-muted">' + imgCount + ' resim</small>';
        html += '</div>';
        html += '</div>';
        html += '<div class="card-footer bg-white">';
        html += '<button class="btn btn-sm btn-primary edit-card-btn" data-card-id="' + card.id + '"><i class="fas fa-edit"></i> Düzenle</button>';
        html += '<button class="btn btn-sm btn-danger delete-card-btn" data-card-id="' + card.id + '"><i class="fas fa-trash"></i> Sil</button>';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        return html;
    }).join('');
}

function openCardModal(id = null) {
    document.getElementById('cardForm').reset();
    document.getElementById('cardId').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('existingImages').innerHTML = '';
    document.getElementById('modalTitle').textContent = 'Yeni Kart Ekle';

    if (id) {
        const card = cards.find(c => c.id === id);
        if (card) {
            document.getElementById('modalTitle').textContent = 'Kart Düzenle';
            document.getElementById('cardId').value = card.id;
            document.getElementById('title').value = card.title;
            document.getElementById('type').value = card.type;
            document.getElementById('content').value = card.content || '';
            document.getElementById('icon').value = card.icon || '';
            document.getElementById('background_color').value = card.background_color || '';
            document.getElementById('link_url').value = card.link_url || '';
            document.getElementById('link_text').value = card.link_text || '';
            document.getElementById('status').value = card.status;
            document.getElementById('highlight').checked = card.highlight === true || card.highlight === 1;

            if (card.images && card.images.length > 0) {
                let imagesHtml = '';
                card.images.forEach(img => {
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

function editCard(id) {
    openCardModal(id);
    new bootstrap.Modal(document.getElementById('cardModal')).show();
}

async function deleteCard(id) {
    if (!confirmDelete('Bu kartı silmek istediğinize emin misiniz?')) return;

    try {
        await fetchAPI('/admin/api/homepage-cards/' + id, { method: 'DELETE' });
        showAlert('Kart başarıyla silindi!', 'success');
        loadCards();
    } catch (error) {
        showAlert('Kart silinirken hata oluştu.', 'danger');
    }
}

async function deleteImage(imageId) {
    if (!confirmDelete('Bu resmi silmek istediğinize emin misiniz?')) return;

    try {
        await fetchAPI('/admin/api/homepage-card-images/' + imageId, { method: 'DELETE' });
        showAlert('Resim başarıyla silindi!', 'success');
        loadCards();
        document.getElementById('cardModal').querySelector('.btn-close').click();
    } catch (error) {
        showAlert('Resim silinirken hata oluştu.', 'danger');
    }
}

// Initialize
function initializeEventListeners() {
    const cardForm = document.getElementById('cardForm');
    if (cardForm) {
        cardForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const formData = new FormData(this);
            const cardId = document.getElementById('cardId').value;
            const url = cardId ? '/admin/api/homepage-cards/' + cardId : '/admin/api/homepage-cards';
            const method = cardId ? 'PUT' : 'POST';

            try {
                const response = await fetch(url, {
                    method: method,
                    credentials: 'include',
                    body: formData
                });

                if (!response.ok) {
                    try {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Bir hata oluştu');
                    } catch (parseError) {
                        throw new Error('HTTP ' + response.status + ': ' + response.statusText);
                    }
                }

                const data = await response.json();

                if (data.success) {
                    showAlert(data.message || 'İşlem başarılı!', 'success');
                    document.getElementById('cardModal').querySelector('.btn-close').click();
                    loadCards();
                } else {
                    showAlert(data.message || 'Bir hata oluştu!', 'danger');
                }
            } catch (error) {
                showAlert(error.message || 'Bir hata oluştu!', 'danger');
            }
        });
    }

    const addCardBtn = document.getElementById('addCardBtn');
    if (addCardBtn) {
        addCardBtn.addEventListener('click', function () {
            openCardModal();
        });
    }

    document.addEventListener('click', function (e) {
        if (e.target.closest('.edit-card-btn')) {
            const cardId = parseInt(e.target.closest('.edit-card-btn').getAttribute('data-card-id'));
            editCard(cardId);
        }
        if (e.target.closest('.delete-card-btn')) {
            const cardId = parseInt(e.target.closest('.delete-card-btn').getAttribute('data-card-id'));
            deleteCard(cardId);
        }
        if (e.target.closest('.delete-image-btn')) {
            const imageId = parseInt(e.target.closest('.delete-image-btn').getAttribute('data-image-id'));
            deleteImage(imageId);
        }
    });

    const cardModal = document.getElementById('cardModal');
    if (cardModal) {
        cardModal.addEventListener('show.bs.modal', function () {
            if (!document.getElementById('cardId').value) {
                openCardModal();
            }
        });
    }

    loadCards();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEventListeners);
} else {
    initializeEventListeners();
}
