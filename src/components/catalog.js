'use strict';

//------ Каталог вкусов: карусели и пинned-скролл ------\\

// ---- данные вкусов ----
// Task 15: ракурсы side/open ушли целиком (владелец выбрал макет
// «Разворот» — один фронтальный снимок + слайдер атмосферных фото),
// имена сокращены — яблочная основа названа один раз в подписи секции.
const CLASSIC = [
    {icon: 'icon-apple.svg', name: 'Яблоко', front: 'yabloko.jpg'},
    {icon: 'icon-blueberry.svg', name: 'Черника', front: 'chernika.jpg'},
    {icon: 'icon-pumpkin.svg', name: 'Тыква', front: 'tikva.jpg'},
    {icon: 'icon-pear.svg', name: 'Груша', front: 'grusha.jpg'},
    {icon: 'icon-pineapple.svg', name: 'Ананас', front: 'ananas.jpg'},
    {icon: 'icon-orange.svg', name: 'Апельсин', front: 'apelsin.jpg'},
    {icon: 'icon-apricot.svg', name: 'Абрикос', front: 'abrikos.jpg'},
    {icon: 'icon-banana.svg', name: 'Банан', front: 'banan.jpg'},
    {icon: 'icon-melon.svg', name: 'Дыня', front: 'dinya.jpg'},
    {icon: 'icon-barberry.svg', name: 'Барбарис', front: 'barbaris.jpg'},
    {icon: 'icon-cherry.svg', name: 'Вишня', front: 'vishnya.jpg'}
];

const SPECIAL = [
    {icon: 'icon-apple.svg', name: 'Яблоко', front: 'long-apple.jpg', frontBg: 'linear-gradient(135deg, #fbfbfd 0%, #f0f0f4 100%)'},
    {icon: 'icon-plum.svg', name: 'Слива', front: 'long-plum.jpg'},
    {icon: 'icon-cherry.svg', name: 'Вишня', front: 'long-cherry.jpg'},
    {icon: 'icon-mango.svg', name: 'Манго', front: 'long-mango.jpg'},
    {icon: 'icon-strawberry.svg', name: 'Клубника', front: 'long-strawberry.jpg', frontBg: 'linear-gradient(135deg, #ffffff 0%, #eeeeee 100%)'},
    {icon: 'icon-apricot.svg', name: 'Абрикос', front: 'long-apricot.jpg'},
    {icon: 'icon-raspberry.svg', name: 'Малина', front: 'long-raspberry.jpg'}
];

// ---- атмосферные фото слайдера (общие для classic и special — один и
// тот же набор, браузер переиспользует уже загруженные файлы) ----
const ATMO_PHOTOS = [
    {file: 'atmo-1.jpg', alt: 'Фрукты, шоколад и упаковки пастилы крупным планом'},
    {file: 'atmo-2.jpg', alt: 'Крафтовые кульки с пастилой'},
    {file: 'atmo-3.jpg', alt: 'Коробка «Пастила фруктовая» с россыпью пастилок'},
    {file: 'atmo-4.jpg', alt: 'Плотная россыпь разноцветных упаковок пастилы'}
];

const BG_LAYOUT = [
    {top: '8%', left: '6%', size: 120, rot: -12},
    {top: '62%', left: '2%', size: 90, rot: 10},
    {top: '18%', left: '86%', size: 140, rot: 8},
    {top: '70%', left: '90%', size: 100, rot: -8},
    {top: '40%', left: '46%', size: 80, rot: 14},
    {top: '4%', left: '40%', size: 70, rot: -6},
    {top: '30%', left: '14%', size: 60, rot: 18},
    {top: '85%', left: '38%', size: 85, rot: -14},
    {top: '50%', left: '92%', size: 65, rot: 20},
    {top: '10%', left: '64%', size: 95, rot: -10}
];

export class Catalog {
    constructor(viewport) {
        this.viewport = viewport; // задачи 7-8 переведут прогресс скролла на него
        this.classicSection = document.getElementById('explorer-classic');
        this.specialSection = document.getElementById('explorer-special');
        if (!this.classicSection && !this.specialSection) return; // не эта страница
        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }

    init() {
        if (this.classicSection) this.initExplorer(this.classicSection, CLASSIC, BG_LAYOUT);
        if (this.specialSection) this.initExplorer(this.specialSection, SPECIAL, BG_LAYOUT);
        this.initScroller();
    }

    //------ Карусель вкусов + коллаж фото ------\\
    initExplorer(section, flavors, bgIcons) {
        const reduceMotion = this.reduceMotion;

        const track = section.querySelector('.carousel-track');
        const viewport = section.querySelector('.carousel-viewport');
        const prevBtn = section.querySelector('.carousel-arrow--prev');
        const nextBtn = section.querySelector('.carousel-arrow--next');
        const announce = section.querySelector('.explorer-announce');
        const toggleInput = section.querySelector('.autoplay-checkbox');
        const toggleLabel = section.querySelector('.autoplay-toggle');
        const bgLayer = section.querySelector('.explorer-bg');
        const flavorName = section.querySelector('.flavor-name');
        const frontFrame = section.querySelector('.flavor-frame');
        const frontImg = frontFrame ? frontFrame.querySelector('img') : null;
        const n = flavors.length;
        const tripled = flavors.concat(flavors).concat(flavors);
        let current = n; // start in middle copy

        tripled.forEach((f, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'carousel-item';
            btn.innerHTML = '<i><img src="dist/static/images/icons/' + f.icon + '" alt="" loading="lazy"></i><span>' + f.name + '</span>';
            btn.addEventListener('click', () => { stopAutoplayUI(); goTo(i); });
            track.appendChild(btn);
        });

        // decorative background fruits
        if (bgLayer) {
            bgIcons.forEach((pos, i) => {
                const f = flavors[i % flavors.length];
                const wrap = document.createElement('div');
                wrap.className = 'explorer-bg-fruit';
                wrap.style.top = pos.top;
                wrap.style.left = pos.left;
                wrap.style.width = pos.size + 'px';
                wrap.style.height = pos.size + 'px';
                wrap.style.transform = 'rotate(' + pos.rot + 'deg)';
                wrap.innerHTML = '<img src="dist/static/images/icons/' + f.icon + '" alt="" loading="lazy">';
                bgLayer.appendChild(wrap);
            });
        }

        // sizes carousel items so a whole odd count fits the viewport edge-to-edge —
        // the selected flavor then always lands exactly in the middle
        function layoutCarousel() {
            const vw = viewport.getBoundingClientRect().width;
            const target = 100; // Task 15: карусель компактнее — делит место с фронтальным снимком
            let count = Math.max(1, Math.round(vw / target));
            if (count % 2 === 0) count -= 1;
            const step = vw / count;
            track.style.setProperty('--item-step', step + 'px');
            return step;
        }

        function center(index, animate) {
            // measure the target item's real rendered position (offsetLeft ignores the
            // track's own transform) instead of assuming index * uniformStep — flexbox
            // rounds non-integer widths per-item, so that assumption drifts with index
            const item = track.children[index];
            const itemCenter = item.offsetLeft + item.offsetWidth / 2;
            const x = viewport.getBoundingClientRect().width / 2 - itemCenter;
            if (!animate) track.classList.remove('is-animating');
            else track.classList.add('is-animating');
            track.style.transform = 'translateX(' + x + 'px)';
        }

        function updateActiveClasses() {
            Array.prototype.forEach.call(track.children, (child, i) => {
                const dist = Math.abs(i - current);
                child.style.setProperty('--dist', dist);
                child.classList.toggle('is-active', i === current);
            });
        }

        // единственный фронтальный снимок вкуса — коллаж из трёх ракурсов
        // (Task 15) ушёл вместе с side/open; фон снимка по-прежнему берётся
        // с конкретного вкуса, если задан свой градиент, иначе — белый
        function renderFront(flavor) {
            if (!frontImg) return;
            frontImg.src = 'dist/static/images/' + flavor.front;
            frontImg.alt = flavor.name + ' — упаковка пастилы';
            frontFrame.style.background = flavor.frontBg || '#fff';
        }

        function currentFlavor() {
            return flavors[((current % n) + n) % n];
        }

        function goTo(newIndex, opts) {
            current = newIndex;
            updateActiveClasses();
            center(current, !(opts && opts.silent));
            const f = currentFlavor();
            renderFront(f);
            if (flavorName) flavorName.textContent = f.name;
            if (announce) announce.textContent = f.name;
        }

        track.addEventListener('transitionend', () => {
            if (current < n * 0.5 || current > n * 2.5) {
                const equiv = ((current % n) + n) % n + n;
                current = equiv;
                center(current, false);
                updateActiveClasses();
            }
        });

        prevBtn.addEventListener('click', () => { stopAutoplayUI(); goTo(current - 1); });
        nextBtn.addEventListener('click', () => { stopAutoplayUI(); goTo(current + 1); });

        section.querySelector('.carousel').addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { stopAutoplayUI(); goTo(current - 1); }
            if (e.key === 'ArrowRight') { stopAutoplayUI(); goTo(current + 1); }
        });

        // ---- autoplay: листает вкусы с шагом 5с (Ruling 53, правка владельца) ----
        // раньше тумблер перебирал ракурсы одного вкуса (front/side/open), а
        // потом переходил к следующему; ракурсов больше нет, так что тик
        // теперь просто продвигает карусель на один вкус. Было 7.5с (Task 15,
        // первая версия), владелец попросил вернуть 5с уже по ходу работы.
        const AUTOPLAY_STEP_MS = 5000;
        let autoplayTimer = null;
        const progressBar = section.querySelector('.autoplay-progress-bar');
        const progressWrap = section.querySelector('.autoplay-progress');
        if (progressWrap) progressWrap.style.setProperty('--tick-duration', (AUTOPLAY_STEP_MS / 1000) + 's');

        function resetProgress() {
            if (!progressBar) return;
            progressBar.classList.remove('is-running');
            progressBar.style.width = '0%';
            void progressBar.offsetWidth; // force reflow so the next transition restarts from 0
            progressBar.classList.add('is-running');
            progressBar.style.width = '100%';
        }

        function autoplayTick() {
            goTo(current + 1);
            resetProgress();
        }

        function startAutoplay() {
            stopAutoplayTimer();
            autoplayTimer = setInterval(autoplayTick, AUTOPLAY_STEP_MS);
            if (progressWrap) progressWrap.hidden = false;
            resetProgress();
        }

        function stopAutoplayTimer() {
            if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
            if (progressWrap) {
                progressWrap.hidden = true;
                if (progressBar) { progressBar.classList.remove('is-running'); progressBar.style.width = '0%'; }
            }
        }

        function stopAutoplayUI() {
            if (toggleInput.checked) {
                toggleInput.checked = false;
                stopAutoplayTimer();
            }
        }

        if (reduceMotion) {
            toggleInput.disabled = true;
            toggleLabel.setAttribute('data-disabled', '');
            toggleLabel.title = 'Автовоспроизведение отключено — у вас включена настройка "уменьшить анимацию"';
        } else {
            toggleInput.addEventListener('change', () => {
                if (toggleInput.checked) startAutoplay();
                else stopAutoplayTimer();
            });
        }

        // ---- scroll parallax on background fruit layer ----
        // на viewport.onScroll: та же формула, но rect.top заменён на позицию
        // секции от верха документа минус текущий layout-скролл — устойчиво
        // к pinch-zoom, и заморозка теперь общая с остальным таймлайном.
        if (!reduceMotion && bgLayer) {
            const bgSection = this.viewport.register(section);
            const update = () => {
                const top = bgSection.top - window.scrollY;
                bgLayer.style.transform = 'translateY(' + ((window.innerHeight - top) * 0.06) + 'px)';
            };
            this.viewport.onScroll(update);
            update();
        }

        window.addEventListener('resize', () => {
            layoutCarousel();
            center(current, false);
        });

        // init
        layoutCarousel();
        goTo(current, {silent: true});
        center(current, false);

        this.initAtmoSlider(section);
    }

    //------ Слайдер атмосферных фото (правая колонка «разворота») ------\\
    // Живёт на собственном таймере, не на скролле: viewport.js и заморозка
    // при зуме его не касаются (Ruling 51) — только пауза по
    // IntersectionObserver, когда секция не видна, и полное отключение
    // автопрокрутки при prefers-reduced-motion.
    initAtmoSlider(section) {
        const track = section.querySelector('.atmo-slider');
        if (!track) return;
        const slides = Array.prototype.slice.call(track.querySelectorAll('.atmo-slide'));
        if (!slides.length) return;

        const STEP_MS = 4000;
        let index = 0;
        let timer = null;

        function show(i) {
            index = i;
            slides.forEach((el, j) => el.classList.toggle('is-active', j === i));
        }

        function tick() {
            show((index + 1) % slides.length);
        }

        const start = () => {
            if (timer || this.reduceMotion || slides.length < 2) return;
            timer = setInterval(tick, STEP_MS);
        };

        function stop() {
            if (timer) { clearInterval(timer); timer = null; }
        }

        if (!this.reduceMotion && slides.length > 1) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) start();
                    else stop();
                });
            }, {threshold: 0.1});
            observer.observe(section);
        }

        show(0);

        // тестовый хук: останавливает таймер и жёстко возвращает первый
        // кадр без перехода — используется baseline.spec.js перед каждым
        // скриншотом, тем же приёмом, каким уже заморожен кадр hero-видео
        // (иначе таймер, крутящийся по 4с, замигает всю сеть эталонов).
        window.__atmoSliders = window.__atmoSliders || [];
        window.__atmoSliders.push({stop, freeze: () => { stop(); show(0); }});
    }

    //------ Пинned-скролл каталога: classic → title card → special ------\\
    // thresholds in vh, measured from the start of the pin — keep BUDGET_VH in sync
    // with the `calc(100vh + 420vh)` scroller height in mockup-v3.css
    initScroller() {
        this.scroller = document.getElementById('catalog-block');
        this.classicLayer = document.getElementById('explorer-classic');
        this.titleLayer = document.getElementById('titleCard');
        this.specialLayer = document.getElementById('explorer-special');
        this.scrollHint = document.getElementById('scrollHint');
        if (!this.scroller || !this.classicLayer || !this.titleLayer || !this.specialLayer) return;

        if (this.reduceMotion) {
            this.scroller.classList.add('catalog-static');
            return; // таймлайн не заводится вовсе
        }

        this.T = {
            classicOutStart: 90, classicOutEnd: 115,
            titleInStart: 115, titleInEnd: 135,
            titleHoldEnd: 225, titleOutEnd: 250,
            specialInEnd: 275
        };

        // прогресс скролла теперь считает Viewport (layout-скролл + заморозка
        // на зуме), а не собственный getBoundingClientRect().top — pinch-zoom
        // больше не путается со скроллом. Свои ticking/resize-обвязка не
        // нужны: rAF и заморозка уже внутри viewport.onScroll(), а
        // перезамер секций при resize делает сам Viewport.
        this.section = this.viewport.register(this.scroller);
        this.viewport.onScroll(this.applyScroller.bind(this));
        this.applyScroller();
    }

    applyScroller() {
        const T = this.T;
        const vhPx = window.innerHeight / 100;
        const scrolledPx = this.viewport.getProgress(this.section);

        const classicOpacity = 1 - seg(scrolledPx, T.classicOutStart * vhPx, T.classicOutEnd * vhPx);
        const titleIn = seg(scrolledPx, T.titleInStart * vhPx, T.titleInEnd * vhPx);
        const titleOut = seg(scrolledPx, T.titleHoldEnd * vhPx, T.titleOutEnd * vhPx);
        const titleOpacity = Math.min(1, Math.max(0, titleIn - titleOut));
        const specialOpacity = seg(scrolledPx, T.titleOutEnd * vhPx, T.specialInEnd * vhPx);

        this.classicLayer.style.opacity = classicOpacity;
        this.titleLayer.style.opacity = titleOpacity;
        this.specialLayer.style.opacity = specialOpacity;
        if (this.scrollHint) this.scrollHint.style.opacity = 1 - seg(scrolledPx, 0, 8 * vhPx);

        const classicOn = classicOpacity > 0.05;
        const specialOn = specialOpacity > 0.05;
        this.classicLayer.toggleAttribute('inert', !classicOn);
        this.specialLayer.toggleAttribute('inert', !specialOn);
        this.classicLayer.classList.toggle('is-layer-active', classicOn);
        this.specialLayer.classList.toggle('is-layer-active', specialOn);
    }
}

function seg(v, start, end) {
    if (end === start) return v >= end ? 1 : 0;
    return Math.min(1, Math.max(0, (v - start) / (end - start)));
}
