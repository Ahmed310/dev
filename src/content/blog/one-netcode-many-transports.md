---
title: "One netcode, many transports: the provider abstraction"
description: "How the same multiplayer game runs unchanged on ENet, LiteNetLib, WebSocket, or TCP, and why that seam is worth building. From FigNet."
pubDate: 2026-07-08
cover: "/media/blog/networking.svg"
tags: ["networking", "fignet", "transport"]
---

In the last post I made a claim and then walked past it: the game code should never know which transport it runs on. This post is about the seam that makes that true. It is the provider abstraction in FigNet, the piece that lets the exact same game run on ENet, LiteNetLib, WebSocket, or TCP, chosen by configuration, without changing a single line of gameplay.

## Why abstract the transport at all

It is tempting to just pick a networking library and build directly on it. The reason not to shows up the moment you meet a second platform:

- **Browsers only speak WebSockets.** If you ever want a WebGL build, a raw UDP stack is a dead end.
- **Some networks only allow TCP.** Locked down corporate or school networks block UDP entirely.
- **Native apps want UDP for speed.** ENet or LiteNetLib give you the low latency a real time game needs.

If the transport is welded to your game, supporting all three means three code paths. If it sits behind a seam, it means three small classes and one config switch.

<figure class="fig">
<svg viewBox="0 0 640 292" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Transport abstraction" font-family="'JetBrains Mono', ui-monospace, monospace">
<defs><marker id="ah" markerWidth="9" markerHeight="9" refX="4.5" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 Z" fill="#7ee1c4" fill-opacity="0.6"/></marker></defs>
<rect x="210" y="12" width="220" height="44" rx="9" fill="#7ee1c4" fill-opacity="0.06" stroke="#7ee1c4" stroke-opacity="0.45"/><text x="230" y="39" fill="#dfe3ea" font-size="14">Your game code</text>
<rect x="190" y="90" width="260" height="44" rx="9" fill="#7ee1c4" fill-opacity="0.06" stroke="#7ee1c4" stroke-opacity="0.45"/><text x="210" y="117" fill="#dfe3ea" font-size="14">one socket contract</text>
<rect x="20" y="214" width="132" height="44" rx="9" fill="#7ee1c4" fill-opacity="0.06" stroke="#7ee1c4" stroke-opacity="0.45"/><text x="40" y="241" fill="#dfe3ea" font-size="14">ENet</text><rect x="172" y="214" width="132" height="44" rx="9" fill="#7ee1c4" fill-opacity="0.06" stroke="#7ee1c4" stroke-opacity="0.45"/><text x="192" y="241" fill="#dfe3ea" font-size="14">LiteNetLib</text><rect x="324" y="214" width="132" height="44" rx="9" fill="#7ee1c4" fill-opacity="0.06" stroke="#7ee1c4" stroke-opacity="0.45"/><text x="344" y="241" fill="#dfe3ea" font-size="14">WebSocket</text><rect x="476" y="214" width="132" height="44" rx="9" fill="#7ee1c4" fill-opacity="0.06" stroke="#7ee1c4" stroke-opacity="0.45"/><text x="496" y="241" fill="#dfe3ea" font-size="14">TCP</text>
<g stroke="#7ee1c4" stroke-opacity="0.5" stroke-width="1.4"><line x1="320" y1="58" x2="320" y2="86" marker-end="url(#ah)"/><line x1="320" y1="146" x2="86" y2="210" marker-end="url(#ah)"/><line x1="320" y1="146" x2="238" y2="210" marker-end="url(#ah)"/><line x1="320" y1="146" x2="390" y2="210" marker-end="url(#ah)"/><line x1="320" y1="146" x2="542" y2="210" marker-end="url(#ah)"/></g>
</svg>
<figcaption>The game talks to one small socket contract. Each transport is a provider behind it, so switching is a config choice, not a rewrite.</figcaption>
</figure>

## The seam: one small contract

FigNet defines a single socket contract, and everything above it talks only to that contract. Conceptually it is tiny: connect, disconnect, send a packet with a chosen reliability, and pull received packets back out.

```csharp
public interface ISocket
{
    void Connect(string address, int port);
    void Disconnect(Peer peer);
    void Send(Peer peer, ReadOnlySpan<byte> data, Reliability reliability);
    bool Receive(out Packet packet);
}
```

Core, Entangle, and your game only ever see this interface. They never mention ENet or WebSocket by name. Each transport is a provider that implements the contract in its own way.

## The providers

- **ENet:** reliable and unreliable channels over UDP. The default for real time games.
- **LiteNetLib:** another UDP library, pure C#, simple to embed and debug.
- **WebSocket:** the same game running in a browser, for WebGL builds.
- **TCP:** the fallback for networks that allow nothing else.

Adding a fifth later is not a refactor. It is one new class that satisfies the contract.

## The catch worth knowing

An abstraction hides the plumbing, not the physics. UDP providers can offer true per message reliability, so an unreliable position update and a reliable inventory change travel differently. TCP cannot: it forces reliable, ordered delivery on everything, which is head of line blocking waiting to happen. The seam still lets the layers above ask for the reliability they want; the provider just honors it as well as its transport allows. Picking TCP is a compatibility decision, and you make it knowing the tradeoff.

## What is next

That is the bottom of the stack sorted: bytes move, and the game does not care how. Next we climb a layer into Entangle, where peers and messages turn into rooms and networked entities, and a tick loop keeps them all in sync.
