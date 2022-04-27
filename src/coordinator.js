"use strict"
//require('dotenv').config({path: './.env.local'});
var { intersection, uniq } = require('lodash');
var SteamApi = require('steamapi');
//var steam = new SteamApi(process.env.STEAM_API_KEY);
var devprofile = process.env.DEV_STEAM_URL;

var friendsCache = {};
//const defaultCallback = (...args) => console.log(args);

class LibraryCoordinator {
    /**
     * @param {string} apiKey
     */
    constructor(apiKey) {
        this.key = apiKey;
        this.steam = new SteamApi(this.key);
    }
    /**
     * @param {resolvable[]} users
     */
    getIntersectingGames(users) {
        const allMutualGameIds = libraries => intersection(libraries.map(library => library.map(game => game.appID)));
        return this.getUserIds(users).then(ids => Promise.all(ids.map(id => this.steam.getUserOwnedGames(id)))).then(libraries => allMutualGameIds(libraries))
    }
    getUserId(user) {
        return this.steam.resolve(user);
    }
    /**
     * @param {resolvable[]} users
     */
    getUserIds(users) {
        return Promise.all(users.map(user => this.steam.resolve(user)));
    }
    /**
     * @param {resolvable} user
     */
    fetchUserFriends(user) {
        return this.getUserId(user).then(id => this.steam.getUserFriends(id));
    }
    /**
     * @param {resolvable} user
     */
    fetchUserFriendIds(user) {
        return this.fetchUserFriends(user)
                .then(friends => this.fetchUserSummaries(friends))
                .then(summaries => summaries.map(summary => summary.steamID));
    }
    /**
     * @param {resolvable[]} users
     */
    fetchUserSummaries(users) {
        return this.getUserIds(users).then(ids => this.steam.getUserSummary(ids))
    }
    /**
     * @param {resolvable} user
     */
    fetchUserSummary(user) {
        const isArr = user instanceof Array
        return this.fetchUserSummaries(isArr ? user : [user])
    }
}

const coordinator = {
    devprofile,
    getUserId: function(user, cb) {
        steam.resolve(user).then(cb);
    },
    getUserIds: function(users, cb) {
        Promise.all(users.map(user => steam.resolve(user))).then(cb);
    },
    fetchUserFriends: function(user, cb, nocache=false) {
        steam.resolve(user).then(uid => {
            if(!nocache) {
                if (!friendsCache[uid]) {
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
            } else {
                console.log(`nocache ${uid} hit`)
                steam.getUserFriends(uid).then(friends => steam.getUserSummary(friends.map(friend => friend.steamID)))
                .then(summaries => cb(summaries))
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
    clearUserFriendsCache: function(cb) {
        friendsCache = {};
        cb(Object.keys(friendsCache).length);
    },
    getIntersectingGames: function(users, cb) {
        Promise.all(users.map(user => steam.resolve(user).then(uid => steam.getUserOwnedGames(uid))))
        .then(libraries => {
            const librariesAsIds = libraries.map(lib => lib.map(game => game.appID));
            const allMutualGameIds = intersection(...librariesAsIds);
            const allMutualGameTitles = uniq(
                libraries.flat().filter(game => allMutualGameIds.includes(game.appID)).map(game => game.name)
            )
            cb({ titles: allMutualGameTitles, ids: allMutualGameIds });
        }).catch(err => console.log(err))
    }
}

module.exports = coordinator;
