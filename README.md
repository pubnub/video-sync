# Synchronized YouTube Vides

## Introduction

Video Sync is an API that makes it easy to synchronize playback for embeddable YouTube videos.

### [Live Demo](http://larrywu.com/videosync/)

## Getting Started

Import the PubNub SDK and videosync.js.

    <script src=http://cdn.pubnub.com/pubnub.min.js ></script>
    <script src=./videosync.js></script>
    
Then, use an iframe to embed the YouTube video you want to synchronize. The [YouTube API Reference](https://developers.google.com/youtube/iframe_api_reference) is a great place to learn how to do this. 

    <div id="player"></div>
    
    <script>
      var tag = document.createElement('script');
      
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      
      var player;
      function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
          height: '390',
          width: '640',
          videoId: 'M7lc1UVf-VE',
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      }
      
      
      