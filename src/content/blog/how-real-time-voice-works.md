---
title: "How real-time voice actually works"
description: "The vocabulary, the constraints, and the full capture to playback pipeline behind real-time voice chat, from the engine I built, FnVoice."
pubDate: 2026-07-06
cover: "/media/blog/voice.svg"
tags: ["voice", "fnvoice", "audio", "dsp"]
---

When I set out to build FnVoice, a real-time voice engine for Unity, voice was a black box to me. I could say the words, sample, frame, sample rate, jitter buffer, and I could not have told you what any of them actually meant. I knew networking cold. Audio, not at all.

Building it forced me to learn, and it turned out to be one of the more satisfying problems I have worked on: a handful of small, subtle constraints that all fight each other, wrapped in a pipeline that has to satisfy every one of them at once. This post is the explanation I wish I had on day one: the vocabulary, the constraints, and the whole path a voice takes from one person's microphone to another person's speakers.

## What a voice pipeline has to do

Before any code, it helps to know what we are optimizing for. Good real-time voice needs five things at the same time:

- **Low latency.** If there is a noticeable delay, people start talking over each other.
- **High quality.** It has to sound like the person, not a robot in a tunnel.
- **Low bandwidth.** Especially on mobile and standalone VR, where the budget is tiny.
- **Tolerance to packet loss.** The network will drop packets, and the audio cannot just stop.
- **Tolerance to clock skew.** The sender's and receiver's clocks run at slightly different speeds, forever.

The trouble is these pull against each other. Lower latency leaves less room to hide packet loss. Higher quality costs bandwidth. Every decision further down is a trade between these five, so it is worth keeping them in your head as we go.

## The vocabulary

Almost everything clicked once I had four words straight.

- **Signal:** a sound. Physically it is a wave; digitally we store the wave's height at each instant in time. Each of those height values is a sample.
- **Sample:** one of those height values, a single number. Audio commonly uses 16 bit integers or 32 bit floats. Unity works in 32 bit floats (range -1.0 to 1.0), and so does FnVoice.
- **Sample rate:** how many samples we capture each second. 48,000 Hz (48 kHz) is standard for voice. More samples per second means more detail, and more data.
- **Frame:** a pipeline does not process one sample at a time; it works on small blocks called frames, for example 20 ms of audio. Wherever the block size has to change, you will find a buffer accumulating samples until a full frame is ready.

That is the whole glossary. A signal made of samples, captured at a sample rate, processed a frame at a time.

## The pipeline, end to end

Here is the path, and it has two golden rules baked into it: keep the game's main thread out of the heavy work, and respect those five goals at every step.

> capture, detect speech, clean up, encode, send, jitter buffer, decode, play back

Now the interesting part, what each stage actually does.

## Capture: microphone to packet

Unity can only touch the microphone on the main thread, so the rule is to grab the audio and get off the main thread as fast as possible. FnVoice reads the mic into its own buffer and, the moment a complete frame is ready, hands that frame to a worker thread. Everything expensive happens over there.

On the worker thread:

1. **Resample** the mic's rate to the rate the next stages expect, and convert the 32 bit float samples to 16 bit integers, because the DSP components want int16.
2. **Voice activity detection (VAD).** Decide whether this frame is speech or just silence and noise, so we only transmit when someone is actually talking. FnVoice uses a statistical (GMM) detector for this.
3. **DSP cleanup.** Run the audio through native signal processing: acoustic echo cancellation, so a speaker's output is not picked up and sent back as an echo, which matters when people are not wearing headphones; noise suppression; and automatic gain control, so a quiet talker and a loud talker come out at a similar volume. FnVoice calls into native WebRTC DSP through P/Invoke for this.
4. **Convert back to float,** then **encode with Opus.**

That last step matters because raw audio is enormous. At 48 kHz with 4 byte samples that is 192,000 bytes every second, completely impractical to stream to a room full of people. Opus compresses that down to a few kilobytes per second while still sounding like a human. The frame becomes a small packet, ready to send.

## The network

FnVoice does not care how packets travel. It is transport independent and rides on top of FigNet, my networking framework. The encoded packet is sent off the worker thread, the server forwards it to whoever should hear it, and on the receiving side it is copied off the network thread and handed to the playback pipeline as quickly as possible.

## Playback: packet to speaker

Playback is capture in reverse, plus one component that earns its keep, the jitter buffer.

- **Jitter buffer.** If you played every packet the instant it arrived, a single late packet would leave you with nothing to play, and you would hear a gap. The jitter buffer holds a small cushion of audio, say 100 ms, so late packets still have room to arrive on time. Size it too large and you add latency, too small and you get dropouts, so it is tuned against the network you are actually on.
- **Decode** the Opus packet back to samples. If a packet never showed up, Opus packet loss concealment invents a plausible little bit of sound to bridge the gap instead of clicking.
- **Volume ramping.** The first and last frames of speech are ramped up and down so you do not hear a hard click when someone starts or stops talking.
- **Frames back to samples.** Unity's audio system asks for whatever number of samples it wants, whenever it wants, so this stage turns our fixed frames back into an on demand sample stream.
- **Soft clipping and channel mapping,** then the samples are fed into Unity's `OnAudioFilterRead`, and from there it is just another sound playing in the game.

## Threading and portability

Two things made this production grade rather than a demo. First, none of the heavy lifting touches the main thread: capture, DSP, encode, decode, and playback all run on their own threads, with lock free diagnostics so I can watch the pipeline without stalling it. Second, all that native code is cross compiled for seven platforms (Windows, Linux, macOS, Android, iOS, visionOS) and kept IL2CPP and AOT safe, so it runs the same on a phone as it does on a PC.

## What is next

This is the map. In the next posts I zoom into the stages that are interesting on their own: how Opus is actually wired in, calling native WebRTC DSP from C# through P/Invoke without leaking or crashing, how the GMM voice detector decides what is speech, and what it takes to cross compile a native audio stack for seven platforms.
