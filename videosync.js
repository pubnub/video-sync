// VideoSync

// 
function VideoSync(videoId, userId, roomId) {
    if (userId == undefined) {
        userId = Math.random().toString();
    }
    var player;
    var pubnub;
    var channelId = videoId + roomId + "noob";
    var linkStart = false;

    var startSync = function() {
        var requested = false;

        pubnub = PUBNUB.init({
            publish_key: 'demo',
            subscribe_key: 'demo',
            uuid: userId
        });

        var onMessage = function(m) {
            if (m.recipient === userId && m.type === "updateResponse") {
                initTime(m.time);
            }
        };
        var onPresence = function(m) {
            if (m.occupancy <= 1) {
                initTime(0);
            }
            else if (!requested) {
                requested = true;
                pubnub.here_now({
                    channel: channelId,
                    callback: function(m) {

                        for (var i=0; i<m.uuids.length; i++) {
                            var recipient = m.uuids[i];
                            pubnub.publish({
                                channel: channelId,
                                message: {
                                    recipient: recipient,
                                    sender: userId,
                                    type: "updateRequest"
                                }
                            });
                        }
                        setTimeout(function() {initTime(0)}, 000);
                    }
                });
            }
        };

        pubnub.subscribe({
            channel: channelId,
            callback: function(m){onMessage(m)},
            presence: function(m){onPresence(m)},
            heartbeat: 10
        });
    };

        var initTime = function(time) {
            player.seekTo(time, true);
            keepSync();
        };

        var pub = function(action, time) {
            pubnub.publish({
                channel: channelId,
                message: {
                    recipient: "",
                    sender: userId,
                    type: action,
                    time: time
                }
            });
        };

        var lastAction;

        var keepSync = function() {
            linkStart = true;
            var time = player.getCurrentTime();

            pubnub.subscribe({
                channel: channelId,
                callback: function(m) {
                    if ((m.recipient === userId || m.recipient === "") && m.sender !== userId) {
                        if (m.type === "updateRequest") {
                            var curState = player.getPlayerState();
                            var curTime = player.getCurrentTime();
                            pubnub.publish({
                                channel: channelId,
                                message: {
                                    type: "updateResponse",
                                    time: curTime,
                                    recipient: m.sender
                                }
                            });
                        }
                        else if (m.type === "pause") {
                            player.seekTo(m.time, true);
                            time = m.time;
                            player.pauseVideo();
                        }
                        else if (m.type === "play") {
                            if (m.time !== null) {
                                player.seekTo(m.time, true);
                            }
                            player.playVideo();
                        }
                        else if (m.type === "stop") {
                            player.stopVideo();
                        }
                    }
                },
                presence: function(m) {}
            });
            var z = setInterval(function() {
                var curTime = player.getCurrentTime();
                var curState = player.getPlayerState();
                if (Math.abs(curTime - time) > 1) {
                    if (curState === 2) {
                        pub("pause", curTime);
                        player.pauseVideo();
                    }
                    else if (curState === 1) {
                        player.pauseVideo();
                    }
                }
                time = curTime;
            }, 500);
        };


    return {
        onPlayerReady: function(event) {
            player = event.target
            event.target.playVideo();
            event.target.pauseVideo();
            startSync();
        },
        onPlayerStateChange: function(event) {
            if (linkStart) {
                if (event.data === 2) { // pause
                    pub("pause", player.getCurrentTime());
                } else if (event.data === 1) { // play
                    pub("play", null);
                } else if (event.data === 0) { // stop
                    pub("stop", player.getCurrentTime());;
                }
            }
        }
    }
}