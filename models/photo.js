const {Schema, model} = require('mongoose')

const photoSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    imageSrc: {
        type: String,
        required: true
    },
    albumId: {
        ref: 'Albums',
        type: Schema.Types.ObjectId,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = model('Photo', photoSchema)