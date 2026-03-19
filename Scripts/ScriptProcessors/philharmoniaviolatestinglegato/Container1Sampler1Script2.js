// UI references (GLOBAL)
const var bypass;
const var time;
const var slope;
const var attack;
const var bendTime;
const var startOffset;

function onInit()
{
    Content.makeFrontInterface(1000, 400);

    // Create components
    Content.addButton("Bypass", 10, 10);
    Content.addKnob("Time", 120, 0);
    Content.addKnob("Slope", 220, 0);
    Content.addKnob("Attack", 320, 0);
    Content.addKnob("BendTime", 600, 0);
    Content.addKnob("StartOffset", 520, 0);

    // Get references (CRITICAL)
    bypass = Content.getComponent("Bypass");
    time = Content.getComponent("Time");
    slope = Content.getComponent("Slope");
    attack = Content.getComponent("Attack");
    bendTime = Content.getComponent("BendTime");
    startOffset = Content.getComponent("StartOffset");

    // Setup
    time.setRange(0, 2000, 1);
    slope.setRange(0.1, 2.0, 0.01);
    attack.setRange(0, 2000, 1);
    bendTime.setRange(0, 2000, 1);
    startOffset.setRange(0, 44100, 1);
}function onNoteOn()
{
	

    // 🔴 SAME GUARD HERE
    if (time == undefined || bypass == undefined || attack == undefined || startOffset == undefined)
        return;

    if (!bypass.getValue())
    {
        Message.makeArtificial();

        local newEventId = Message.getEventId();
        local newNote = Message.getNoteNumber();

        local fadeTime = time.getValue();
        local attackTime = attack.getValue();
        local offset = startOffset.getValue();

        if (lastNote == -1)
        {
            eventId = newEventId;
            lastNote = newNote;
        }
        else
        {
            if (fadeTime > 0 && eventId != -1)
            {
                Synth.addVolumeFade(eventId, fadeTime, -100);

                Message.setStartOffset(offset);
                Message.setGain(-99);

                Synth.addVolumeFade(newEventId, attackTime, 0);

                eventId = newEventId;
            }
            else
            {
                if (eventId != -1)
                    Synth.noteOffByEventId(eventId);

                eventId = newEventId;
            }

            retrigger = lastNote;
            lastNote = newNote;
        }
    }
}function onNoteOff()
{
    // 🔴 SAFETY GUARD (THIS FIXES YOUR ERROR)
    if (time == undefined || bypass == undefined)
        return;

    if (!bypass.getValue())
    {
        Message.ignoreEvent(true);

        local fadeTime = time.getValue();

        if (eventId != -1 && Message.getNoteNumber() == lastNote)
        {
            if (Synth.isKeyDown(retrigger))
            {
                lastNote = retrigger;
                retrigger = -1;
            }
            else
            {
                Synth.addVolumeFade(eventId, fadeTime, -100);
                eventId = -1;
            }
        }

        if (!Synth.getNumPressedKeys())
        {
            lastNote = -1;
            retrigger = -1;
        }
    }
}function onController()
{
	
}
 function onTimer()
{
	
}
 function onControl(number, value)
{
	
}
 