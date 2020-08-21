'use strict';

const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const dns = require('dns');
const url = require('url');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// Just for trying out 'module.exports'
const ShortURL = require('./src/ShortURL');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const cors = require('cors');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

/** this project needs a db !! **/
// mongoose.connect(process.env.DB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl/new', (req, res) => {
    let original_url = req.body.url;
    try {
        original_url = new URL(original_url);
        return dns.lookup(original_url.hostname, (err) => {
            if (err) return res.send({ error: 'invalid URL' });

            ShortURL
                .findOne()
                .sort({ created_at: -1 })
                .exec((err, shortURL) => {
                    if (err) return res.send({ error: 'invalid URL' });
                    const lastId = !!shortURL ? shortURL.short_url : 0;
                    const newShortURL = new ShortURL({ original_url, short_url: lastId + 1 });
                    return newShortURL.save((err, newShortURL) => {
                        if (err) return res.send({ error: 'invalid URL' });
                        return res.json(newShortURL);
                    }, { new: true });
                });
        });
    } catch (e) {
        console.error(e.message);
        return res.send({ error: 'invalid URL' });
    }
});

app.get('/api/shorturl/:id', (req, res) => {
    const { id } = req.params;
    if (parseInt(id, 10) == id) {
        return ShortURL.findOne({ short_url: id }, (err, shortURL) => {
            if (err) return res.json({ error: 'invalid short URL' });
            if (!shortURL) {
                return res.json({ error: 'Short URL not found.' });
            }
            return res.redirect(shortURL.original_url);
        });
    }
    return res.json({ error: 'invalid short URL' });
});

app.listen(port, function () {
    console.log('Node.js listening ...');
});
