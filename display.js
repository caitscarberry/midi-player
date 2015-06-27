context = new AudioContext();
//Adjust for browser differences
if(context.createGainNode==undefined) {
	context.createGainNode = context.createGain;
}
oscillators = new Array(127);

noteGainControl = new Array(127);

for (i = 0; i < 128; i++){
	noteGainControl[i] = context.createGainNode();
	noteGainControl[i].gain.value = 0;
	noteGainControl[i].connect(context.destination);
}

for (i = 0; i < 128; i++){
	oscillators[i] = context.createOscillator();
	changeNote(oscillators[i],i);
	oscillators[i].connect(noteGainControl[i]);
	
	oscillators[i].start();
}


gain = context.createGainNode();
gain.gain.value = 0;


filter = context.createBiquadFilter()
filter.frequency.value = 300;


filter.connect(gain);

gain.connect(context.destination);

function changeNote(oscillator,note){
	oscillator.frequency.value = Math.pow(2,(note-57)/12)*440;
}

drawingCtx = keyboardCanvas.getContext('2d');
keys = [];

function Key(x, color){
	this.x = x;
	this.color = color;
}

function makeBoard(){
	keyWidth = 20;
	x = 0;
	for(i = 0; i < 8; i++) {
		keys.push(new Key(x,"#f0f0f0"));			//C
		keys.push(new Key(x+keyWidth*3/4,"black"));	//C#
	
		x+=keyWidth;
	
		keys.push(new Key(x,"#f0f0f0"));			//D
		keys.push(new Key(x+keyWidth*3/4,"black"));	//D#
	
		x+=keyWidth;
	
		keys.push(new Key(x,"#f0f0f0"));			//E
	
		x+=keyWidth;
	
		keys.push(new Key(x,"#f0f0f0"));			//F
		keys.push(new Key(x+keyWidth*3/4,"black"));	//F#
	
		x+=keyWidth;
	
		keys.push(new Key(x,"#f0f0f0"));			//G
		keys.push(new Key(x+keyWidth*3/4,"black"));	//G#
	
		x+=keyWidth;
	
		keys.push(new Key(x,"#f0f0f0"));			//A
		keys.push(new Key(x+keyWidth*3/4,"black"));	//A#
		
		x+=keyWidth;
	
		keys.push(new Key(x,"#f0f0f0"));			//B
		
		x+=keyWidth;
	}				
	
}

function drawKey(num, notesOn){
	if(notesOn.indexOf(num.toString())>-1) {
		drawingCtx.fillStyle = "red";
	}
	else {
		drawingCtx.fillStyle = keys[num].color;
	}
	if(keys[num].color=="black") drawingCtx.fillRect(keys[num].x,0,keyWidth/2,50);
	else drawingCtx.fillRect(keys[num].x+1,0,keyWidth-1,100);
	
}

function drawKeyboard(notesOn){
	//draw white keys first
	for(i = 0; i < keys.length; i++) {
		if(keys[i].color!="black")
			drawKey(i, notesOn);
	}
	//draw black keys on top of white keys
	for(i = 0; i < keys.length; i++) {
		if(keys[i].color=="black")
			drawKey(i, notesOn);
	}
}


makeBoard();
drawKeyboard([]);
