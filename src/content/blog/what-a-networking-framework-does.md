---
title: "What a networking framework actually does"
description: "Between your Send call and the other player seeing it, a lot happens. Here is the whole path, using FigNet, the .NET networking framework I built, as the worked example."
pubDate: 2026-07-07
cover: "/media/blog/networking.svg"
tags: ["networking", "fignet", "netcode"]
---

When you use a multiplayer engine, you call something like `Send(message)` and a moment later it shows up on another machine. For a long time that was magic to me. I could use it, but I could not have told you what actually happened in between.

Building FigNet, my own networking framework in .NET, meant taking that magic apart and owning every piece of it. This post is the map: what a networking framework actually does between your send call and the other player seeing the result, using FigNet as the worked example. It stays at the concept level, and later posts go deeper into each piece.

## What a networking layer has to do

Before any structure, it helps to know the jobs a networking layer is actually juggling:

- **Move bytes between machines.** The lowest job: get a chunk of data from here to there over an unreliable internet.
- **Know who is who.** Track every participant, and handle them connecting, dropping, and timing out.
- **Turn game data into bytes and back.** A position or a chat line has to become a compact sequence of bytes, and be rebuilt exactly on the other side.
- **Pick the right reliability per message.** Some data must arrive, in order. Some can be dropped without anyone caring. These want very different handling.
- **Be fast and quiet.** This runs many times a second, so it cannot allocate garbage and stutter the game.
- **Stay independent of the transport.** The game code should work the same whether it runs on UDP, WebSockets, or something else.

Every design choice below traces back to one of these six.

## The vocabulary

A few words make the rest of this readable.

- **Peer:** one participant in the session, a connected client or the server. Each peer has an id. FigNet models every connection as a peer.
- **Message:** a unit of game data you send, like a movement update, an action, or a chat line.
- **Socket:** the low level endpoint that actually pushes and pulls bytes over the network.
- **Provider (transport):** the concrete library that moves packets. FigNet can run on ENet, LiteNetLib, WebSocket, or TCP, and each of these sits behind a common interface.
- **Packet:** the actual bytes that travel over the wire.
- **Reliability:** whether a message is guaranteed to arrive, and in order. Reliable ordered for things that must not be lost, unreliable for things that are replaced constantly anyway.
- **Tick:** the fixed heartbeat at which the system drains its queues and processes what came in and what needs to go out.

## FigNet at a glance

FigNet is built in layers, and each layer only knows about the one below it:

> Providers (ENet, LiteNetLib, WebSocket, TCP) feed FigNet Core (peers, messages, sockets), which feeds Entangle (rooms, entities, the tick loop), which feeds the Unity client.

This post lives entirely in Core. Two rules shape everything in it: the game code should never know or care which transport it runs on, and the per frame hot path should allocate as close to zero as possible.

## Sockets and providers: the transport abstraction

The lowest layer is the part people assume is the whole thing: actually sending bytes. FigNet defines a single socket interface, a small contract that says you can send a packet and you can receive packets. Each provider implements that contract in its own way.

That one indirection buys a lot. ENet gives you reliable and unreliable channels over UDP, which is what most real time games want. WebSocket lets the same game run in a browser. TCP is there when a network only allows it. Because the game talks to the interface and never to the library, switching from one to another is a configuration choice, not a rewrite.

## Peers: identity and lifecycle

Once bytes can move, someone has to keep track of who is on the other end. FigNet wraps each connection as a peer with a stable id, and manages the unglamorous but critical lifecycle around it: a peer connecting, a peer disconnecting cleanly, and the harder case, a peer that simply goes quiet and has to be timed out. Every message that arrives is tagged with the peer it came from, so the layers above always know who did what.

## Messages: turning game data into bytes

A position is a few numbers in memory. The network only moves bytes. The message layer is the translator in both directions: it serializes your data into a compact buffer to send, and rebuilds it on the far side into the same values. The goal is to spend as few bytes as possible, because bytes are bandwidth, and bandwidth is the budget you run out of first when a room fills up.

## The send and receive paths

Putting it together, a single send is a short journey. Your code hands a message to Core. Core serializes it into bytes, tags it with the reliability you asked for, and gives it to the active provider's socket. The provider turns that into a packet and puts it on the wire.

Receiving runs the same trip in reverse, on the tick: the provider's socket hands Core the raw bytes, Core figures out which peer they came from, rebuilds the message, and dispatches it to whatever is listening. Nothing in that flow mentions ENet or WebSocket by name, which is the entire point.

## Why not just use TCP

A fair question, since TCP already gives you reliable, ordered delivery for free. The problem is that it gives it to you for everything, whether you want it or not. If one packet is lost, TCP holds back every packet behind it until the lost one is resent. That is called head of line blocking, and in a fast game it turns one dropped packet into a visible freeze for everyone. Real time networking wants reliability to be a per message choice, not a blanket rule, which is exactly why UDP based providers like ENet exist and why the message layer carries a reliability tag.

## Keeping it fast and quiet

All of this runs many times per second, so the hot path is written to allocate almost nothing: buffers are pooled and reused instead of being created and thrown away, and received data is copied as few times as possible on its way in. In a managed language, this discipline is what keeps the garbage collector from waking up mid match and causing the stutter every player notices.

## What is next

That is Core: providers move bytes, peers track who is who, messages translate game data, and reliability is a choice you make per message. In the next post I go one level down into the transport abstraction itself, and show how the same game runs unchanged on ENet, LiteNetLib, WebSocket, and TCP. After that we move up a layer into Entangle, where peers and messages become rooms and networked entities.
