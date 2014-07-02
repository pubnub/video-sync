// VideoSync is an open source API that let's you synchronize iframe embedded 
// YouTube videos, with the [PubNub Global Realtime Network](http://www.pubnub.com)
//
// You can check out the demo right [here](http://larrywu.com/videosync/), or
// view the source on [Github](https://github.com/lw7360/videosync/)
// Setup
// ---
function VideoSync(videoId, userId, roomId) {
    // If no userId is provided, generate a simple random one with Math.random.
    if (userId == undefined) {
        userId = Math.random().toString();
    }

    // A variable that will be set to the YouTube player object.
    var player;

    // PubNub
    var pubnub;

    // The channel that will be subscribed to in PubNub. 
    var channelId = videoId + roomId;

    // Whether the connection to the channel has been established yet.
    var linkStart = false;

    var lastMsg;

    var pub = function (type, time) {
        if (lastMsg !== "" + type + time) {

            pubnub.publish({
                channel: channelId,
                message: {
                    recipient: "",
                    sender: userId,
                    type: type,
                    time: time,
                }
            });
        }
    };


    var keepSync = function () {
        linkStart = true;
        var time = player.getCurrentTime();

        pubnub = PUBNUB.init({
            publish_key: 'demo',
            subscribe_key: 'demo',
            uuid: userId
        });

        pubnub.subscribe({
            channel: channelId,
            callback: function (m) {
                lastMsg = m.recipient + m.type + m.time;
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
                    } else if (m.type === "pause") {
                        player.seekTo(m.time, true);
                        time = m.time;
                        player.pauseVideo();
                    } else if (m.type === "play") {
                        if (m.time !== null) {
                            player.seekTo(m.time, true);
                        }
                        player.playVideo();
                    } else if (m.type === "stop") {
                        player.stopVideo();
                    }
                }
            },
            presence: function (m) {}
        });
        var z = setInterval(function () {
            var curTime = player.getCurrentTime();
            var curState = player.getPlayerState();
            if (Math.abs(curTime - time) > 1) {
                if (curState === 2) {
                    pub("pause", curTime);
                    player.pauseVideo();
                } else if (curState === 1) {
                    player.pauseVideo();
                }
            }
            time = curTime;
        }, 500);
    };


    return {
        onPlayerReady: function (event) {
            player = event.target
            event.target.playVideo();
            event.target.pauseVideo();
            keepSync();
        },
        onPlayerStateChange: function (event) {
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