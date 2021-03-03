import MetricInterface, { undefinedMetric } from './base';
import loader from './loader';


class GoogleTagManagerMetric extends MetricInterface {
    constructor(id) {
        super();

        this.name = 'GTM';
        this.id = id;
        this.globalName = 'dataLayer';
        this.controller = undefinedMetric;

        this.init();
    }

    async load() {
        if (this.request) {
            return this.request;
        }

        this.request = loader.gtm(this.globalName, { id: this.id });

        this.request.then(() => {
            this.controller = window[this.globalName];
            this.onLoaded();
        });

        return this.request;
    }

    async init() {
        try {
            await super.init();

            if (this.id.indexOf(':') !== -1) {
                const [id, layer] = this.id.split(':');

                this.id = id;
                this.globalName = layer;
            }

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
            this.controller = window[this.globalName] = window[this.globalName] || [];

            window[this.globalName].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        }
    }

    /**
     * Проксирует вызов к оригинальному объекту метрики
     */
    call() {
        if (!this.controller) {
            return undefinedMetric.apply(null, arguments);
        }

        return this.controller.push(arguments);
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
                    event: 'uaevent',
                    eventCategory: 'user_behaviour',
                    eventAction: payload,
                    eventLabel: ''
                };
            }

            this.log('GOAL', payload);
            this.controller.push(payload);

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
                    pageType: 'PageView',
                    pageUrl: payload
                };

            } else {
                payload = {
                    pageType: 'PageView',
                    pageUrl: payload.to
                };
            }

            this.controller.push(payload);
            this.log('HIT', payload);

        } catch (error) {
            console.error(error);
        }
    }
}


export default GoogleTagManagerMetric;
