// VideoSync is an API that synchronizes the playback of embedded 
// YouTube videos across multiples browsers.
// 
// You can check out the demo right [here](http://larrywu.com/videosync/), or
// view the source on [Github](https://github.com/lw7360/videosync/)


// Setup
// ---
// roomId is the name of the channel you want to use.
// userId is an optional variable that will identify individual users of VideoSync.
function VideoSync(roomId, userId) {
    // If no userId is provided, generate a simple random one with Math.random.
    if (userId === undefined) {
        userId = Math.random().toString();
    }

    // A variable that will be set to the YouTube player object.
    var player;

    // Initializing PubNub with demo keys and our userId.
    var pubnub = new PubNub({
        publishKey: 'pub-c-242fbbf1-4cc6-4153-8f20-a671697f15ec',
        subscribeKey: 'sub-c-2361676c-1e85-11e4-bbbf-02ee2ddab7fe',
        uuid: userId
    });

    // Whether the connection to the channel has been established yet.
    var linkStart = false;

    // The contents of the most recently received message.
    var lastMsg;

    // A helper function that publishes state-change messages.
    var pub = function (type, time) {
        if (lastMsg !== "" + type + time) {
            pubnub.publish({
                channel: roomId,
                message: {
                    recipient: "",
                    sender: userId,
                    type: type,
                    time: time,
                }
            });
        }
    };

    // The function that keeps the video in sync.
    var keepSync = function () {
        // [Link Start!](https://www.youtube.com/watch?v=h7aC-TIkF3I&feature=youtu.be)
        linkStart = true;

        // The initial starting time of the current video.
        var time = player.getCurrentTime();

        // Subscribing to our PubNub channel.
        pubnub.addListener({
            message: function (mes) {
                var m = mes.message;
                lastMsg = m.recipient + m.type + m.time;
                if ((m.recipient === userId || m.recipient === "") && m.sender !== userId) {
                    if (m.type === "updateRequest") {
                        var curState = player.getPlayerState();
                        var curTime = player.getCurrentTime();
                        pubnub.publish({
                            channel: roomId,
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
                    }
                }
            }
        });
        pubnub.subscribe({channels:[roomId]});

        // Intermittently checks whether the video player has jumped ahead or
        // behind the current time.
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
                // Play event.
                if (event.data === 1) {
                    pub("play", null);
                }
                // Pause event.
                else if (event.data === 2) {
                    pub("pause", player.getCurrentTime());
                }
            }
        }
    };
}
