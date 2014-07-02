# Synchronized YouTube Videos

## Introduction

VideoSync is an API that makes it easy to synchronize playback for embeddable YouTube videos. Play, pause, and seek in synch across multiple YouTube players.

### [Live Demo](http://larrywu.com/videosync/)

## Getting Started

Import the PubNub SDK and videosync.js.

    <script src="http://cdn.pubnub.com/pubnub.min.js"></script>
    <script src=./videosync.js></script>
    
Then, use an iframe to embed the YouTube video you want to synchronize. To learn more about the art of embedding YouTube videos, check out Google's official [YouTube API Reference](https://developers.google.com/youtube/iframe_api_reference). Essentially, all you need to do is create a div for the player to go. Then, you can load the IFrame player API code asynchronously. 

    <div id="player"></div>
    
    <script>
      var tag = document.createElement('script');
      
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    </script>

After loading the YouTube Iframe player API code, you should initialize VideoSync. When you do so you'll need the id of a YouTube video you want to play.

    var videosync = new VideoSync("pRIaU172aKM"); // https://www.youtube.com/watch?v=[VIDEO_ID]
    
VideoSync has two publicly accessible methods, `onPlayerReady` and `onPlayerStateChange`. `onPlayerReady` should be bound to the YouTube player `onReady` event, and `onPlayerStateChange` should be bound to the `onStateChange` event. 

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
    
After binding these events, you're all set to have a synched up YouTube experience.

Here's a JSFiddle that has implemented the code we have above.

<iframe width="100%" height="250" src="http://jsfiddle.net/lw7360/wU7rs/embedded/result,html" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

## Implementation Details

So how does VideoSync work?