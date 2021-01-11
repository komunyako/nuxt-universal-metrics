import UniversalMetric from '@/modules/metrics/contollers/Universal';
import {undefinedMetric} from '@/modules/metrics/contollers/base';
import YandexMetric from '@/modules/metrics/contollers/Yandex';
import GoogleAnalyticsMetric from '@/modules/metrics/contollers/GoogleAnalytics';
import GoogleTagManagerMetric from '@/modules/metrics/contollers/GoogleTagManager';



async function getIds(ids) {
    const type = typeof ids;

    if (type === 'function') {
        return [ids.bind(null, this)];

    } else if (Array.isArray(ids)) {
        return ids.reduce((result, id) => result.concat(getIds(id)), []);

    } else if (type === 'string' || type === 'number') {
        return [ids];
    }

    return [];
}

async function initMetrics({controller, id, context} = {}) {
    if (!controller || !id) {
        throw TypeError('[metrics] Не передан контроллер или идентификаторы');
    }

    const idList = await getIds.call(context, id);

    return idList.map((_id) => new controller(_id))
}

export default async function(context, inject) {
    const { app: { router } } = context;
    let options = {};

    try {
        options = <%= serialize(options) %>;

        if (typeof options === 'function') {
            options = await options.call(context);
            if (!(!!options && options.constructor === Object)) {
                throw TypeError('[metrics] Функция настроек должна возвращать объект');
            }
        }

    } catch (error) {
        throw TypeError('[metrics] Что-то не так с параметрами');
    }

    if (!Object.keys(options).filter((x) => !['debug'].includes(x)).length) {
        throw TypeError('[metrics] Не заданы настройки ни одной из метрик');
    }

    const $universal = new UniversalMetric();

    <% if (options.ym) { %>
        const ymList = await initMetrics({
            context,
            id: options.ym,
            controller: YandexMetric
        });

        $universal.push(ymList);
        $universal.$ym = new UniversalMetric(ymList);

    <% } else { %>
        // Подставляем фейковый контроллер, чтобы вызов на незаданной метрики не ломал страницу
        $universal.$ym = undefinedMetric.prototype;
    <% } %>

    <% if (options.ga) { %>
        const gaList = await initMetrics({
            context,
            id: options.ga,
            controller: GoogleAnalyticsMetric
        });

        $universal.push(gaList);
        $universal.$ga = new UniversalMetric(gaList);

    <% } else { %>
        // Подставляем фейковый контроллер, чтобы вызов на незаданной метрики не ломал страницу
        $universal.$ga = undefinedMetric.prototype;
    <% } %>

    <% if (options.gtm) { %>
        const gtmList = await initMetrics({
            context,
            id: options.gtm,
            controller: GoogleTagManagerMetric
        });

        $universal.push(gtmList);
        $universal.$gtm = new UniversalMetric(gtmList);

    <% } else { %>
    // Подставляем фейковый контроллер, чтобы вызов на незаданной метрики не ломал страницу
        $universal.$gtm = undefinedMetric.prototype;
    <% } %>

    router.afterEach(
        /**
         * @param {{fullPath: string}} to
         * @param {{fullPath: string}} from
         */
        (to, from) => {
            $universal.hit({
                to: to.fullPath,
                from: from.fullPath
            });
        }
    );

    inject('metrics', $universal);
}
