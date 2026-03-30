// ========================================
// UI MODULE - USER INTERFACE EFFECTS
// ========================================

// هاد الملف مسؤول عن تأثيرات الواجهة
// بنضيف الحركات والرسائل والأنيميشنات
// هون بتتم جميع تأثيرات الـ UI

const UI = {
    // هاد الدالة بتعرض رسالة تنبيهية
    // بتظهر ورح تختفي تلقائياً
    showToast(message, type = 'success', duration = 3000) {
        const toast = document.getElementById('toast');
        if (!toast) return;

        // أزل الـ classes القديمة
        toast.className = 'toast show ' + type;
        toast.textContent = message;

        // أظهر الرسالة
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // اختفي الرسالة بعد المدة المحددة
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    },

    // هاد الدالة بتحرّك الزر عند الضغط عليه
    // بنعرض animation يدل على الإضافة
    animateAddToCart(button) {
        button.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);

        // اهز أيقونة السلة
        this.shakeCartIcon();
    },

    // هاد الدالة بتهز أيقونة السلة
    // بنعرض animation يدل على إضافة منتج
    shakeCartIcon() {
        const cartIcons = document.querySelectorAll('.cart-icon');
        cartIcons.forEach(icon => {
            icon.style.animation = 'shake 0.5s ease-in-out';
            
            setTimeout(() => {
                icon.style.animation = 'none';
            }, 500);
        });
    },

    // هاد الدالة بتضيف animation للصعود للأعلى
    setupScrollToTopButton() {
        const scrollBtn = document.getElementById('scrollToTop');
        
        if (!scrollBtn) return;

        // أضف الـ CSS animation إذا ما موجودة
        if (!document.querySelector('style[data-scroll-to-top]')) {
            const style = document.createElement('style');
            style.setAttribute('data-scroll-to-top', '');
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }

        // اظهر الزر عند التمرير للأسفل
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollBtn.classList.add('show');
            } else {
                scrollBtn.classList.remove('show');
            }
        });

        // اذهب للأعلى عند الضغط
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    },

    // هاد الدالة بتضيف تأثيرات الـ hover على البطاقات
    setupCardHoverEffects() {
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transition = 'all 0.3s ease';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transition = 'all 0.3s ease';
            });
        });
    },

    // هاد الدالة بتضيف تأثيرات النقر على الأزرار
    setupButtonEffects() {
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // أضف نقطة نقر
                const ripple = document.createElement('span');
                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');

                btn.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });
    },

    // هاد الدالة بتضيف lazy loading للصور
    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    },

    // هاد الدالة بتضيف تأثيرات التحميل
    showLoadingState(element) {
        element.style.opacity = '0.6';
        element.style.pointerEvents = 'none';
    },

    // هاد الدالة بتزيل تأثيرات التحميل
    hideLoadingState(element) {
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
    }
};

// استدع الدوال عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    UI.setupCardHoverEffects();
    UI.setupButtonEffects();
});