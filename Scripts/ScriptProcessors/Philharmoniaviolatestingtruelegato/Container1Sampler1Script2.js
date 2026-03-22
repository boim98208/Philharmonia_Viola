/**
 * Legato Script — Non-linear crossfade via Timer
 * Works on all HISE versions.
 *
 * REQUIRED SAMPLER SETUP:
 * - Set SampleStartMod range in Wave Editor for each sample
 * - Script Processor must be in the Container MIDI chain (parent of Sampler)
 */

// ─── STATE ───────────────────────────────────────────────────────────────────

reg lastNote     = -1;
reg lastId       = -1;

reg fadeOutId    = -1;
reg fadeInId     = -1;
reg fadeProgress = 0.0;
reg isFading     = false;

// ─── GUI ─────────────────────────────────────────────────────────────────────

Content.setWidth(420);
Content.setHeight(120);

const var knbFadeTime = Content.addKnob("FadeTime", 0, 0);
knbFadeTime.setRange(10, 500, 1);
knbFadeTime.set("text", "Fade (ms)");
knbFadeTime.set("defaultValue", 120);

const var knbOffset = Content.addKnob("StartOffset", 150, 0);
knbOffset.setRange(0.0, 1.0, 0.01);
knbOffset.set("text", "Start Offset");
knbOffset.set("defaultValue", 0.5);

const var btnPanic = Content.addButton("Panic", 10, 50);
btnPanic.set("text", "All Notes Off");

function onControl(number, value)
{
    if (number == btnPanic && value == 1)
        Engine.allNotesOff();
}

// Curve: 1.0 = linear, 2.0+ = slow start/fast end, 0.5 = fast start/slow end
const var knbCurve = Content.addKnob("Curve", 300, 0);
knbCurve.setRange(0.2, 4.0, 0.01);
knbCurve.set("text", "Fade Curve");
knbCurve.set("defaultValue", 2.0);

// ─── TIMER SETUP ─────────────────────────────────────────────────────────────

// Tick every 10ms — fine enough resolution for smooth fades
const var TIMER_MS = 10;

Synth.startTimer(TIMER_MS / 1000.0);function onNoteOn()
{
    Message.makeArtificial();

    if (lastId != -1)
    {
        // Kick off a new crossfade, interrupting any previous one
        fadeOutId    = lastId;
        fadeInId     = Message.getEventId();
        fadeProgress = 0.0;
        isFading     = true;

        Message.setStartOffset(knbOffset.getValue());
        Message.setGain(-99);
    }

    lastNote = Message.getNoteNumber();
    lastId   = Message.getEventId();
}
function onNoteOff()
{
    Message.makeArtificial();

    if (Message.getNoteNumber() == lastNote)
    {
        lastNote = -1;
        lastId   = -1;
    }
}function onController()
{
	
}
 function onTimer()
{
    if (!isFading) return;

    local steps = knbFadeTime.getValue() / TIMER_MS;
    fadeProgress += (1.0 / steps);

    if (fadeProgress >= 1.0)
    {
        fadeProgress = 1.0;
        isFading = false;
    }

    local t = fadeProgress;

    // Equal-power curves using sine/cosine
    // fade-in:  starts silent, ends full
    // fade-out: starts full, ends silent
    // At t=0.5 both are at ~0.707 (-3dB) so they sum to constant power
    local gainIn  = Math.sin(t * 3.14159 * 0.5);        // 0 → 1
    local gainOut = Math.cos(t * 3.14159 * 0.5);        // 1 → 0

    // Convert linear gain to dB
    local dbIn  = 20.0 * Math.log10(Math.max(gainIn,  0.00001));
    local dbOut = 20.0 * Math.log10(Math.max(gainOut, 0.00001));

    if (fadeOutId != -1)
        Synth.addVolumeFade(fadeOutId, 1, dbOut);

    if (fadeInId != -1)
        Synth.addVolumeFade(fadeInId, 1, dbIn);

    if (!isFading)
    {
        if (fadeOutId != -1)
            Synth.addVolumeFade(fadeOutId, 1, -100);
        fadeOutId = -1;
    }
}function onControl(number, value)
{
	
}
 