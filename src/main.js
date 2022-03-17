"use strict";
var coordinator = require('./coordinator');

const { devprofile } = coordinator;
const users = [
    // valve employee ids for dummy data, using these will error out with no games found
    "steamcommunity.com/id/robinwalker",
    "steamcommunity.com/profiles/76561197975914763"
];

//coordinator.getIntersectingGames(users, console.log);
coordinator.getIntersectingGames([devprofile], console.log);
//coordinator.searchForUserFriends(devprofile, 'fr', console.log);
coordinator.fetchUserFriends(devprofile, friends => {
    console.log(friends.map(friend => friend.nickname).filter(nick => /dog/gi.test(nick)))
});

/*
setTimeout(() => {
    coordinator.fetchUserFriends(devprofile, friends => {
        console.log(friends.map(friend => friend.nickname))
    })
}, 10000)
*/
