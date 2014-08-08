/* Global Variables */
var panel = {};
var button = {};
var adState = 'pre_loader'; //pre_loader,panel_intro,panel_one,panel_two_etc...
var ytp_intro = null; //intro YTP instance
var ytpInteriorConfig = [];
var ytpInteriorPlayers = [];
var ytp_interior1; //interior YTP 1 instance
var ytp_interior2;
var firstIntroPlay = true;
var isVideoPlaying = false;

// Some Layout object testing here
var ytpIntroConfig =  {
  'containerId': 'ytp_iframe',
  'videoId': 'ibzGjdcNGXM',
  'videoWidth': 1110,
  'videoHeight': 250,
  'playerVars': {
    'autoplay': 0,
    'controls': 0,
    'rel': 0,
    'showinfo': 0,
    'html5': 1
  }
};

ytpInteriorConfig.push({
  'containerId': 'ytp',
  'videoId': '2HQkugdXyHY',
  'videoWidth': 355,
  'videoHeight': 200,
  'playerVars': {
    'autoplay': 0,
    'controls': 1,
    'rel': 0,
    'showinfo': 0,
    'html5': 1
  }
});

ytpInteriorConfig.push({
  'containerId': 'ytp',
  'videoId': 'vd3dH90tdhk',
  'videoWidth': 355,
  'videoHeight': 200,
  'playerVars': {
    'autoplay': 0,
    'controls': 1,
    'rel': 0,
    'showinfo': 0,
    'html5': 1
  }
});

/////////



// Enabler is initialized, set up polite load for remainder of ad.
var enablerInit = function() {
  console.log('enablerInit');
  if (Enabler.isPageLoaded()) {
    politeInit();
  } else {
    Enabler.addEventListener(studio.events.StudioEvent.PAGE_LOADED, politeInit);
  }
};


// Polite load components.
var politeInit = function() {
  console.log('politeInit ');

  /* TODO: Do we need to polite load anything?
           Add sound and play/pause button to intro video
  */

  // Assign DOM elements
  panel.preload = document.querySelector('#pre_loader');
  panel.intro = document.querySelector('#panel_intro');
  panel.one = document.querySelector('#panel_one');
  button.skip = document.querySelector('#intro_controls .skip');
  button.video1Button = document.querySelector('.select_buttons .video1');
  button.video2Button = document.querySelector('.select_buttons .video2');

  // Events
  attachEvents();

  // TODO: Set up exit tracking and options?
  // TODO: Set up Counters and timers?
  // Naming Structure "Target : Action" ex. Video Intro : Skip


  // TODO: Combine intro and interior YTP creation into one function
  setupIntroYTP();
  setupInteriorYTP(ytpInteriorConfig);
};


// TODO: Set up a Toggle Between ytp_interior1; and ytp_interior2;
//       Create buttons dynamically based on number in ytpInterior array
var attachEvents = function() {
  // Disable default touchmove behaviors to prevent touch scrolling
  document.body.addEventListener('touchmove', function(event) {
    event.preventDefault();
  }, false);

  button.video1Button.addEventListener('click',showVideo1);
  function showVideo1() {
    Enabler.counter('Video 1 : Clicked');

    pauseAllVideos();

    var ytp1 = document.getElementById('ytp').children[0];
    var ytp2 = document.getElementById('ytp').children[1];
    if(ytp1.style.display == 'none') {
      ytp1.style.display = 'block';
      ytp2.style.display = 'none';

      button.video1Button.style.opacity = 1.0;
      button.video2Button.style.opacity = .6;
    }
    return ;
  }

  button.video2Button.addEventListener('click',showVideo2);
  function showVideo2() {
    Enabler.counter('Video 2 : Clicked');

    pauseAllVideos();

    var ytp1 = document.getElementById('ytp').children[0];
    var ytp2 = document.getElementById('ytp').children[1];
    if(ytp2.style.display == 'none') {
      ytp2.style.display = 'block';
      ytp1.style.display = 'none';

      button.video2Button.style.opacity = 1.0;
      button.video1Button.style.opacity = .6;
    }
    return ;
  }

  button.skip.addEventListener('click',skipIntro);
  function skipIntro() {
    Enabler.counter('Video Intro : Skip');

    ytp_intro.pauseVideo();
    transitionToState('panel_one');
    return ;
  }

  var refreshButton = document.getElementsByClassName('refresh_ad');
  refreshButton[0].onclick = refreshAd;
  function refreshAd() {
    Enabler.counter('Button : Replay Intro');

    pauseAllVideos();

    ytp_intro.unMute();
    transitionToState('panel_intro');
    return ;
  }

};


var transitionToState = function(state) {
  adState = state;
  window.console.log("transitionToState: ",adState);

  switch(adState) {

    case "pre_loader":

    break;
    case "panel_intro":
      // TODO: Unmute intro video on replay

      // Hide Pre-Load Section when the Intro Video Starts Playing
      // Keep player hidden until buffer
      panel.intro.style.display = "block";
      panel.preload.style.display = "none";
      panel.one.style.display = "none";
      if(firstIntroPlay) { ytp_intro.mute(); }
      // Need to restart at 0 on replay however seekTo method is not an exposed
      // method in IS component. Using loadVideoById instead of playVideo
      ytp_intro.loadVideoById(ytpIntroConfig['videoId']);

      firstIntroPlay = false;
    break;
    case "panel_one":
      panel.intro.style.display = "none";
      panel.one.style.display = "block";
    break;
  }
};


var setupIntroYTP = function() {

  // Create separate iframe div to hold player so wrapper container not
  // converted to iframe
  var iframe = document.createElement('div');
  iframe.id = 'ytp_iframe';
  document.getElementById('ytp_intro').appendChild(iframe);
  // TODO: link user configurable options to layout Filler objects

  // This function creates an <iframe> YouTube player
  ytp_intro = new studioinnovation.YTPlayer(ytpIntroConfig);
  ytp_intro.name = "ytp_intro";
  // TODO: why are event handlers not always added? May just happen locally?
  ytp_intro.addEventListener('ready', onPlayerReady, false);
  ytp_intro.addEventListener('statechange', onPlayerStateChange, false);
};


var setupInteriorYTP = function(obj) {

  // Dynamically create divs and ytp based on passed in obj parameters
  // This is helpful once we get to layouts we can dynamically create everything
  // And allow users to have 1 video to start with, and add to the array
  /* TODO:
      -Verify events are firing and tracked properly for each player
  */
  for (var i = 0; i < obj.length; i++) {
    console.log('setupInteriorYTP:',obj[i]);

    var ytp_iframe = document.createElement('div');
    ytp_iframe.id = 'ytp'+(i+1)+'_iframe';
    ytp_iframe.setAttribute(
      "style",
      "width:"+obj[i].videoWidth+"px;height:"+obj[i].videoHeight+"px;"+
      "position:absolute;display:none;"
    );
    //ytp_iframe.style.width = obj[i].videoWidth;
    //ytp_iframe.style.height = obj[i].videoHeight;

    document.getElementById('ytp').appendChild(ytp_iframe);

    var player = {
      'containerId': ytp_iframe, // use above created div as ytp iframe
      'videoId': obj[i].videoId,
      'videoWidth': obj[i].videoWidth,
      'videoHeight': obj[i].videoHeight,
      'playerVars': {
        'autoplay': obj[i].playerVars.autoplay,
        'controls': obj[i].playerVars.controls,
        'rel': obj[i].playerVars.rel,
        'showinfo': obj[i].playerVars.showinfo,
        'html5': 1
      }
    };

    // This function turns containerId into an <iframe> YouTube player
    var ytp = new studioinnovation.YTPlayer(player);
    ytp.name = 'ytp_'+(i+1);
    ytpInteriorPlayers.push(ytp);
    ytp.addEventListener('ready', onPlayerReady, false);
    ytp.addEventListener('statechange', onPlayerStateChange, false);
  }

};


var onPlayerReady = function(event) {
  var caller = event.target.name;
  console.log("onPlayerReady:",event.target.name);

  // Control which player fired the event
  switch(caller) {
    case 'ytp_intro':
      window.console.log('YTP Intro READY');
      transitionToState("panel_intro");
    break;
    case 'ytp_1':
      window.console.log('YTP 1 READY');
      // Set first interior YTP to display
      document.getElementById('ytp1_iframe').style.display = 'block';
    break;
    case 'ytp_2':
      window.console.log('YTP 2 READY');
    break;
  }

};

var onPlayerStateChange = function(stateChangeEvent) {
  var playerState = stateChangeEvent.getPlayerState();
  var caller = stateChangeEvent.target.name;
  console.log('onPlayerStateChange:',caller,playerState);

  switch(playerState){
    case studioinnovation.YTPlayer.Events.ENDED:
      //console.log('END');
      isVideoPlaying = false;

      switch(caller) {
        case 'ytp_intro':
          transitionToState('panel_one');
        break;
        case 'ytp_1':
          window.console.log('YTP 1 END');
        break;
        case 'ytp_2':
          window.console.log('YTP 2 END');
        break;
      }

    break;
    case studioinnovation.YTPlayer.Events.PLAYING:
      console.log('PLAYING');
      isVideoPlaying = true;
    break;
    case studioinnovation.YTPlayer.Events.PAUSED:
      //console.log('PAUSED');
      isVideoPlaying = false;
    break;
    case studioinnovation.YTPlayer.Events.BUFFERING:
      //console.log('BUFFERING');
      switch(caller) {
        case 'ytp_intro':
        document.getElementById('ytp_iframe').style.display = 'block';
        break;
      }
    break;
    case  studioinnovation.YTPlayer.Events.CUED:
      //console.log('CUED')
     break;
    case  studioinnovation.YTPlayer.Events.TIMER_START:
      //console.log('TIMER START')
     break;
    case  studioinnovation.YTPlayer.Events.TIMER_STOP:
      //console.log('TIMER END')
     break;
    case  studioinnovation.YTPlayer.Events.MID_POINT:
      //console.log('MIDPOINT')
     break;
  }
};

var pauseAllVideos = function() {
  if(ytp_intro) {
    ytp_intro.pauseVideo();
  }
  if(ytpInteriorPlayers.length > 0) {
    for (var i = 0; i < ytpInteriorPlayers.length; i++) {
      ytpInteriorPlayers[i].pauseVideo();
    }
  }
}


window.onload = function() {
  /* Initialize Enabler */
  if (Enabler.isInitialized()) {
    enablerInit();
  } else {
    Enabler.addEventListener(studio.events.StudioEvent.INIT, enablerInit);
  }
}
