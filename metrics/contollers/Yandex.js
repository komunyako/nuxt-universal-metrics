import MetricInterface, { undefinedMetric } from './base';
import loader from './loader';


class YandexMetric extends MetricInterface {
    constructor(id) {
        super();

        this.name = 'Yandex';
        this.id = id;
        this.globalName = 'ym';
        this.controller = undefinedMetric;

        this.load();
        this.init();
    }

    async load() {
        if (this.request) {
            return this.request;
        }

        this.request = loader.ym(this.globalName);
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

            if (typeof payload === 'string') {
            // Если передана стока, считаем что это название цели
                payload = {
                    target: payload
                };
            }

            this.log('GOAL', payload);
            this.controller(this.id, 'reachGoal', payload.target, extra);

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
            this.controller(this.id, 'hit', payload.to);

        } catch (error) {
            console.error(error);
        }
    }
}

export default YandexMetric;
