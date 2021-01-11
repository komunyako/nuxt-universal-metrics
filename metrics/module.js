import path from 'path';

export default function(moduleOptions) {
    this.addPlugin({
        src: path.resolve(__dirname, './plugin.js'),
        mode: 'client',
        options: {
            ...moduleOptions,
            ...this.options.metrics
        }
    });
}
