/* Global Variables */
var panel = {};
var button = {};
var adState = 'pre_loader'; //pre_loader,panel_intro,panel_one,panel_two_etc...
var ytp_intro = null; //intro YTP instance
var introConfig = {}; //intro config object
var ytpInteriorConfig = [];
var ytpInteriorPlayers = [];
var ytp_interior1 = null; //interior YTP 1 instance
var ytp_interior2 = null;
var firstIntroPlay = true;
var videoState = {};


// LAYOUTS
// Configurable API.
/* TODO:
    - Finalize Filler class structure
    - Hook up Filler values to actual components
    -
*/
var configurable,
    config,
    root,
    binding;

studio.utils.EnablerAccessor.loadModuleWhenReady(
    studio.module.ModuleId.CONFIGURABLE_FILLER, loadModuleHandler);

function loadModuleHandler() {
  window.console.log('loadModuleHandler');
  configurable = studio.sdk.configurable;
  config = configurable.config;
  binding = configurable.binding;

  config.declare('MovieTickets', {
    'movieticketsUrl': {
      '@type': 'string'
    },
    'movieticketsIcon': {
      '@type': 'image'
    }
  });

  config.declare('Fandango', {
    'fandangoUrl': {
      '@type': 'string'
    },
    'fandangoIcon': {
      '@type': 'image'
    }
  });

  config.declare('Ticketing', {
    'ctaImage': {
      '@type': 'image'
    },
    'xPos': {
      '@type': 'double'
    },
    'yPos': {
      '@type': 'double'
    },
    'fandango': {
      '@type': 'Fandango',
      '@required': false
    },
    'movieTickets': {
      '@type': 'MovieTickets',
      '@required': false
    }
  });

  config.declare('YouTubeCloseButton', {
    'language': {
      '@type': 'string'
    },
    'shadow': {
      '@type': 'boolean'
    },
    'theme': {
      '@type': 'string',
      '@required': false
    }
  });

  config.declare('PlayerProperties', {
    'xPos': {
      '@type': 'double'
    },
    'yPos': {
      '@type': 'double'
    },
    'width': {
      '@type': 'double'
    },
    'height': {
      '@type': 'double'
    },
    'autoplay': {
      '@type': 'boolean'
    },
    'muted': {
      '@type': 'boolean'
    },
    'controls': {
      '@type': 'boolean'
    }
  });

  config.declare('YouTubePlayer', {
    'videoId': {
      '@type': 'string'
    },
    'playerProperties': {
      '@type': 'PlayerProperties'
    }
  });

  config.declare('VideoPlayer', {
    'playerType': {
      '@type': 'YouTubePlayer'
    }
  });

  // Declare main configuration.
  config.declare('Main', {
    'closeButton': {
      '@type': 'YouTubeCloseButton'
    },
    'introVideo': {
      '@type': 'VideoPlayer'
    },
    'ticketing': {
      '@type': 'Ticketing',
      '@required': false
    }
  });

  // Default Test Values
  var testValues =  {
    'closeButton': {
      'language': 'en',
      'shadow': true,
      'theme': 'black'
    },
    'introVideo': {
      'playerType': {
        'videoId': 'ibzGjdcNGXM', //ibzGjdcNGXM, 2HQkugdXyHY, vd3dH90tdhk
        'playerProperties': {
          'xPos': 0,
          'yPos': 0,
          'width': 1110,
          'height': 250,
          'autoplay': true,
          'muted': true,
          'controls': false
        }
      }
    },
    'ticketing': {
      'ctaImage': 'gettickets.png',
      'xPos': 0,
      'yPos': 0,
      'fandango': {
        'fandangoUrl': "http://fandango.com/",
        'fandangoIcon': "fandangoIcon.png"
      },
      'movieTickets': {
        'movieticketsUrl': "http://movietickets.com/",
        'movieticketsIcon': "movieticketsIcon.png"
      }
    }
  };



  // Instantiate.
  var configuration = config.instantiate('Main', testValues);

  // Register.
  configurable.register(configuration, registerHandler);
}


function registerHandler(object) {
  root = object;
  console.log(root);
  window.console.log('registerHandler');
  window.console.log('Config runtime mode: '+configurable.getRuntimeMode());

  // Assign DOM elements
  panel.preload = document.querySelector('#pre_loader');
  panel.intro = document.querySelector('#panel_intro');
  panel.one = document.querySelector('#panel_one');
  button.introSet = document.querySelector('#intro_controls');
  button.skip = document.querySelector('#intro_controls .skip');
  button.introPlayToggle = document.querySelector('#intro_controls .playToggle');
  button.introVolumeToggle = document.querySelector('#intro_controls .volumeToggle');
  button.video1Button = document.querySelector('.select_buttons .video1');
  button.video2Button = document.querySelector('.select_buttons .video2');

  // Display local filler. Don't upload to Studio as is!!!
  // DEVELOPMENT - local testing
  // FILLER - uploaded to studio and filler view is visible
  // PLAY - in studio clicking play button which hides filler view
  // TRAFFICK - trafficked and live??
  if(configurable.Filler &&
     configurable.getRuntimeMode() == configurable.RUNTIME_MODE.DEVELOPMENT) {
    window.console.log('local developer mode!');

    // @PF - kill local filler, is buggy
    // var div = document.createElement('div');
    // div.id = 'filler';
    // window.parent.document.body.appendChild(div);
    // configurable.Filler.display(div, object);

  }else {
    window.console.log('I am in studio!');
  }

  // any changes on object trigger this
  binding.addValueChangeListener(root, valueChangeListener);
  // any changes on foo trigger this
  binding.addValueChangeListener(root['closeButton'], ytCloseBtnListener);
  // Listen for changes on intro videoId
  binding.addPropertyChangeListener(root['introVideo'], 'videoId', ytIdChange);

  // create initial close button based on Filler defaults
  setupCloseBtn(root['closeButton']);
  setupIntroYTP(root['introVideo']);
  attachEvents();
}

function valueChangeListener(value) {
  console.log('valueChangeListener', value);

}

function ytCloseBtnListener(value) {
  console.log('ytCloseBtnListener', value);
  setupCloseBtn(root['closeButton']);
}

/**
 * Updates the YouTube Intro Play with the new Filler value and calls
 * loadVideoById to immediately load and playback the new video
 * TODO (pfeneht): load from Filler object, not temp ytpIntroConfig
 */
function ytIdChange(value) {
  console.log('ytIdChange', value);
  ytp_intro.loadVideoById(value);
}


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

  button.introPlayToggle.addEventListener('click',introPlayToggle);
  function introPlayToggle() {
    if(videoState.intro.playing) {
      Enabler.counter('Video Intro : Pause');
      ytp_intro.pauseVideo();
    } else {
      Enabler.counter('Video Intro : Play');
      ytp_intro.playVideo();
    }

    return ;
  }

  button.introVolumeToggle.addEventListener('click',introVolumeToggle);
  function introVolumeToggle() {
    if(!videoState.intro.muted) {
      Enabler.counter('Video Intro : Mute');
      ytp_intro.mute();
      videoState.intro.muted = true;
    } else {
      Enabler.counter('Video Intro : UnMute');
      ytp_intro.unMute();
      videoState.intro.muted = false;
    }

    return ;
  }


  var refreshButton = document.getElementsByClassName('refresh_ad');
  refreshButton[0].onclick = refreshAd;
  function refreshAd() {
    Enabler.counter('Button : Replay Intro');

    pauseAllVideos();
    ytp_intro.unMute();
    videoState.intro.muted = false;
    transitionToState('panel_intro');
    return ;
  }

};


/*
<ci-ytclosebutton lang="en" theme="black" shadow="true" id="ytClose_dc"/></ci>
*/
var setupCloseBtn = function(e) {
  window.console.log('setupCloseBtn: '+e.theme);
  var closeElement = document.querySelector('#ytClose_dc');
  if(closeElement) {
    document.querySelector('#ad_container').removeChild(closeElement);
  }
  closeElement = document.createElement('ci-ytclosebutton');
  closeElement.id = 'ytClose_dc';
  closeElement.lang = e.language;
  closeElement.theme = e.theme;
  closeElement.shadow = e.shadow;
  closeElement.style.display = 'block';
  document.querySelector('#ad_container').appendChild(closeElement);
}


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
      button.introSet.style.display = 'none';
      panel.intro.style.display = "block";
      panel.preload.style.display = "none";
      panel.one.style.display = "none";
      if(firstIntroPlay) {
        ytp_intro.mute();
        videoState.intro.muted = true;
      }
      // Need to restart at 0 on replay however seekTo method is not an exposed
      // method in IS component. Using loadVideoById instead of playVideo
      ytp_intro.loadVideoById(introConfig.videoId);
      firstIntroPlay = false;
    break;
    case "panel_one":
      panel.intro.style.display = "none";
      panel.one.style.display = "block";
    break;
  }
};


var setupIntroYTP = function(config) {
  window.console.log(config);
  var obj = config.playerType;

  videoState.intro = {};
  //TODO (pfeneht) - When setup in closure properly we won't have to use
  // global variable bs.
  introConfig.videoId = obj.videoId;

  var playerConfig = {
    'containerId': 'ytp_iframe', // use above created div as ytp iframe
    'videoId': obj.videoId,
    'videoWidth': obj.playerProperties.width,
    'videoHeight': obj.playerProperties.height,
    'playerVars': {
      'autoplay': 1,
      'controls': 0,
      'rel': 0,
      'showinfo': 0,
      'html5': 1
    }
  };

  // Create separate iframe div to hold player so wrapper container not
  // converted to iframe
  var iframe = document.createElement('div');
  iframe.id = 'ytp_iframe';
  document.getElementById('ytp_intro').appendChild(iframe);
  // This function creates an <iframe> YouTube player
  ytp_intro = new studioinnovation.YTPlayer(playerConfig);
  console.log(ytp_intro);
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

      switch(caller) {
        case 'ytp_intro':
          videoState.intro.playing = false;
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
    case studioinnovation.YTPlayer.Events.PLAYING: // Not fired on loadVideoById
      console.log('PLAYING');
      switch(caller) {
        case 'ytp_intro':
          videoState.intro.playing = true;
          console.log("videoState.intro.playing: "+videoState.intro.playing);
        break;
      }
    break;
    case studioinnovation.YTPlayer.Events.PAUSED:
      switch(caller) {
        case 'ytp_intro':
          videoState.intro.playing = false;
          console.log("videoState.intro.playing: "+videoState.intro.playing);
        break;
      }
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
      switch(caller) {
        case 'ytp_intro':
          //show controls on play
          button.introSet.style.display = 'block';
          videoState.intro.playing = true; // make sure playing state set properly
        break;
      }
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
