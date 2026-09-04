'use strict';

//------ Видео в hero ------\\
// Видео должно вести себя как гифка: играть само, беззвучно, по кругу.
// Три случая, когда автоплей не состоится, и во всех остаётся постер:
// режим энергосбережения на iOS, настройка «уменьшить анимацию»,
// ошибка загрузки файла.

const INTRO_SKIP = 2;      // секунды тёмной заставки с логотипом в начале ролика

export class Hero {
    constructor() {
        this.video = document.querySelector('.hero-video');
        if (!this.video) return;                  // не эта страница

        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.lastTime = 0;
        this.looped = false;
        this.init();
    }

    init() {
        if (this.reduceMotion) {
            this.video.removeAttribute('autoplay');
            this.video.pause();
            return;                               // постер уже показан браузером
        }

        this.video.addEventListener('error', this.showPoster.bind(this), true);
        this.video.addEventListener('timeupdate', this.skipIntroOnLoop.bind(this));

        const attempt = this.video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(this.showPoster.bind(this));
        }
    }

    // Заставка с логотипом (первые INTRO_SKIP секунд) играет один раз при
    // первой загрузке; атрибут loop гоняет ролик по кругу целиком, поэтому
    // ловим момент, когда currentTime резко откатывается назад — значит
    // петля перешла через конец — и на всех витках, кроме первого, сразу
    // перематываем на INTRO_SKIP.
    skipIntroOnLoop() {
        if (this.video.currentTime < this.lastTime - 1) this.looped = true;
        this.lastTime = this.video.currentTime;

        if (this.looped && this.video.currentTime < INTRO_SKIP) {
            this.video.currentTime = INTRO_SKIP;
        }
    }

    // Постер отрисован браузером под видео: достаточно погасить сам кадр,
    // удалять элемент нельзя — иначе исчезнет и постер.
    showPoster() {
        this.video.classList.add('is-fallback');
    }
}
