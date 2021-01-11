import MetricInterface, { undefinedMetric } from './base';
import loader from './loader';


class GoogleAnalyticsMetric extends MetricInterface {
    constructor(id) {
        super();

        this.name = 'GoogleAnalytics';
        this.id = id;
        this.globalName = 'ga';
        this.controller = undefinedMetric;

        this.load();
        this.init();
    }

    async load() {
        if (this.request) {
            return this.request;
        }

        this.request = loader.ga(this.globalName);
        this.controller = window[this.globalName];

        this.request.then(() => {
            this.onLoaded();
        });

        return this.request;
    }

    async init() {
        try {
            await super.init();

            this.log('INIT');

        } catch (error) {
            this.controller = undefinedMetric;
            console.error(error);
        }
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

            this.log('GOAL', payload);
            this.controller('send', payload);

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

            this.log('HIT', payload);
            this.controller('set', 'page', payload.to);
            this.controller('send', 'pageview');

        } catch (error) {
            console.error(error);
        }
    }
}

export default GoogleAnalyticsMetric;
