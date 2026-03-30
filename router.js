// ========================================
// ROUTER MODULE - SPA NAVIGATION
// ========================================

// هاد الملف مسؤول عن التنقل بين الصفحات
// بدون إعادة تحميل للصفحة
// هون بتتم جميع عمليات الـ routing

const Router = {
    // هاد الدالة بترجع معرّف المنتج من عنوان URL
    // مثلاً: product.html?id=1 ترجع 1
    getProductIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('id')) || null;
    },

    // هاد الدالة بترجع الفئة من عنوان URL
    // مثلاً: products.html?category=watches ترجع watches
    getCategoryFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('category') || null;
    },

    // هاد الدالة بتنقل للصفحة المطلوبة
    // بنحدّث عنوان URL بدون إعادة تحميل
    navigate(path, state = {}) {
        window.history.pushState(state, '', path);
        this.loadPage(path);
    },

    // هاد الدالة بتحمّل محتوى الصفحة
    async loadPage(path) {
        try {
            // حدّد الصفحة المطلوبة
            let page = 'index.html';
            if (path.includes('products')) page = 'products.html';
            if (path.includes('product')) page = 'product.html';
            if (path.includes('cart')) page = 'cart.html';

            // حمّل محتوى الصفحة
            const response = await fetch(page);
            if (!response.ok) throw new Error('Page not found');

            const html = await response.text();

            // استخرج الـ main content
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const mainContent = doc.querySelector('main') || 
                                 doc.querySelector('.products-section') ||
                                 doc.querySelector('.product-detail-section') ||
                                 doc.querySelector('.cart-section');

            if (mainContent) {
                const currentMain = document.querySelector('main') || 
                                    document.querySelector('.products-section') ||
                                    document.querySelector('.product-detail-section') ||
                                    document.querySelector('.cart-section');
                
                if (currentMain) {
                    currentMain.replaceWith(mainContent);
                }
            }

            // حمّل الصفحة
            if (window.app) {
                window.app.currentPage = window.app.getCurrentPage();
                window.app.loadCurrentPage();
            }
        } catch (error) {
            console.error('Error loading page:', error);
        }
    },

    // هاد الدالة بتحرّك للمنتج المحدد
    navigateToProduct(productId) {
        this.navigate(`product.html?id=${productId}`);
    },

    // هاد الدالة بتحرّك للفئة المحددة
    navigateToCategory(category) {
        this.navigate(`products.html?category=${category}`);
    },

    // هاد الدالة بتحرّك للسلة
    navigateToCart() {
        this.navigate('cart.html');
    },

    // هاد الدالة بتحرّك للرئيسية
    navigateHome() {
        this.navigate('index.html');
    }
};

// استدع الدالة عند الضغط على الزر للرجوع
window.addEventListener('popstate', () => {
    if (window.app) {
        window.app.currentPage = window.app.getCurrentPage();
        window.app.loadCurrentPage();
    }
});