 //Sampler2 is legato when coming from above target note
 //Sampler3 is legato when coming from below target note
 
 const var attackMuter = Synth.getMidiProcessor("Container1Sampler1MidiMute");
 
 const var legatoFromUpMuter = Synth.getMidiProcessor("Container1Sampler2MidiMute");
 
 const var legatoFromDownMuter = Synth.getMidiProcessor("Container1Sampler3MidiMute");



//note states 
reg lastNote = -1;
reg lastId = -1;
reg isFirstNote = true;

// timer fade state
reg fadeOutId = -1;
reg fadeInId = -1;
var fadeProgress = 0.0;
reg isFading = false;


// GUI to fiddle with
Content.setWidth(500);
Content.setHeight(50);

const var knbFadeTime = Content.addKnob("FadeTime", 0, 0);
knbFadeTime.setRange(10, 500, 1);
knbFadeTime.set("text", "Fade (ms)");
knbFadeTime.set("defaultValue", 120);

const var knbOffset = Content.addKnob("StartOffset", 200, 0);
knbOffset.setRange(0.0, 1.0, 0.01);
knbOffset.set("text", "Start Offset");
knbOffset.set("defaultValue", 0.5);

// timer
const var TIMER_MS = 10;
Synth.startTimer(TIMER_MS / 1000.0);

 
 inline function firstNote()
 {
	//plays for the first note

	 attackMuter.setAttribute(attackMuter.ignoreButton, false);
	 legatoFromUpMuter.setAttribute(legatoFromUpMuter.ignoreButton, true);
	 legatoFromDownMuter.setAttribute(legatoFromDownMuter.ignoreButton, true);
 }
 
 inline function legatoFromHigh()
 {
	//coming from a higher note

 	 attackMuter.setAttribute(attackMuter.ignoreButton, true);
 	 legatoFromUpMuter.setAttribute(legatoFromUpMuter.ignoreButton, false);
 	 legatoFromDownMuter.setAttribute(legatoFromDownMuter.ignoreButton, true);
 }
 
 inline function legatoFromLow()
 {
 	//coming from a lower note
 
 	 attackMuter.setAttribute(attackMuter.ignoreButton, true);
 	 legatoFromUpMuter.setAttribute(legatoFromUpMuter.ignoreButton, true);
 	 legatoFromDownMuter.setAttribute(legatoFromDownMuter.ignoreButton, false);
 }
 
 firstNote();
 
 
 function onNoteOn()
{
    Message.makeArtificial();
    if(isFirstNote){
        firstNote();
        isFirstNote = false;
    } else {
        fadeOutId = lastId;
        fadeInId = Message.getEventId();
        fadeProgress = 0.0;
        isFading = true;
        Message.setGain(-99);
        Message.setStartOffset(knbOffset.getValue());  // ← add this

        if(lastNote > Message.getNoteNumber()){
            legatoFromHigh();
        } else {
            legatoFromLow();
        }
    }
    
    lastNote = Message.getNoteNumber();
    lastId = Message.getEventId();
}function onNoteOff()
{
	
	Message.makeArtificial();

	if(Message.getNoteNumber() == lastNote
	&& Synth.getNumPressedKeys() == 0){
		lastNote = -1;
		lastId = -1;
		isFirstNote = true;
		firstNote();
	}
}
 function onController()
{
	
}
 function onTimer()
{
	if(!isFading){
		return;
	}
	
	
	local steps = knbFadeTime.getValue() / TIMER_MS;
	fadeProgress += (1.0 / steps);
	
	if(fadeProgress >= 1.0){
		fadeProgress = 1.0;
		isFading = false;
	}
	
	local t = fadeProgress;
	local gainIn = Math.sin(t * 3.14159 * 0.5);
	local gainOut = Math.cos(t * 3.14159 * 0.5);
	local dbIn = 20.0 * Math.log10(Math.max(gainIn, 0.00001));
	local dbOut = 20.0 * Math.log10(Math.max(gainOut, 0.00001));
	if (fadeOutId != -1){
		Synth.addVolumeFade(fadeOutId, 1, dbOut);
	}
	if(fadeInId != -1){
		Synth.addVolumeFade(fadeInId, 1, dbIn);
	}
	
	if(!isFading){
		if(fadeOutId != -1){
			Synth.addVolumeFade(fadeOutId, 1, -100);
		}
		fadeOutId = -1;
	}
	
}
 function onControl(number, value)
{
	
}
 