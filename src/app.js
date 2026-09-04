import {Viewport} from "../dist/scripts/viewport.min.js";
import {Common} from "../dist/scripts/common.min.js";
import {Hero} from "../dist/scripts/hero.min.js";
import {Catalog} from "../dist/scripts/catalog.min.js";
import {Sets} from "../dist/scripts/sets.min.js";

class App {
    constructor() {
        window.addEventListener('DOMContentLoaded', this.initComponents.bind(this));
    }

    initComponents() {
        this.viewport = new Viewport();

        new Common();
        new Hero();
        new Catalog(this.viewport);
        new Sets(this.viewport);
    }
}

(new App());
