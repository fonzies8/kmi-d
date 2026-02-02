/**
 * Route Test Script
 * Tüm route'ları test eder
 */

const routes = [
    // Public Routes
    { method: 'GET', path: '/', description: 'Ana Sayfa' },
    { method: 'GET', path: '/products', description: 'Ürünler Sayfası' },
    { method: 'GET', path: '/services', description: 'Hizmetler Sayfası' },
    { method: 'GET', path: '/about', description: 'Hakkımızda' },
    { method: 'GET', path: '/contact', description: 'İletişim' },
    
    // Admin Routes
    { method: 'GET', path: '/admin/login', description: 'Admin Giriş' },
    { method: 'GET', path: '/admin/dashboard', description: 'Admin Dashboard' },
    { method: 'GET', path: '/admin/products', description: 'Admin Ürünler' },
    { method: 'GET', path: '/admin/services', description: 'Admin Hizmetler' },
    { method: 'GET', path: '/admin/homepage', description: 'Admin Ana Sayfa' },
    { method: 'GET', path: '/admin/settings', description: 'Admin Ayarlar' },
    { method: 'GET', path: '/admin/test', description: 'Admin Test' },
    
    // API Routes
    { method: 'GET', path: '/admin/api/products', description: 'API Ürünler' },
    { method: 'GET', path: '/admin/api/services', description: 'API Hizmetler' },
    { method: 'GET', path: '/admin/api/test/database', description: 'API Test DB' },
];

console.log('═══════════════════════════════════════════════════════');
console.log('📋 TANIMLI ROUTE\'LAR');
console.log('═══════════════════════════════════════════════════════\n');

routes.forEach((route, index) => {
    console.log(`${index + 1}. ${route.method} ${route.path.padEnd(30)} - ${route.description}`);
});

console.log('\n═══════════════════════════════════════════════════════');
console.log('💡 Test için:');
console.log('   http://localhost:3008/admin/login');
console.log('   http://localhost:3008/admin/test');
console.log('═══════════════════════════════════════════════════════\n');
