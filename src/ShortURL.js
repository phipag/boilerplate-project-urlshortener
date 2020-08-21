const mongoose = require('mongoose');

const ShortURL = mongoose.model('ShortURL', new mongoose.Schema({
    original_url: { type: String, required: true },
    short_url: { type: Number, required: true, unique: true }
}));

module.exports = ShortURL;
