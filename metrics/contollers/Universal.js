import MetricInterface from './base';

class UniversalMetric extends MetricInterface {
    /**
     * @param {MetricInterface[]} metricsInterfaces
     */
    constructor(metricsInterfaces) {
        super();

        this.name = 'Universal';
        this.metricsInterfaces = !Array.isArray(metricsInterfaces) ? [] : metricsInterfaces;
    }

    get length() {
        return this.metricsInterfaces.length;
    }

    /**
     * @param {string} id
     */
    get(id) {
        if (!this.length) {
            return null;
        }

        return this.metricsInterfaces.find((metric) => metric.id === id);
    }

    push(instances) {
        if (Array.isArray(instances)) {
            this.metricsInterfaces.push(...instances);
        } else {
            this.metricsInterfaces.push(instances);
        }
    }

    /**
     * Отправляет цель
     * @param {{target: string}} payload
     * @param {{string: *}} [extra]
     */
    goal(payload, extra) {
        this.forEach((metrica) => metrica.goal(payload, extra));
    }

    /**
     * Отправляет события посещения всем метрикам
     * @param {HitPayload | string} payload
     * @param {{string: *}} [extra]
     */
    hit(payload, extra) {
        this.forEach((metrica) => metrica.hit(payload, extra));
    }

    forEach(method) {
        if (typeof method !== 'function') {
            throw TypeError('[metrics] Нужно передать функцию');
        }

        this.metricsInterfaces.forEach(method);
    }
}

export default UniversalMetric;
