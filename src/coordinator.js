"use strict"
require('dotenv').config({path: './.env.local'});
var lodash = require('lodash');
var SteamApi = require('steamapi');
var steam = new SteamApi(process.env.STEAM_API_KEY);

const coordinator = {
    getIntersectingGames: function(users, cb) {
        Promise.all(users.map(user => steam.resolve(user).then(uid => steam.getUserOwnedGames(uid))))
        .then(libraries => {
            const librariesAsIds = libraries.map(lib => lib.map(game => game.appID));
            const allMutualGameIds = lodash.intersection(...librariesAsIds);
            const allMutualGameTitles = lodash.uniq(
                libraries.flat().filter(game => allMutualGameIds.includes(game.appID)).map(game => game.name)
            )
            cb({ titles: allMutualGameTitles, ids: allMutualGameIds });
        }).catch(err => console.log(err))
    }
}

module.exports = coordinator;
