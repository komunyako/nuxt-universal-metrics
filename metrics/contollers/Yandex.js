import MetricInterface, { undefinedMetric } from './base';
import loader from './loader';


class YandexMetric extends MetricInterface {
    constructor(id) {
        super();

        this.defaultConfig = {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true
        };

        if (id === Object(id)) {
            const { id: _id, ...config } = id;
            this.id = _id;
            this.config = {
                ...this.defaultConfig,
                ...config
            };

        } else {
            this.config = { ...this.defaultConfig };
        }

        this.name = 'Yandex';
        this.globalName = 'ym';
        this.controller = undefinedMetric;

        this.init();
    }

    async load() {
        if (this.request) {
            return this.request;
        }

        this.request = loader.ym(this.globalName);

        this.request.then(() => {
            this.controller = window[this.globalName];
            this.onLoaded();
        });

        return this.request;
    }

    async init() {
        try {
            await super.init();

            this.initController();
            this.load();
            this.log('INIT');

        } catch (error) {
            this.controller = undefinedMetric;
            console.error(error);
        }
    }

    initController() {
        // Инициализируем глобальные переменные чтобы можно было уже записывать события
        const name = this.globalName;

        if (window[name]) {
            this.controller = window[name];
        } else {
            this.controller = window[name] = window[name] || function() {
                (window[name].a = window[name].a || []).push(arguments);
            };

            this.controller.l = 1 * new Date();
        }

        this.send(this.id, 'init', this.config);
    }

    /**
     * Отправляет цель
     * @param {{target: string}} payload
     * @param {{string: *}} [extra]
     */
    goal(payload, extra) {
        try {
            super.goal(payload, extra);

            if (typeof payload === 'string') {
            // Если передана стока, считаем что это название цели
                payload = {
                    target: payload
                };
            }

            this.log('GOAL', payload);
            this.send(this.id, 'reachGoal', payload.target, extra);

        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Отправляет события посещения
     * @param {{to: string, from?: string} | string} payload
     * @param {{string: *}} [extra]
     */
    hit(payload, extra) {
        try {
            super.hit(payload, extra);

            if (typeof payload === 'string') {
                // Если передана стока, считаем что это путь страницы
                payload = {
                    to: payload
                };
            }

            this.log('HIT', payload);
            this.send(this.id, 'hit', payload.to);

        } catch (error) {
            console.error(error);
        }
    }
}

export default YandexMetric;
