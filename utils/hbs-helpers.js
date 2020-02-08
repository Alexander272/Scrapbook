const cyrillicToTranslit = require('cyrillic-to-translit-js')

module.exports = {
    ifeq(a, b, options) {
        if (a == b) {
            return options.fn(this)
        }
        return options.inverse(this)
    },
    translit(string) {
        return cyrillicToTranslit().transform(string.toLowerCase())
    }
}