/**
 * Подмена для сломанной метрики
 */
function undefinedMetric() {
    console.error('[metrics] Нет такой метрики \n—————————\n', ...arguments);
}
Object.assign(undefinedMetric.prototype, {
    call: undefinedMetric,
    goal: undefinedMetric,
    hit: undefinedMetric
});

export { undefinedMetric };


/**
 * Описывает и реализует базовые методы метрики
 * @interface
 */
class MetricInterface {
    constructor() {
        this.name = '';
        this.controller = null;
        this.request = null;
        this.id = null;
        this.isLoaded = false;
    }

    /**
     * Установка метрики.
     *
     * Использовать для загрузки скриптов и последующей интеграции
     */
    async init() {
        if (!this.id) {
            throw TypeError('[metrics] Нет идентификатора');

        } else if (typeof this.id === 'function') {
            // Если это функция для получения айдишника, то вызываем её
            // Подразумевается что там делается запрос к серверу и приходит нужны идентификатор
            this.id = await this.id();
        }
    }

    /**
     * Загрузка скриптов
     * @returns {Promise}
     */
    async load() {}

    /**
     * Колбэк после загрузки
     * @returns {Promise}
     */
    onLoaded() {
        this.isLoaded = true;
        this.log('LOADED');
    }

    /**
     * Проксирует вызов к оригинальному объекту метрики
     */
    call() {
        if (!this.controller) {
            return undefinedMetric.apply(null, arguments);
        }

        return this.controller.apply(null, arguments);
    }

    /**
     * Отправляет цель
     * @param {{target: string}} payload
     * @param {{string: *}} [extra]
     */
    goal() {}

    /**
     * Отправляет событие посещения.
     *
     * По умолчанию, тут хранятся базовые проверки данных.
     * При имплементации метода рекоммендуется вызвать эти проверки `super.hit(payload)`, либо написать свои.
     * @param {{to: string, from?: string} | string} payload
     * @param {{string: *}} [extra]
     */
    hit(payload) {
        if (!payload) {
            throw TypeError('[metrics] Не переданы данные');
        }

        try {
            this.checkState();
        } catch (error) {
            throw TypeError(error);
        }
    }

    /**
     * Проверяет состояние праметров
     */
    checkState() {
        if (!this.name || !this.controller || !this.id) {
            throw TypeError('[metrics] Не переданы параметры инициализации');
        }
    }

    /**
     * @param {string} name ключ идентификации
     * @param  {...any} [otherArguments] параметры
     */
    log(name, ...otherArguments) {
        console.log(`[metrics | ${ name }] ${ this.name + (typeof this.id !== 'function' ? ' × ' + this.id : '') } \n`, ...otherArguments);
    }
}

export default MetricInterface;
