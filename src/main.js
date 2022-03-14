"use strict";
var coordinator = require('./coordinator');

const users = [
    // valve employee ids for dummy data, using these will error out with no games found
    "steamcommunity.com/id/robinwalker",
    "steamcommunity.com/profiles/76561197975914763"
];

coordinator.getIntersectingGames(users, console.log);
