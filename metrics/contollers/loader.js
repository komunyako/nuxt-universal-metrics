const loader = {
    scripts: new Map(),

    /**
     * @param {string} namespace
     * @param {string} url
     * @param {{onBeforeLoad: Function}} options
     */
    insert(namespace, url, options) {
        if (!namespace) {
            return Promise.reject('[metrics] Не указано имя для метрики');
        }

        if (this.scripts.has(url)) {
            // Скрипт уже иниализирован. Возвращаем готовый промис
            return this.scripts.get(url);
        }

        if (options && typeof options.onBeforeLoad === 'function') {
            options.onBeforeLoad();
        }

        const loader = new Promise((resolve, reject) => {
            setTimeout(() => {
                // Двигаем в конец стэка, чтобы не машалось отрисовки
                const script = document.createElement('script');
                script.async = true;
                script.src = url;
                script.onload = resolve;
                script.onerror = () => {
                    console.error('[metrics] Не удалось загрузить метрику \n', url);
                    reject();
                };

                document.head.insertAdjacentElement('beforeend', script);
            });
        });

        this.scripts.set(url, loader);

        loader.catch(() => {
            this.scripts.delete(url);
        });

        return loader;
    },
    ym(namespace) {
        return this.insert(namespace, 'https://mc.yandex.ru/metrika/tag.js');
    },
    ga(namespace) {
        return this.insert(namespace, 'https://www.google-analytics.com/analytics.js');
    },

    /**
     * @param {string} namespace
     * @param {{id: string}} options
     */
    gtm(namespace, options) {
        if (!options || !options.id) {
            throw TypeError('[metrics] Не передан идентификатор метрики');
        }

        return this.insert(namespace, `https://www.googletagmanager.com/gtm.js?id=${ options.id }${ namespace !== 'dataLayer' ? '&l=' + namespace : '' }`);
    }
};

export default loader;
