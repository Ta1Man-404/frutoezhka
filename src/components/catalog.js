'use strict';

//------ Каталог вкусов: карусели и пинned-скролл ------\\

// ---- данные вкусов ----
const CLASSIC = [
    {icon: 'icon-apple.svg', name: 'Яблоко', front: 'yabloko.jpg', side: 'yabloko-side.jpg', open: 'yabloko-open.png'},
    {icon: 'icon-blueberry.svg', name: 'Яблоко + черника', front: 'chernika.jpg', side: 'chernika-side.jpg', open: 'abrikos-open.png'},
    {icon: 'icon-pumpkin.svg', name: 'Яблоко + тыква', front: 'tikva.jpg', side: 'tikva-side.jpg', open: 'tikva-open.png'},
    {icon: 'icon-pear.svg', name: 'Яблоко + груша', front: 'grusha.jpg', side: 'grusha-side.jpg', open: 'yabloko-open.png'},
    {icon: 'icon-pineapple.svg', name: 'Яблоко + ананас', front: 'ananas.jpg', side: 'ananas-side.jpg', open: 'ananas-open.png'},
    {icon: 'icon-orange.svg', name: 'Яблоко + апельсин', front: 'apelsin.jpg', side: 'apelsin-side.jpg', open: 'apelsin-open.png'},
    {icon: 'icon-apricot.svg', name: 'Яблоко + абрикос', front: 'abrikos.jpg', side: 'abrikos-side.jpg', open: 'abrikos-open.png'},
    {icon: 'icon-banana.svg', name: 'Яблоко + банан', front: 'banan.jpg', side: 'banan-side.jpg', open: 'banan-open.png'},
    {icon: 'icon-melon.svg', name: 'Яблоко + дыня', front: 'dinya.jpg', side: 'dinya-side.jpg', open: 'dinya-open.png'},
    {icon: 'icon-barberry.svg', name: 'Яблоко + барбарис', front: 'barbaris.jpg', side: 'barbaris-side.jpg', open: 'barbaris-open.png'},
    {icon: 'icon-cherry.svg', name: 'Яблоко + вишня', front: 'vishnya.jpg', side: 'vishnya-side.jpg', open: 'vishnya-open.png'}
];

const SPECIAL = [
    {icon: 'icon-apple.svg', name: 'Яблоко (длинная)', front: 'long-apple.jpg', side: 'long-apple-side.jpg', open: 'long-apple-open.png', frontBg: 'linear-gradient(135deg, #fbfbfd 0%, #f0f0f4 100%)'},
    {icon: 'icon-plum.svg', name: 'Слива', front: 'long-plum.jpg', side: 'long-plum-side.jpg', open: 'long-plum-open.png'},
    {icon: 'icon-cherry.svg', name: 'Вишня', front: 'long-cherry.jpg', side: 'long-cherry-side.jpg', open: 'long-cherry-open.png'},
    {icon: 'icon-mango.svg', name: 'Манго', front: 'long-mango.jpg', side: 'long-mango-side.jpg', open: 'long-mango-open.png'},
    {icon: 'icon-strawberry.svg', name: 'Клубника', front: 'long-strawberry.jpg', side: 'long-strawberry-side.jpg', open: 'long-strawberry-open.png', frontBg: 'linear-gradient(135deg, #ffffff 0%, #eeeeee 100%)'},
    {icon: 'icon-apricot.svg', name: 'Абрикос', front: 'long-apricot.jpg', side: 'long-apricot-side.jpg', open: 'long-apricot-open.png'},
    {icon: 'icon-raspberry.svg', name: 'Малина', front: 'long-raspberry.jpg', side: 'long-raspberry-side.jpg', open: 'long-raspberry-open.png'}
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

const LABELS = {front: 'Упаковка спереди', side: 'Упаковка сбоку', open: 'Пастила без упаковки'};

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
        const slots = {
            front: section.querySelector('.collage-slot[data-key="front"]'),
            side: section.querySelector('.collage-slot[data-key="side"]'),
            open: section.querySelector('.collage-slot[data-key="open"]')
        };
        const n = flavors.length;
        const tripled = flavors.concat(flavors).concat(flavors);
        let current = n; // start in middle copy
        let bigKey = 'front'; // which of front/side/open is currently the big photo

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
            const target = 130;
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

        function fillSlot(key, flavor) {
            const slotEl = slots[key];
            const img = slotEl.querySelector('img');
            const label = slotEl.querySelector('.collage-label');
            const hasPhoto = !!flavor[key];
            slotEl.classList.toggle('is-placeholder', !hasPhoto);
            if (hasPhoto) {
                img.src = 'dist/static/images/' + flavor[key];
                img.alt = flavor.name + ' — ' + LABELS[key].toLowerCase();
            }
            // each photo's own studio backdrop, analysed per file — flat white
            // unless that specific shot actually has a soft gradient (front only,
            // a handful of "особый формат" photos); "без упаковки" is a cutout
            // with no backdrop of its own, so it always gets plain white
            const bg = key === 'front' ? (flavor.frontBg || '#fff')
                : key === 'side' ? (flavor.sideBg || '#fff')
                    : '#fff';
            slotEl.style.background = bg;
            label.textContent = LABELS[key];
        }

        function renderCollage(flavor) {
            fillSlot('front', flavor);
            fillSlot('side', flavor);
            fillSlot('open', flavor);
            applyBigKey(false);
        }

        // CSS grid places the explicitly-positioned `--big` slot first, then flows
        // the remaining two `--small` slots into the leftover cells in DOM order —
        // so only one variable (which key is big) needs tracking, not full order.
        function applyBigKey(animate) {
            Object.keys(slots).forEach((key) => {
                const el = slots[key];
                const isBig = key === bigKey;
                el.classList.toggle('collage-slot--big', isBig);
                el.classList.toggle('collage-slot--small', !isBig);
                if (animate && !reduceMotion) {
                    el.classList.remove('is-swapping');
                    void el.offsetWidth;
                    el.classList.add('is-swapping');
                }
            });
        }

        function setBig(key) {
            if (key === bigKey) return;
            bigKey = key;
            applyBigKey(true);
        }

        function currentFlavor() {
            return flavors[((current % n) + n) % n];
        }

        function goTo(newIndex, opts) {
            current = newIndex;
            updateActiveClasses();
            center(current, !(opts && opts.silent));
            bigKey = 'front';
            const f = currentFlavor();
            renderCollage(f);
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

        Object.keys(slots).forEach((key) => {
            slots[key].addEventListener('click', () => { stopAutoplayUI(); setBig(key); });
        });

        // ---- autoplay: cycles which collage photo is big, then advances flavor ----
        const AUTOPLAY_STEP_MS = 7500; // было 2500 — слишком быстро, +5 сек по просьбе
        let autoplayTimer = null;
        let autoplayStep = 0;
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
            autoplayStep = (autoplayStep + 1) % 3;
            if (autoplayStep === 0) {
                goTo(current + 1);
            } else {
                setBig(['front', 'side', 'open'][autoplayStep]);
            }
            resetProgress();
        }

        function startAutoplay() {
            stopAutoplayTimer();
            autoplayStep = 0;
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
