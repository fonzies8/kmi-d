(function () {
    "use strict";

    let settings = {};

    // Load settings on page load
    async function loadSettings() {
        try {
            const data = await fetchAPI('/admin/api/settings');
            settings = data.settings;
            populateForm();
        } catch (error) {
            console.error('Load settings error:', error);
        }
    }

    // Populate form with settings
    function populateForm() {
        // General
        document.getElementById('site_title').value = settings.site_title || '';
        document.getElementById('site_description').value = settings.site_description || '';

        // Contact
        document.getElementById('contact_phone').value = settings.contact_phone || '';
        document.getElementById('contact_email').value = settings.contact_email || '';
        document.getElementById('contact_address').value = settings.contact_address || '';
        document.getElementById('cargo_address').value = settings.cargo_address || '';

        // Working hours
        if (settings.working_hours) {
            document.getElementById('working_hours_weekdays').value = settings.working_hours.weekdays || '';
            document.getElementById('working_hours_saturday').value = settings.working_hours.saturday || '';
            document.getElementById('working_hours_sunday').value = settings.working_hours.sunday || '';
        }

        // About
        document.getElementById('about_mission').value = settings.about_mission || '';
        document.getElementById('about_vision').value = settings.about_vision || '';
        document.getElementById('about_content_1').value = settings.about_content_1 || '';
        document.getElementById('about_content_2').value = settings.about_content_2 || '';

        // About images
        if (settings.about_image_1) {
            const img1 = '<img src="' + settings.about_image_1 + '" class="img-thumbnail" style="max-width: 200px;">';
            document.getElementById('about_image_1_preview').innerHTML = img1;
        }
        if (settings.about_image_2) {
            const img2 = '<img src="' + settings.about_image_2 + '" class="img-thumbnail" style="max-width: 200px;">';
            document.getElementById('about_image_2_preview').innerHTML = img2;
        }

        // Social media
        if (settings.social_media) {
            document.getElementById('social_facebook').value = settings.social_media.facebook || '';
            document.getElementById('social_twitter').value = settings.social_media.twitter || '';
            document.getElementById('social_instagram').value = settings.social_media.instagram || '';
            document.getElementById('social_linkedin').value = settings.social_media.linkedin || '';
        }
    }

    // General form submit
    const generalForm = document.getElementById('generalForm');
    if (generalForm) {
        generalForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = {
                site_title: document.getElementById('site_title').value,
                site_description: document.getElementById('site_description').value
            };
            await saveSettings(formData);
        });
    }

    // Contact form submit
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = {
                contact_phone: document.getElementById('contact_phone').value,
                contact_email: document.getElementById('contact_email').value,
                contact_address: document.getElementById('contact_address').value,
                cargo_address: document.getElementById('cargo_address').value,
                working_hours: {
                    weekdays: document.getElementById('working_hours_weekdays').value,
                    saturday: document.getElementById('working_hours_saturday').value,
                    sunday: document.getElementById('working_hours_sunday').value
                }
            };
            await saveSettings(formData);
        });
    }

    // About form submit
    const aboutForm = document.getElementById('aboutForm');
    if (aboutForm) {
        aboutForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = {
                about_mission: document.getElementById('about_mission').value,
                about_vision: document.getElementById('about_vision').value,
                about_content_1: document.getElementById('about_content_1').value,
                about_content_2: document.getElementById('about_content_2').value
            };
            await saveSettings(formData);
        });
    }

    // Social form submit
    const socialForm = document.getElementById('socialForm');
    if (socialForm) {
        socialForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = {
                social_media: {
                    facebook: document.getElementById('social_facebook').value,
                    twitter: document.getElementById('social_twitter').value,
                    instagram: document.getElementById('social_instagram').value,
                    linkedin: document.getElementById('social_linkedin').value
                }
            };
            await saveSettings(formData);
        });
    }

    // Save settings
    async function saveSettings(data) {
        try {
            const result = await fetchAPI('/admin/api/settings', {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            showAlert('Ayarlar başarıyla kaydedildi!', 'success');
            loadSettings();
        } catch (error) {
            console.error('Save settings error:', error);
        }
    }

    // Upload about image
    async function uploadAboutImage(key, input) {
        if (!input.files || !input.files[0]) return;

        const formData = new FormData();
        formData.append('image', input.files[0]);
        formData.append('key', key);

        try {
            const response = await fetch('/admin/api/settings/image', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                showAlert('Resim başarıyla yüklendi!', 'success');
                const img = '<img src="' + data.imageUrl + '" class="img-thumbnail" style="max-width: 200px;">';
                document.getElementById(key + '_preview').innerHTML = img;
                loadSettings();
            } else {
                showAlert(data.message, 'danger');
            }
        } catch (error) {
            console.error('Upload image error:', error);
            showAlert('Resim yüklenirken hata oluştu!', 'danger');
        }
    }

    // Load settings on page load
    loadSettings();

    // Make uploadAboutImage globally accessible
    window.uploadAboutImage = uploadAboutImage;
})();
