"use strict"
require('dotenv').config({path: './.env.local'});
var lodash = require('lodash');
var SteamApi = require('steamapi');
var steam = new SteamApi(process.env.STEAM_API_KEY);
var devprofile = process.env.DEV_STEAM_URL;

var friendsCache = {};

const coordinator = {
    devprofile,
    fetchUserFriends: function(user, cb) {
        steam.resolve(user).then(uid => {
            if(!friendsCache[uid]) {
                console.log(`caching ${uid} friends`);
                steam.getUserFriends(uid)
                .then(friends => steam.getUserSummary(friends.map(friend => friend.steamID)))
                .then(summaries => {
                    friendsCache[uid] = summaries;
                    cb(friendsCache[uid]);
                });
            } else {
                console.log(`cached ${uid} hit`);
                cb(friendsCache[uid]);
            }
        })
        .catch(err => console.log(err));
    },
    searchForUserFriends: function(user, search, cb) {
        const part = new RegExp(search, "gi");
        this.fetchUserFriends(user, friends => {
            console.log(part)
            const matches = friends.filter(friend => part.test(friend.nickname));
            cb({ friends: matches, count: matches.length })
        });
    },
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
