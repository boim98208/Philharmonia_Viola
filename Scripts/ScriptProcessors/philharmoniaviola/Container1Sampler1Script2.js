Content.setWidth(650);
Content.setHeight(50);

reg lastNote = -1;
reg retrigger = -1;
reg eventId;
reg lastTuning = 0;

//GUI
const var bypass = Content.addButton("Bypass", 10, 10);

const var time = Content.addKnob("Time", 160, 0);
time.setRange(0, 2000, 0.01); function onNoteOn()
{
    if (!bypass.getValue())
    {
        // Turn this note into artificial (once!)
        Message.makeArtificial();

        local newEventId = Message.getEventId();
        local newNote = Message.getNoteNumber();

        if (lastNote == -1)
        {
            eventId = newEventId;
            lastNote = newNote;
            lastTuning = 0;
        }
        else
        {
            local delta = newNote - lastNote;

            if (time.getValue() > 0 && eventId != -1)
            {
                // --- OLD NOTE ---
                Synth.addPitchFade(eventId, time.getValue(), lastTuning + delta, 0);
                Synth.addVolumeFade(eventId, time.getValue(), -100);

                // --- NEW NOTE (this current message) ---
                Message.setCoarseDetune(-delta);   // start at old pitch
                Message.setGain(-99);              // silent start

                Synth.addVolumeFade(newEventId, time.getValue(), 0);
                Synth.addPitchFade(newEventId, time.getValue(), 0, 0);

                eventId = newEventId;
                lastTuning = 0;
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
    if (!bypass.getValue())
    {
        Message.makeArtificial();
        Message.ignoreEvent(true);

        if (eventId != -1 && Message.getNoteNumber() == lastNote)
        {
            if (Synth.isKeyDown(retrigger))
            {
                // glide back
                Synth.addPitchFade(eventId, time.getValue(), 0, 0);

                lastNote = retrigger;
                retrigger = -1;
                lastTuning = 0;
            }
            else
            {
                // fade out instead of kill
                Synth.addVolumeFade(eventId, time.getValue(), -100);
                eventId = -1;
            }
        }

        if (!Synth.getNumPressedKeys())
        {
            lastNote = -1;
            lastTuning = 0;
            retrigger = -1;
        }
    }
    else if (eventId != -1)
    {
        Synth.noteOffByEventId(eventId);

        eventId = -1;
        lastNote = -1;
        lastTuning = 0;
        retrigger = -1;
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
 