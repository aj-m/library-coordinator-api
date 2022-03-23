require('dotenv').config({path: './.env.local'});
const express = require('express');
const base62 = require('base62str').default.createInstance();
var coordinator = require('./coordinator');
const app = express();
const port = process.env.PORT;

app.use((req, res, next) => {
    console.log(`[${new Date().toUTCString()}] Handling ${req.method} '${req.originalUrl}'`)
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.get('/users/:enc/:user/id', (req, res) => {
    const { user, enc } = req.params;
    const target = enc ? base62.decodeStr(user) : user;
    coordinator.getUserId(target, result => {
        res.status(200).json({ id: result }).send();
    })
});

app.get('/users/:id/friends/find/:part', (req, res) => {
    const { id, part } = req.params;
    coordinator.searchForUserFriends(id, part, results => {
        res.status(200).json(results).send();
    })
});

app.get('/users/:id/friends/:friends/games/mutual', (req, res) => {

});

app.use((_, res) => {
    res.status(404).send().end();
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send().end();
});

app.listen(port, () => {
    console.log(`server listening on ${port}`);
});