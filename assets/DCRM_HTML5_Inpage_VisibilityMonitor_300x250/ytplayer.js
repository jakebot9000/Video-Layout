var ytp;
var isVideoPlaying = false;

function setupVids() 
{
	var player = 
	{
		'containerId': 'video-wrapper',
		'videoId': '11NiafAkTcY',
		'videoWidth': 260,
		'videoHeight': 176,
		'playerVars': 
		{
		  'autoplay': 0, 
		  'controls': 1,
		  'rel': 0,
		  'showinfo': 0,
		  'html5': 1
		},
	};

	// This function creates an <iframe> (and YouTube player)
	ytp = new studioinnovation.YTPlayer(player);
	ytp.addEventListener('ready', onPlayerReady, false);
	ytp.addEventListener('statechange', onPlayerStateChange, false);
}

 function onPlayerStateChange(stateChangeEvent)
 {
	var playerState = stateChangeEvent.getPlayerState();
	console.log(playerState);

	switch(playerState){
	  case studioinnovation.YTPlayer.Events.ENDED:	  
	  	//console.log('END');
	  	isVideoPlaying = false;
	  	ytp.cueVideoById("11NiafAkTcY");
	  break;
	  case studioinnovation.YTPlayer.Events.PLAYING:  
	  	//console.log('PLAYING');
	  	isVideoPlaying = true;
	  break;
	  case studioinnovation.YTPlayer.Events.PAUSED:   
	  	//console.log('PAUSED');
	  	isVideoPlaying = false;
	  break;
	  case studioinnovation.YTPlayer.Events.BUFFERING:
	  	//console.log('BUFFERING');
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
}
	  
function onPlayerReady(event) 
{
  //console.log('READY');
  startMonitoring();
}	

function videoPause(){
  //console.log("FORCE VIDEO TO PAUSE");
  ytp.pauseVideo();
  isVideoPlaying = false;
}
