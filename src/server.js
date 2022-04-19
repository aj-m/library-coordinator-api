"use strict";
//require('dotenv').config({path: './.env.local'});
const express = require('express');
//const base62 = require('base62str').default.createInstance();
var coordinator = require('./coordinator');
const app = express();
const port = process.env.PORT || 3000;

function decodeString(input) {
    return Buffer.from(decodeURIComponent(input), 'base64').toString('utf8');
}
function encodeString(input) {
    return encodeURIComponent(Buffer.from(input).toString('base64'));
}
function decodeArray(encoded) {
    return JSON.parse(decodeString(encoded));
}
function encodeArray(arr) {
    return encodeString(JSON.stringify(arr))
}

app.use((req, res, next) => {
    console.log(`[${new Date().toUTCString()}] Handling ${req.method} '${req.originalUrl}'`)
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.get('/intersecting/:users', (req, res) => {
    const resolvables = decodeArray(req.params.users);
    coordinator.getUserIds(resolvables)
    .then(coordinator.getIntersectingGames)
    .then(res.status(200).json)
    .catch(res.status(500).send);
})

app.get('/users/:enc/:user/id', (req, res) => {
    const { user, enc } = req.params;
    //const target = enc ? base62.decodeStr(user) : user;
    const target = +enc ? decodeString(user) : decodeURIComponent(user);
    console.log(target);
    coordinator.getUserId(target, result => {
        res.status(200).json({ id: result }).send();
    })
});

app.get('/users/:id/friends/find/:part', (req, res) => {
    const { id, part } = req.params;
//    console.log('id: ', id)
//    console.log('part: ', part)
    coordinator.searchForUserFriends(id, part, results => {
        res.status(200).json(results).send();
    })
});

/*
app.get('/users/:id/friends/:friends/games/mutual', (req, res) => {

});
*/
/*
app.get('/', (req, res) => {
    res.send('Hello, world!');
})
*/

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