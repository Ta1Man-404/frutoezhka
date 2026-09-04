'use strict';

//------ Прогресс скролла, устойчивый к pinch-zoom ------\\
// У мобильных браузеров два viewport: layout (макет) и visual (видимая
// область). Pinch-zoom двигает visual, layout стоит. Из-за этого
// getBoundingClientRect() на iOS «едет» при панорамировании зумленной
// страницы, а сама страница шлёт обычные scroll-события. Секции, считавшие
// прогресс от rect.top, принимали зум за скролл и переключали слои.
//
// Защита А: прогресс считается от window.scrollY (layout-скролл, зум на
//           него не влияет) и закэшированной позиции секции в документе.
// Защита Б: пока visualViewport.scale > 1.01, обработчики скролла вообще
//           не вызываются — таймлайн замораживается.

export class Viewport {
    constructor() {
        this.isZoomed = false;
        this.sections = [];
        this.callbacks = [];
        this.resizeTimer = null;

        this.handleResize = this.handleResize.bind(this);
        this.handleZoomChange = this.handleZoomChange.bind(this);
        this.remeasureAll = this.remeasureAll.bind(this);

        this.initVisualViewport();
        window.addEventListener('resize', this.handleResize);

        // Кэш section.top снимается в register() на DOMContentLoaded — если
        // картинки выше по странице догрузятся позже и сдвинут макет, кэш
        // соврёт и каталог начнёт переключать слои не в той точке. Старый
        // код мерил rect.top каждый кадр и был к этому нечувствителен, а
        // здесь эту роль берёт на себя пересчёт по window 'load'.
        window.addEventListener('load', this.remeasureAll);
    }

    //------ Защита Б: заморозка на время зума ------\\
    initVisualViewport() {
        const vv = window.visualViewport;
        if (!vv) return;                          // старый WebView — работает только защита А
        vv.addEventListener('resize', this.handleZoomChange);
        vv.addEventListener('scroll', this.handleZoomChange);
        this.handleZoomChange();
    }

    handleZoomChange() {
        const zoomed = window.visualViewport.scale > 1.01;   // порог гасит дробный шум
        if (zoomed === this.isZoomed) return;
        this.isZoomed = zoomed;
        document.documentElement.classList.toggle('is-zoomed', zoomed);
        if (!zoomed) {
            this.remeasureAll();                  // вернулись к 100% — пересчитать...
            this.callbacks.forEach((callback) => callback()); // ...и сразу отрисовать без скролла
        }
    }

    //------ Защита А: замер по layout-скроллу ------\\
    register(element) {
        const section = {element: element, top: 0, height: 0};
        this.measure(section);
        this.sections.push(section);
        return section;
    }

    measure(section) {
        const rect = section.element.getBoundingClientRect();
        section.top = rect.top + window.scrollY;  // абсолютная позиция в документе
        section.height = section.element.offsetHeight;
    }

    remeasureAll() {
        this.sections.forEach((section) => this.measure(section));
    }

    // Несмотря на название, возвращает НЕ долю 0..1, а пиксели прокрутки
    // внутри секции, ограниченные бюджетом (section.height - innerHeight).
    // Интерфейс сохранён таким намеренно: именно пиксели сейчас потребляют
    // scrolledPx в каталоге и наборах (переезд на этот метод — задачи 7-8).
    getProgress(section) {
        const budget = Math.max(section.height - window.innerHeight, 1);
        const scrolled = window.scrollY - section.top;
        return Math.min(Math.max(scrolled, 0), budget);
    }

    //------ Подписка на скролл с rAF и заморозкой ------\\
    onScroll(callback) {
        this.callbacks.push(callback);            // прогоняется и при выходе из зума, см. handleZoomChange
        let ticking = false;
        const handler = () => {
            if (this.isZoomed) return;            // зум — таймлайн стоит
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(() => {
                callback();
                ticking = false;
            });
        };
        window.addEventListener('scroll', handler, {passive: true});
        return handler;
    }

    handleResize() {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(this.remeasureAll, 100);
    }
}
