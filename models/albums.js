const {Schema, model} = require('mongoose')

const albumSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    previewImg: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    user: {
        ref: 'User',
        type: Schema.Types.ObjectId,
        required: true
    }
})

module.exports = model('Albums', albumSchema)