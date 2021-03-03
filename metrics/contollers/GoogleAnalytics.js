import MetricInterface, { undefinedMetric } from './base';
import loader from './loader';


class GoogleAnalyticsMetric extends MetricInterface {
    constructor(id) {
        super();

        this.name = 'GoogleAnalytics';
        this.id = id;
        this.globalName = 'ga';
        this.controller = undefinedMetric;

        this.init();
    }

    async load() {
        if (this.request) {
            return this.request;
        }

        this.request = loader.ga(this.globalName);

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
        if (window[this.globalName]) {
            this.controller = window[this.globalName];
        } else {
            this.controller = window[this.globalName] = window[this.globalName] || function() {
                (window[this.globalName].q = window[this.globalName].q || []).push(arguments);
            };

            window[this.globalName].l = 1 * new Date();
        }

        this.controller('create', this.id, 'auto');
    }

    /**
     * Отправляет цель
     * @param {{target: string}} payload
     * @param {{string: *}} [extra]
     */
    goal(payload, extra) {
        try {
            super.goal(payload, extra);

            const defaults = {
                hitType: 'event',
                eventCategory: 'user_behaviour'
            };

            if (typeof payload === 'string') {
                // Если передана стока, считаем что это название цели
                payload = {
                    ...defaults,
                    eventAction: payload
                };
            }

            this.controller('send', payload);
            this.log('GOAL', payload);

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
                // Если передана стока, преобразуем в HitPayload
                payload = {
                    to: payload
                };
            }

            this.controller('set', 'page', payload.to);
            this.controller('send', 'pageview');
            this.log('HIT', payload);

        } catch (error) {
            console.error(error);
        }
    }
}

export default GoogleAnalyticsMetric;
