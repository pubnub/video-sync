// VideoSync is an open source API that let's you synchronize iframe embedded 
// YouTube videos, with the [PubNub Global Realtime Network](http://www.pubnub.com)
//
// You can check out the demo right [here](http://larrywu.com/videosync/), or
// view the source on [Github](https://github.com/lw7360/videosync/)


// Setup
// ---
// videoId is the video id of an embeddable YouTube video.
// userId is an optional variable that will identify individual users of VideoSync.
// roomId is an optional variable that you can set to generate a private channel
// for your watching. If left undefined, VideoSync will connect to the default
// room for the video you're watching. 
function VideoSync(videoId, userId, roomId) {
    // If no userId is provided, generate a simple random one with Math.random.
    if (userId === undefined) {
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

    // The contents of the most recently received message.
    var lastMsg;

    // A helper function that sends properly formatted YouTube messages.
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

    // The function that keeps it all in sync. You dah real mvp.
    var keepSync = function () {
        // [Our link has started.](https://www.youtube.com/watch?v=h7aC-TIkF3I&feature=youtu.be)
        linkStart = true;

        // The initial starting time of the video we're watching.
        var time = player.getCurrentTime();

        // Initializing PubNub with demo keys and our userId.
        pubnub = PUBNUB.init({
            publish_key: 'demo',
            subscribe_key: 'demo',
            uuid: userId
        });

        // Subscribing to our channel.
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

        // Intermittently check whether the video player has jumped ahead or
        // behind further than we expected. This has to be done since the
        // YouTube video player has no "seek" event.
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

    // Public Methods
    // ---
    return {
        // Should be bound to the YouTube player `onReady` event.
        onPlayerReady: function (event) {
            player = event.target;
            event.target.playVideo();
            event.target.pauseVideo();
            keepSync();
        },
        // Should be bound to the YouTube player `onStateChange` event.
        onPlayerStateChange: function (event) {
            if (linkStart) {
                // Pause event.
                if (event.data === 2) {
                    pub("pause", player.getCurrentTime());
                }
                // Play event.
                else if (event.data === 1) {
                    pub("play", null);
                } 
                // Stop event.
                else if (event.data === 0) {
                    pub("stop", player.getCurrentTime());
                }
            }
        }
    };
}