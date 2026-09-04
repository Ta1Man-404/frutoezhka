'use strict';

//------ Кинематограф наборов ------\\
// Вход: IntersectionObserver ставит .is-playing, дальше всё делает CSS.
// Выход: по скроллу, через zoom-safe прогресс из viewport.js.

export class Sets {
    constructor(viewport) {
        this.scroller = document.getElementById('sets-block');
        if (!this.scroller) return;                       // не эта страница

        this.viewport = viewport;
        this.stage = this.scroller.querySelector('.sets-stage');
        this.bg = this.scroller.querySelector('.sets-bg');
        this.head = this.scroller.querySelector('.sets-head');
        this.barTop = this.scroller.querySelector('.sets-bar--top');
        this.barBottom = this.scroller.querySelector('.sets-bar--bottom');
        this.items = Array.prototype.slice.call(this.scroller.querySelectorAll('.sets-item'));
        this.header = document.querySelector('.site-header');

        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        // пиннинг на низком экране (телефон в альбоме) просто режет содержимое
        this.tooShort = window.matchMedia('(max-height: 480px)').matches;

        if (!this.stage || !this.items.length) return;

        this.applyExit = this.applyExit.bind(this);
        this.handleIntroEnd = this.handleIntroEnd.bind(this);

        this.init();
    }

    init() {
        if (this.reduceMotion || this.tooShort) {
            this.scroller.classList.add('sets-static');
            return;
        }

        this.setHeaderHeight();
        this.initIntro();
        this.initExit();
    }

    // Верхняя полоса должна учитывать липкую шапку — отдаём высоту в CSS
    setHeaderHeight() {
        const height = this.header ? this.header.offsetHeight : 0;
        this.stage.style.setProperty('--header-h', height + 'px');
    }

    //------ Вход: один раз, само ------\\
    initIntro() {
        if (!('IntersectionObserver' in window)) {
            this.stage.classList.add('is-played');        // без наблюдателя просто показываем
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                this.stage.classList.add('is-playing');
                observer.unobserve(entry.target);         // играем ровно один раз
            });
        }, {threshold: 0.55});

        observer.observe(this.stage);

        // Последняя карточка доиграла — передаём эстафету классу is-played,
        // иначе `forwards` не даст обработчику выхода менять стили.
        const last = this.items[this.items.length - 1];
        last.addEventListener('animationend', this.handleIntroEnd);
    }

    handleIntroEnd(event) {
        // событие всплывает от детей карточки, а на элементе может идти не
        // одна анимация — реагируем строго на конец intro-анимации именно
        // последней карточки, а не на что попало
        if (event.target !== event.currentTarget || event.animationName !== 'setsFadeUp') return;
        this.stage.classList.remove('is-playing');
        this.stage.classList.add('is-played');
    }

    //------ Выход: по скроллу ------\\
    initExit() {
        this.section = this.viewport.register(this.scroller);
        this.viewport.onScroll(this.applyExit);
        this.applyExit();
    }

    applyExit() {
        const scrolledPx = this.viewport.getProgress(this.section);

        if (!this.stage.classList.contains('is-played')) {
            // Страховка от быстрого пролёта мимо секции: если наблюдатель
            // порога 0.55 не успел сработать (резкий scrollTo далеко вниз),
            // а прогресс по секции уже не нулевой, интро можно смело считать
            // сыгранным — иначе карточки так и останутся с opacity: 0.
            if (this.stage.classList.contains('is-playing') || scrolledPx <= 0) return;
            this.stage.classList.add('is-played');
        }

        const vhPx = window.innerHeight / 100;

        const T = {holdEnd: 120, exitStagger: 7, exitDur: 13};
        const exitEnd = T.holdEnd + (this.items.length - 1) * T.exitStagger + T.exitDur;

        const barsOut = this.easeInOutCubic(this.seg(scrolledPx, T.holdEnd * vhPx, exitEnd * vhPx));
        const shape = Math.max(0, 1 - barsOut);

        this.barTop.style.height = 'calc(' + (shape * 13) + '% + ' + shape + ' * var(--header-h, 0px))';
        this.barBottom.style.height = (shape * 13) + '%';

        const n = this.items.length;
        this.items.forEach((item, domIndex) => {
            // уходят справа налево: последняя в разметке исчезает первой
            const exitIndex = n - 1 - domIndex;
            const outStart = (T.holdEnd + exitIndex * T.exitStagger) * vhPx;
            const outEnd = outStart + T.exitDur * vhPx;
            const out = this.seg(scrolledPx, outStart, outEnd);

            item.style.opacity = 1 - out;
            item.style.transform = 'translateY(' + (out * -28) + 'px)';
        });

        const headOut = this.easeInOutCubic(this.seg(scrolledPx, T.holdEnd * vhPx, (T.holdEnd + 18) * vhPx));
        this.head.style.opacity = 1 - headOut;
        this.head.style.transform = 'translateY(' + (headOut * -16) + 'px)';
    }

    seg(v, start, end) {
        if (end === start) return v >= end ? 1 : 0;
        return Math.min(1, Math.max(0, (v - start) / (end - start)));
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
}
