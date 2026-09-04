'use strict';

//------ Общие механики страницы ------\\

export class Common {
    constructor() {
        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // полноэкранный лоадер (#pageLoader) скрывается инлайновым скриптом прямо в HTML,
        // а не отсюда — он обязан отработать, даже если этот файл не загрузится, поэтому
        // лоадер никогда не залипнет открытым

        this.revealTargets = document.querySelectorAll('.reveal');
        this.statNumbers = document.querySelectorAll('.stat-number[data-count-to]');
        this.flavorSliders = document.querySelectorAll('.flavor-photo--slider');
        this.heroVisual = document.getElementById('heroVisual');
        this.heroPastilaImg = document.getElementById('heroPastilaImg');

        this.init();
    }

    init() {
        this.initReveal();
        this.initCounters();
        this.initFlavorSliders();
        this.initHeroParallax();
    }

    //------ Появление блоков по мере скролла ------\\
    initReveal() {
        if (this.reduceMotion || !this.revealTargets.length || !('IntersectionObserver' in window)) {
            this.revealTargets.forEach((el) => el.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, {threshold: 0.15});

        this.revealTargets.forEach((el) => observer.observe(el));
    }

    //------ Счётчики в stat-strip ------\\
    initCounters() {
        if (!this.statNumbers.length) return;

        const reduceMotion = this.reduceMotion;

        const animateCount = (el) => {
            const target = parseInt(el.getAttribute('data-count-to'), 10);
            if (reduceMotion || !('IntersectionObserver' in window)) {
                el.textContent = target;
                return;
            }
            const duration = 800;
            let start = null;
            const step = (timestamp) => {
                if (start === null) start = timestamp;
                const progress = Math.min((timestamp - start) / duration, 1);
                el.textContent = Math.floor(progress * target);
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    el.textContent = target;
                }
            };
            window.requestAnimationFrame(step);
        };

        if (!reduceMotion && 'IntersectionObserver' in window) {
            const statObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animateCount(entry.target);
                        statObserver.unobserve(entry.target);
                    }
                });
            }, {threshold: 0.5});

            this.statNumbers.forEach((el) => statObserver.observe(el));
        } else {
            this.statNumbers.forEach((el) => {
                el.textContent = el.getAttribute('data-count-to');
            });
        }
    }

    //------ Слайдеры фото вкусов ------\\
    initFlavorSliders() {
        this.flavorSliders.forEach((card) => {
            const slides = card.querySelectorAll('.fp-slide');
            const dots = card.querySelectorAll('.fp-dot');
            const prevBtn = card.querySelector('.fp-arrow--prev');
            const nextBtn = card.querySelector('.fp-arrow--next');
            let idx = 0;
            const show = (i) => {
                idx = (i + slides.length) % slides.length;
                slides.forEach((s, si) => s.classList.toggle('is-active', si === idx));
                dots.forEach((d, di) => d.classList.toggle('is-active', di === idx));
            };
            dots.forEach((d, di) => {
                d.addEventListener('click', (e) => {
                    e.preventDefault();
                    show(di);
                });
            });
            if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); show(idx - 1); });
            if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); show(idx + 1); });
        });
    }

    //------ Параллакс героя по движению мыши ------\\
    initHeroParallax() {
        if (!this.reduceMotion && this.heroVisual && this.heroPastilaImg && window.matchMedia('(hover: hover)').matches) {
            this.heroVisual.addEventListener('mousemove', (e) => {
                const rect = this.heroVisual.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                this.heroPastilaImg.style.transform = 'translate(' + (x * -18) + 'px,' + (y * -14) + 'px)';
            });
            this.heroVisual.addEventListener('mouseleave', () => {
                this.heroPastilaImg.style.transform = '';
            });
        }
    }
}
