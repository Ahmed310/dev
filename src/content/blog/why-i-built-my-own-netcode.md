---
title: "Why I built my own netcode instead of licensing Photon"
description: "Replacing a commercial networking stack sounds reckless. Here's the actual reasoning: the bill, the control, and the fact that I already had most of it built."
pubDate: 2026-07-04
tags: ["networking", "netcode", "entangle"]
draft: true
---

At Immersed, our multiplayer ran on Photon Fusion, and it worked. So the honest question to open with is the one a good engineering manager would ask me: why rip out something that works and replace it with something you now have to build, own, and support forever?

It's a fair question, and for a long time the answer was "you don't." Then a few things lined up.

## The bill

Photon prices on concurrent users. That's a completely reasonable model right up until your product is a place where a lot of people hang out at once, which is exactly what a VR collaboration app is. As our rooms grew, the monthly bill settled somewhere between 800 and 1000 dollars. For one layer of the stack, that was hard to ignore, and it only moved in one direction: up and to the right with usage.

I'm not against paying for good middleware. I am against paying a per-user tax on the one part of the system I understood well enough to own.

## The control

The bigger reason was control. A VR room isn't a twitch shooter. The interesting problem isn't "who shot first," it's "how do I keep 100 people's avatars, voices, and shared objects in sync without saturating a Quest's tiny bandwidth budget?" That needs things like area-of-interest, so I only send you what's near you, a voice layer that behaves the same on mobile and standalone, and the freedom to change the wire protocol the moment the profiler tells me to.

With a black box, every one of those turns into a feature request to someone else, or a workaround. I wanted to open the box.

## The part nobody tells you

Here's what made the decision reasonable instead of insane: I had already built most of it. On my own time I'd been writing FigNet, a transport-agnostic networking framework in .NET, and Entangle, a room-based layer on top of it. It wasn't a weekend toy. It had the pieces that mattered: rooms, networked entities, area-of-interest, delta replication.

So this was never "let's build a netcode stack from scratch, under deadline." It was "let's take the thing I already trust and put it in production." That is a completely different risk profile.

## What happened

We swapped Photon Fusion for Entangle. The monthly bill dropped to around 250 to 350 dollars, roughly a 65% cut. We held 100+ users in a single shared room. And when something was slow, I could open the source and fix it instead of filing a ticket and waiting.

I also owned the collaboration feature end to end after that: the networked avatars, a cross-platform voice stack with a C++ core so mobile users could join the same rooms, and the room logic underneath.

## When you should not do this

I want to be straight about this, because "I built my own netcode" is the kind of sentence that gets people into trouble.

If you don't already have deep networking experience, don't. If you can't afford to own the bugs at 2am, don't. Photon, Mirror, Fusion, and the rest exist because netcode is genuinely hard, and most teams are better off buying it. The math only worked for me because the cost was high, the requirements were unusual, and I had already paid most of the build cost up front.

## What's next

This is the first post in a series where I take Entangle apart and show how it actually works: the transport abstraction that lets me swap ENet for WebSockets without touching game code, the area-of-interest system that keeps bandwidth flat as rooms fill, and how state replication stays small and self-healing.

Next up: the architecture, from the wire up.
