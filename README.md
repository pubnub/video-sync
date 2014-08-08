# Synchronizing YouTube Videos

## Introduction

VideoSync is an API that synchronizes the playback of embedded YouTube videos across multiples browsers.

### [Live Demo](http://pubnub.github.io/video-sync/)

### [GitHub Repo](https://github.com/pubnub/video-sync)

## Getting Started

VideoSync uses the PubNub Global Realtime Network, so to get started you'll have to
import the PubNub SDK along with [videosync.js](https://github.com/pubnub/video-sync/blob/gh-pages/videosync.js).

    <script src="http://cdn.pubnub.com/pubnub.min.js"></script>
    <script src=./videosync.js></script>
    
Then you have to setup an iframe and embed the YouTube video you want to synchronize. To learn more about the art of embedding YouTube videos, check out Google's official [YouTube API Reference](https://developers.google.com/youtube/iframe_api_reference). The simplest way to embed a YouTube video is to first create a `div` that the player will be inserted in, and then to load the iframe player API code asynchronously. 

    <div id="player"></div>
    
    <script>
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    </script>

After loading the YouTube Iframe player API code, you should initialize VideoSync. When initializing VideoSync you should pass in a `roomId` and a `userId`. The `roomId` should be the same for all the clients you want to sync, and the `userId` should be different for all the clients.

    var videosync = new VideoSync("roomId", "userId");
    
VideoSync has two publicly accessible methods, `onPlayerReady` and `onPlayerStateChange`. `onPlayerReady` should be bound to the YouTube player's `onReady` event, and `onPlayerStateChange` should be bound to the `onStateChange` event of the YouTube API. The YouTube player should be initialized within a globally defined `onYouTubeIframeAPIReady()` function.

    function onYouTubeIframeAPIReady() {
        var player = new YT.player('player', 
            {
                videoId: 'pRIaU172aKM',
                events: {
                    'onReady': videosync.onPlayerReady,
                    'onStateChange': videosync.onPlayerStateChange
                }
            }
        });
    };

After binding these events, you're all set to have a synched YouTube experience.

[Here's](http://jsfiddle.net/lw7360/wU7rs/show/) a JSFiddle that has implemented all the code we have above.

<iframe width="100%" height="250" src="http://jsfiddle.net/lw7360/wU7rs/embedded/result,html" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

## Implementation Details

So how does VideoSync work? If you would rather not dive into the [source](https://github.com/pubnub/video-sync/blob/gh-pages/videosync.js) or even the [annotated source](http://pubnub.github.io/video-sync/docs/annotated-source), I'll give the gist of how it works here.


### The Iframe player API

The [YouTube IFrame player API](https://developers.google.com/youtube/iframe_api_reference) has one event that we particularly care about, the `onStateChange` event. This event fires whenever the iframe player's state changes. All VideoSync has to do is notice when the player's state has changed, then publish the change onto the PubNub channel.

The YouTube player has 6 possible states, which are represented as 6 different integers.

* -1 (unstarted)
* 0 (ended))
* 1 (playing)
* 2 (paused)
* 3 (buffering)
* 5 (video cued)

Of these six, we really only care about state 1 (playing) and state 2 (paused). 

    var onPlayerStateChange = function(event) {
        if (event.data === 1) {
            // The player started playing.
        } else if (event.data === 2) {
            // The player was paused.
        }
    };

You may also have noticed that there's no "seeking" state or event for when a user jumps forward or backwards in a video by dragging the progress bar. Thus, in order to detect seek events, we're going to need to intermittently check the current time of the video and see if the time has jumped forwards or backwards.

    // "player" is the YouTube player.
    var prevTime = player.getCurrentTime():
    var z = setInterval(function() {
        var curTime = player.getCurrentTime();
        if (Math.abs(curTime - prevTime) > 1) {
            // The player has jumped behind or ahead in the video.
        }
        prevTime = curTime;
    }, 500); // Check the progress every 500 milliseconds.
    
Now we can detect when the player plays, pauses, or seeks, so we can synchronize playback across separate YouTube players. All we have to do is publish the event onto PubNub. Then when you receive a message, you can act accordingly.

    // "event" is the type of event that occurred (play, pause, or seek)
    // time is the time of the video when the event occurred.
    var publishState = function(event, time) {
        pubnub.publish({
            channel: "roomId",
            event: event,
            time: time,
        });
    };


## More?

For more examples of what you can do with the PubNub Global Realtime Network, check out the [PubNub Blog](http://www.pubnub.com/blog/).
