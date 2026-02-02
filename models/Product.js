// ✅ Ürünleri adı ve duruma göre filtrele
function filterProducts() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const statusFilter = document.getElementById('statusFilter').value;

  const filtered = products.filter(product => {
    const nameMatch = product.name.toLowerCase().includes(searchTerm);
    const statusMatch = !statusFilter || product.status === statusFilter;
    return nameMatch && statusMatch;
  });

  console.log(`[FILTER] ${filtered.length} ürün bulundu`);

  // Filtrelenmiş ürünleri göster
  const tbody = document.getElementById('productsBody');
  tbody.innerHTML = filtered.map(product => `
        <tr>
            <td>${product.id}</td>
            <td><strong>${product.name}</strong></td>
            <td>${product.category || '-'}</td>
            <td>₺${product.price || '-'}</td>
            <td>
                <span class="badge bg-${product.status === 'active' ? 'success' : 'danger'}">
                    ${product.status === 'active' ? 'Aktif' : 'Pasif'}
                </span>
            </td>
            <td>${new Date(product.created_at).toLocaleDateString('tr-TR')}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

  document.getElementById('productCount').textContent = `${filtered.length} Ürün`;
} const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  meta_title: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  meta_description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'products',
  timestamps: true
});

module.exports = Product;
