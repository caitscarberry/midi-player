/*
Midi standard format sources:
http://www.sonicspot.com/guide/midifiles.html
http://www.fileformat.info/format/midi/corion.htm
http://home.roadrunner.com/~jgglatt/tech/midifile.htm
http://cs.fit.edu/~ryan/cse4051/projects/midi/midi.html
*/

//represents one midi song
function Midi(data){
	this.data = data;
	this.header = new Chunk(data.substring(0,15));
	this.type = sumBits(this.header.data.substring(8,10));
	this.tracks = sumBits(this.header.data.substring(10,12));
	this.keySignature = [0,0,0,0,0,0,0,0,0,0,0,0];
	this.bpm = 120;
	this.ticksPerBeat = 24;
	
	this.ticksPerSecond = null;
	
	if(this.header.data.charCodeAt(12)<128)
	{
		this.ticksPerBeat = sumBits(this.header.data.substring(12,14));
		this.ticksPerSecond = this.ticksPerBeat*this.bpm/60;
	}
	else
	{
		this.ticksPerSecond =  (255-this.header.data.getCharCode(12))*this.header.data.getCharCode(13);
	}
	
	this.trackChunks = [];

	this.trackData = this.data.substring(18).split("MTrk");
	for(i in this.trackData)
	  {
	  	c = new Chunk("MTrk"+this.trackData[i]);
		this.trackChunks.push(c); 
		c.readEvents();
	}
	console.log("Midi built");
}

function Chunk(data){
	this.data = data;
	this.id = null;
	this.size = 0;
	this.readData();
	this.events = [];
}

Chunk.prototype.readData = function(){
	this.id = this.data.substring(0,4);
	this.size = sumBits(this.data.substring(4,8));
	
}

Chunk.prototype.readEvents = function(){
	data = this.data.substring(8);
	currentEvt = new TrackEvent();
	index = 0;
	
	while(index < data.length)
	{
		k = index;
		deltaT = readVariableLengthInt(data.substring(index,index+4));
		
		index+= deltaT["hexLength"];
		currentEvt.deltaT = deltaT["decimalResult"];
		
		typeAndChannel = data.charCodeAt(index).toString(16);
		typeAndChannel = "00".substring(typeAndChannel.length) + typeAndChannel;
		currentEvt.bytes = currentEvt.bytes +" "+ typeAndChannel;
		
		currentEvt.type = parseInt(typeAndChannel[0],16);
		currentEvt.channel = parseInt(typeAndChannel[1],16);
		currentEvt.param1 = data.charCodeAt(index+1);
		currentEvt.param2 = data.charCodeAt(index+2);
		
		if(currentEvt.type<8){
			console.log("INVALID EVENT TYPE: "+currentEvt.type+" index: "+index+" k:"+k);
		}
		
		if(currentEvt.type<15&&currentEvt.type>7){
			if(currentEvt.type!=12&&currentEvt.type!=13)
			{
				index++;
			}
			index++;
			this.events.push(currentEvt);
			currentEvt.bytes = asciiToHexString(data.substring(k,index+1));
			index++;
			
		}
			
		else if(parseInt(typeAndChannel,16)==255)
		{	
			currentEvt.type=255;
			currentEvt.param1 = data.charCodeAt(index+1);
		
			len = readVariableLengthInt(data.substring(index+2,index+6));
			
			currentEvt.param2 = data.substring(index+2+len["hexLength"],index+2+len["hexLength"]+len["decimalResult"]);
	
			index=index+1+len["hexLength"]+len["decimalResult"];
			console.log(currentEvt.param2);
			if(currentEvt.param1==47)
			{
				console.log("End of track");
				index--;
				currentEvt.param2 = "";
			}
			if(currentEvt!=undefined)
			{
				this.events.push(currentEvt);
				currentEvt.bytes = asciiToHexString(data.substring(k,index+1));
				index++;
			}
		}
		currentEvt = new TrackEvent();	
	}
}

function TrackEvent(){
	this.deltaT = 0;
	this.type = null
	this.channel = null;
	this.param1 = null;
	this.param2 = null;
	this.bytes = "";
	this.deltaTBin = "";
}

function noteOn(event) {
	noteGainControl[event.param1].disconnect(context.destination);
	oscillators[event.param1].disconnect(noteGainControl[event.param1]);
	delete noteGainControl[event.param1];
	noteGainControl[event.param1] = context.createGainNode();
	oscillators[event.param1].connect(noteGainControl[event.param1]);
	noteGainControl[event.param1].connect(context.destination);
	noteGainControl[event.param1].gain.exponentialRampToValueAtTime(Math.max(event.param2/254,.01),context.currentTime);
	noteGainControl[event.param1].gain.linearRampToValueAtTime(0,context.currentTime+1.5);

}

function noteOff(event) {
	noteGainControl[event.param1].gain.linearRampToValueAtTime(0,context.currentTime+(.5-event.param2/254));
	noteGainControl[event.param1].gain.cancelScheduledValues(0);
	noteGainControl[event.param1].gain.value = 0;
}

function setTempo(event) {
	mspqn = "";
	for(ch in event.param2)
	{
		mspqn = mspqn + "00".substring(event.param2.charCodeAt(ch).toString(16).length);	
		mspqn = mspqn + event.param2.charCodeAt(ch).toString(16);
	}
	mspqn = parseInt(mspqn,16); //microseconds per quarter note
	m.bpm = 60000000/mspqn;
	m.ticksPerSecond = m.ticksPerBeat*m.bpm/60; //tick/qn * qn/microsec * 1000000 = tick/sec
	console.log("bpm: "+m.bpm+"; tps: "+m.ticksPerSecond);
}

function setKeySignature(event) {

	numOfFlatsOrSharps = event.param2.charCodeAt(0)
	sharp = numOfFlatsOrSharps<8;
	if(!sharp)numOfFlatsOrSharps = 256-numOfFlatsOrSharps;
				//F,C,G,D,A,E,B
	sharpOrder = [5,0,7,2,9,4,11];
	
	if(sharp)
	{
		for(i = 0; i < numOfFlatsOrSharps; i++){
			m.keySignature[sharpOrder[i]] = 1;
		}
	}
	else
	{
		for(i = 1; i <= numOfFlatsOrSharps; i++){
			m.keySignature[sharpOrder[7-i]] = -1;
		}
	}	
}

function setTimeSignature(event) {
	numerator = event.param2.charCodeAt(0);
	denominator = Math.pow(2,event.param2.charCodeAt(1));
	console.log(event.param2.charCodeAt(1));
	console.log("Time signature: "+numerator+"/"+denominator);
}

function playEvent(event){
	if(event.type==9&&event.param1<128) noteOn(event);

	if(event.type==8&&event.param1<128) noteOff(event);

	if(event.type==255&&event.param1==81) setTempo(event);
	
	if(event.type==255&&event.param1==89) setKeySignature(event);

	if(event.type==255&&event.param1==88) setTimeSignature(event);
	
	on = new Array();
	for(note in noteGainControl){
		if(noteGainControl[note].gain.value>.1)	on.push(note);
	}
	drawKeyboard(on);
}

function playMidi(midi){
	elapsedTicksPerTrack = [0,0,0];

	gain.gain.value = 1;
	lastTrackEventTimes = [];
	startTime = context.currentTime;
	for (t in midi.trackChunks) {
		lastTrackEventTimes[t] = 0;
	}
	
	playingInterval = window.setInterval(function() {
		for (t in midi.trackChunks) {
			elapsed = elapsedTicksPerTrack[t];
			while(midi.trackChunks[t].events[0]!=undefined&&
			(elapsed-lastTrackEventTimes[t]>midi.trackChunks[t].events[0].deltaT)) {
				end = false;
				playEvent(midi.trackChunks[t].events[0]);
				lastTrackEventTimes[t] += midi.trackChunks[t].events[0].deltaT;
				midi.trackChunks[t].events = midi.trackChunks[t].events.slice(1);
			}
			elapsedTicksPerTrack[t]+=.01*m.ticksPerSecond;
		}
		
	
	},10);
}
