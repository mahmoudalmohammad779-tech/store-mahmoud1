// ========================================
// PRODUCTS MODULE - MANAGING PRODUCTS
// ========================================

// هاد الملف مسؤول عن إدارة المنتجات
// بنرندر المنتجات ونطبّق التصفية والبحث والترتيب
// هون بتتم جميع عمليات المنتجات

const Products = {
    // هاد الدالة بترجع كود HTML لكارت المنتج
    // بنعرض الصورة والسعر والتقييم وزر الإضافة
    createProductCard(product) {
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.title}" class="product-image">
                    ${product.stock < 5 ? 
                        `<div class="product-badge">Limited Stock</div>` : 
                        ''}
                </div>
                <div class="product-content">
                    <p class="product-category">${product.category}</p>
                    <h3 class="product-title">${product.title}</h3>
                    <div class="product-rating">
                        <span>${'⭐'.repeat(product.rating)}${
                            5 - product.rating ? 
                            '☆'.repeat(5 - product.rating) : 
                            ''
                        }</span>
                        <span>(${product.rating})</span>
                    </div>
                    <div class="product-footer">
                        <span class="product-price">$${product.price.toFixed(2)}</span>
                        <span class="product-stock">${product.stock} in stock</span>
                    </div>
                    <button class="add-to-cart-btn" data-product-id="${product.id}">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    },

    // هاد الدالة بتخلق صفحة المنتج التفصيلية
    // بنعرض الصورة والوصف والمواصفات والكمية
    createProductDetail(product) {
        return `
            <div class="product-detail-image-container">
                <img src="${product.image}" alt="${product.title}" class="product-detail-image">
            </div>
            <div class="product-detail-content">
                <h1>${product.title}</h1>
                <div class="product-detail-meta">
                    <span class="product-detail-price">$${product.price.toFixed(2)}</span>
                    <div class="product-detail-rating">
                        <span>${'⭐'.repeat(product.rating)}${
                            5 - product.rating ? 
                            '☆'.repeat(5 - product.rating) : 
                            ''
                        }</span>
                        <span>(${product.rating} out of 5)</span>
                    </div>
                </div>

                <div class="product-description">
                    ${product.description}
                </div>

                <div class="product-specs">
                    ${this.createSpecs(product)}
                </div>

                <div class="product-actions">
                    <div class="quantity-selector">
                        <button class="minus-btn">−</button>
                        <input type="number" value="1" min="1" max="${product.stock}">
                        <button class="plus-btn">+</button>
                    </div>
                    <button class="add-to-cart-btn add-to-cart-btn-detail" 
                            data-product-id="${product.id}">
                        Add to Cart
                    </button>
                </div>

                <p style="color: var(--text-light); margin-top: 20px;">
                    ✓ Free shipping on orders over $100<br>
                    ✓ 30-day money-back guarantee<br>
                    ✓ Premium customer support
                </p>
            </div>
        `;
    },

    // هاد الدالة بتخلق المواصفات حسب نوع المنتج
    createSpecs(product) {
        let specs = '';
        
        if (product.category === 'watches') {
            specs = `
                <div class="spec-item">
                    <span class="spec-label">Brand</span>
                    <span class="spec-value">${product.specs?.brand || 'Premium'}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Movement</span>
                    <span class="spec-value">${product.specs?.movement || 'Automatic'}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Case Material</span>
                    <span class="spec-value">${product.specs?.caseMaterial || 'Stainless Steel'}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Water Resistance</span>
                    <span class="spec-value">${product.specs?.waterResistance || '100m'}</span>
                </div>
            `;
        } else if (product.category === 'phones') {
            specs = `
                <div class="spec-item">
                    <span class="spec-label">Processor</span>
                    <span class="spec-value">${product.specs?.processor || 'Latest'}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">RAM</span>
                    <span class="spec-value">${product.specs?.ram || '8GB'}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Storage</span>
                    <span class="spec-value">${product.specs?.storage || '256GB'}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Camera</span>
                    <span class="spec-value">${product.specs?.camera || '48MP'}</span>
                </div>
            `;
        } else {
            specs = `
                <div class="spec-item">
                    <span class="spec-label">Type</span>
                    <span class="spec-value">${product.specs?.type || 'Premium'}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Compatibility</span>
                    <span class="spec-value">${product.specs?.compatibility || 'Universal'}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Warranty</span>
                    <span class="spec-value">${product.specs?.warranty || '2 Years'}</span>
                </div>
            `;
        }

        return specs;
    },

    // هاد الدالة بتطبّق البحث على المنتجات
    // بنبحث في العنوان والوصف والفئة
    handleSearch() {
        const searchValue = document.getElementById('searchInput').value.toLowerCase();
        const filteredProducts = window.app.products.filter(product =>
            product.title.toLowerCase().includes(searchValue) ||
            product.description.toLowerCase().includes(searchValue) ||
            product.category.toLowerCase().includes(searchValue)
        );

        this.displayProducts(filteredProducts);
    },

    // هاد الدالة بتطبّق الترتيب على المنتجات
    // بنرتب حسب السعر أو التقييم أو الأحدث
    handleSort() {
        const sortValue = document.getElementById('sortSelect').value;
        const filteredProducts = this.getFilteredProducts();
        
        let sorted = [...filteredProducts];

        switch (sortValue) {
            case 'price-low':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                sorted.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
            default:
                sorted.sort((a, b) => b.id - a.id);
        }

        this.displayProducts(sorted);
    },

    // هاد الدالة بتطبّق التصفية على المنتجات
    // بنختار حسب الفئة والسعر والتقييم
    handleFilterChange() {
        const filteredProducts = this.getFilteredProducts();
        this.displayProducts(filteredProducts);
    },

    // هاد الدالة بترجع المنتجات المفلترة
    // بناءً على الفلاتر المختارة
    getFilteredProducts() {
        let filtered = [...window.app.products];

        // التصفية حسب الفئة
        const categoryFilters = document.querySelectorAll('.category-filter:checked');
        const categories = Array.from(categoryFilters)
            .map(f => f.value)
            .filter(v => v !== 'all');

        if (categories.length > 0) {
            filtered = filtered.filter(p => categories.includes(p.category));
        }

        // التصفية حسب السعر
        const priceFilter = document.getElementById('priceFilter');
        if (priceFilter) {
            const maxPrice = parseInt(priceFilter.value);
            filtered = filtered.filter(p => p.price <= maxPrice);
        }

        // التصفية حسب التقييم
        const ratingFilters = document.querySelectorAll('.rating-filter:checked');
        if (ratingFilters.length > 0) {
            const minRating = Math.min(...Array.from(ratingFilters).map(f => parseInt(f.value)));
            filtered = filtered.filter(p => p.rating >= minRating);
        }

        return filtered;
    },

    // هاد الدالة بتعرض المنتجات على الشاشة
    // بنحدّث HTML الـ grid
    displayProducts(products) {
        const grid = document.getElementById('productsGrid');
        const emptyState = document.getElementById('emptyState');

        if (!grid) return;

        if (products.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        emptyState.style.display = 'none';
        
        grid.innerHTML = products
            .map(product => this.createProductCard(product))
            .join('');

        // اربط أزرار الإضافة للسلة
        window.app.attachAddToCartButtons();
    },

    // هاد الدالة بتعيد تعيين جميع الفلاتر
    // بنرجع للمنتجات الأصلية
    resetFilters() {
        // أعد تعيين الفئات
        document.querySelectorAll('.category-filter').forEach(f => {
            f.checked = f.value === 'all';
        });

        // أعد تعيين السعر
        const priceFilter = document.getElementById('priceFilter');
        if (priceFilter) {
            priceFilter.value = 5000;
            document.getElementById('priceValue').textContent = '$5000';
        }

        // أعد تعيين التقييم
        document.querySelectorAll('.rating-filter').forEach(f => {
            f.checked = false;
        });

        // أعد تعيين البحث
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';

        // أعد تعيين الترتيب
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) sortSelect.value = 'newest';

        // اعرض جميع المنتجات
        this.displayProducts(window.app.products);
    }
};
