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

  config.declare('VideoIDArray', {
    'videoID': {
      '@type': 'string',
      '@value': '2HQkugdXyHY'
    }
  });

  config.declare('InteriorYTP', {
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
      'theme': {
        '@type': 'string'
      },
      'videoIDs': {
        '@type': 'VideoIDArray',
        '@array': true
      }
  });

  config.declare('IntroYTP', {
    'videoID': {
      '@type': 'string'
    }
  });

  // Declare main configuration.
  config.declare('Main', {
    'closeButton': {
      '@type': 'YouTubeCloseButton'
    },
    'introYTP': {
      '@type': 'IntroYTP'
    },
    'interiorYTP': {
      '@type': 'InteriorYTP'
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
    'introYTP': {
      'videoID': 'ibzGjdcNGXM' //ibzGjdcNGXM, 2HQkugdXyHY, vd3dH90tdhk
    },
    'interiorYTP': {
      'xPos': 700,
      'yPos': 50,
      'width': 355,
      'height': 200,
      'theme': 'dark',
      'videoIDs': {
        /**
         * TODO (pfeneht) - how do you add default filler array items via code?
         */
        'videoID': '2HQkugdXyHY' //ibzGjdcNGXM, 2HQkugdXyHY, vd3dH90tdhk
      }
    },
    'ticketing': {
      'ctaImage': 'gettickets.png',
      'xPos': 10,
      'yPos': 10,
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
  button.refresh = document.querySelector('#panel_one .refresh_ad');
  button.interior = document.querySelector('.select_buttons');

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
  binding.addPropertyChangeListener(root['introYTP'], 'videoID', ytIdChange);

  binding.addArrayInsertListener(root['interiorYTP'],
    'videoIDs', addInteriorYTP
  );

  binding.addArrayRemoveListener(root['interiorYTP'],
    'videoIDs',
    function(newValue, newIndex, imagesArray) {
      console.log('removeInteriorYTP', imagesArray);
      binding.removePropertyChangeListener(imagesArray[newIndex],
        'videoID',
        ytInteriorChange);
      }
  );

  // Setup UI
  setupCloseBtn(root['closeButton']);
  setupIntroYTP(root['introYTP']);
  //setupInteriorYTP(root['interiorYTP']);
  attachEvents("register");
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
 * loadVideoById to immediately load and playback the new video ID
 * TODO (pfeneht): change introConfig.videoId to local var once closure
 *   has been setup properly.
 */
function ytIdChange(value) {
  console.log('ytIdChange', value);
  introConfig.videoId = value;
  if(adState == 'panel_intro') {
    ytp_intro.loadVideoById(value);
  }
}


function InteriorYTPListener(config) {
  console.log('InteriorYTPListener', config);

}

function ytInteriorChange(value) {
  console.log('ytInteriorChange', value);

}


var attachEvents = function(adState) {


  window.console.log("transitionToState: ",adState);

  switch(adState) {

    case "pre_loader":

    break;
    case "panel_intro":
      button.skip.addEventListener('click', function() {
        Enabler.counter('Video Intro : Skip');

        ytp_intro.pauseVideo();
        transitionToState('panel_one');
        return ;
      });

      button.introPlayToggle.addEventListener('click', function() {
        if(videoState.intro.playing) {
          Enabler.counter('Video Intro : Pause');
          ytp_intro.pauseVideo();
        } else {
          Enabler.counter('Video Intro : Play');
          ytp_intro.playVideo();
        }
        return ;
      });

      button.introVolumeToggle.addEventListener('click',function() {
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
      });
    break;
    case "panel_one":
      button.refresh.addEventListener('click',function() {
        Enabler.counter('Button : Replay Intro');

        pauseAllVideos();
        ytp_intro.unMute();
        videoState.intro.muted = false;
        transitionToState('panel_intro');
        return ;
      });
    break;
    case "register":
      console.log('attachEvents: ','default case');
      // Disable default touchmove behaviors to prevent touch scrolling
      document.body.addEventListener('touchmove', function(event) {
        event.preventDefault();
      }, false);
    break;
    default:

    break;
  }

  /**
   * TODO (pfeneht) - Set up loop depending on how many interior videos
   * were added in the filler
   */
  // button.interior.video1.addEventListener('click',showVideo1);
  // function showVideo1() {
  //   Enabler.counter('Video 1 : Clicked');

  //   pauseAllVideos();

  //   var ytp1 = document.getElementById('ytp').children[0];
  //   var ytp2 = document.getElementById('ytp').children[1];
  //   if(ytp1.style.display == 'none') {
  //     ytp1.style.display = 'block';
  //     ytp2.style.display = 'none';

  //     button.interior.video1.style.opacity = 1.0;
  //     button.interior.video2.style.opacity = .6;
  //   }
  //   return ;
  // }

  // if(button.interior.video2) {
  //   button.interior.video2.addEventListener('click',showVideo2);
  //   function showVideo2() {
  //     Enabler.counter('Video 2 : Clicked');

  //     pauseAllVideos();

  //     var ytp1 = document.getElementById('ytp').children[0];
  //     var ytp2 = document.getElementById('ytp').children[1];
  //     if(ytp2.style.display == 'none') {
  //       ytp2.style.display = 'block';
  //       ytp1.style.display = 'none';

  //       button.interior.video2.style.opacity = 1.0;
  //       button.interior.video1.style.opacity = .6;
  //     }
  //     return ;
  //   }
  // }

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
        attachEvents(adState);
      }
      // Need to restart at 0 on replay however seekTo method is not an exposed
      // method in IS component. Using loadVideoById instead of playVideo
      ytp_intro.loadVideoById(introConfig.videoId);
      firstIntroPlay = false;
    break;
    case "panel_one":
      panel.intro.style.display = "none";
      panel.one.style.display = "block";
      attachEvents(adState);
    break;
  }
};


var setupIntroYTP = function(config) {
  videoState.intro = {};
  //TODO (pfeneht) - When setup in closure properly we won't have to use
  // global variable.
  introConfig.videoId = config.videoID;

  var playerConfig = {
    'containerId': 'ytp_iframe', // use above created div as ytp iframe
    'videoId': config.videoID,
    'videoWidth': 1110,
    'videoHeight': 250,
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
  ytp_intro.name = "ytp_intro";
  // TODO: why are event handlers not always added? May just happen locally?
  ytp_intro.addEventListener('ready', onPlayerReady, false);
  ytp_intro.addEventListener('statechange', onPlayerStateChange, false);
};


var addInteriorYTP = function(newValue, newIndex, imagesArray) {
  console.log('addInteriorYTP', imagesArray);
  binding.addPropertyChangeListener(imagesArray[newIndex],
    'videoID', ytInteriorChange
  );

  var videoID_ = imagesArray[newIndex]['videoID'];

  /** Create divs and ytp based on array values from filler.
   * TODO (pfeneht) Attach / remove events for each YTP and Select Buttons
   *   Does each player need it's own playerVars for theme? How do I pull those
   *     values in at add time?
   */
  var ytp_iframe = document.createElement('div');
  ytp_iframe.id = 'ytp'+(newIndex+1)+'_iframe';
  ytp_iframe.setAttribute(
    "style",
    "width:"+root['interiorYTP'].width+"px;"+
    "height:"+root['interiorYTP'].height+"px;"+
    "position:absolute;display:none;"
  );

  document.getElementById('ytp').appendChild(ytp_iframe);

  console.log(root);

  var player = {
    'containerId': ytp_iframe, // use above created div as ytp iframe
    'videoId': videoID_,
    //'videoWidth': root['interiorYTP'].width,
    //'videoHeight': root['interiorYTP'].height,
    'playerVars': {
      'theme': 'dark',
      'autoplay': false,
      'controls': 1,
      'rel': 0,
      'showinfo': 0,
      'html5': 1
    }
  };

  // This function turns containerId into an <iframe> YouTube player
  var ytp = new studioinnovation.YTPlayer(player);
  ytp.name = 'ytp_'+(newIndex+1);
  ytpInteriorPlayers.push(ytp);
  ytp.addEventListener('ready', onPlayerReady, false);
  ytp.addEventListener('statechange', onPlayerStateChange, false);

  // Add select button div
  addSelectButton_(newIndex+1,'select_buttons');

};

/**
 * Adds a new video select button to DOM parent div
 * @param {number} index Class name to give new div.
 * @param {string} parentDiv Parent div class to append new div to
 * @private
 */
var addSelectButton_ = function(index,parentDiv) {
  console.log('addSelectButton_ '+index);
  var div = document.createElement('div');
  div.className = 'video'+index.toString();
  div.setAttribute("style",
    "float:right;width:35px;height:25px;background-color:rgba(111,0,111,1);"+
    "opacity:1;"
  );
  // float: right;
  // width: 35px;
  // height: 25px;
  // background-color: rgba(111,0,111,1);
  // opacity: 1;

  div.textContent = index.toString();
  var parentDiv = document.querySelector(''+'.'+parentDiv+'');
  parentDiv.insertBefore(div, parentDiv.firstChild);
  button.interior['video'+index.toString()] = div;
  //TODO (pfeneht): link up each interior button event handler
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
