# Blog plan — memory note

**Revive keyword:** `fnvoice` (when Ahmed tags this, reload this file and continue the blog plan)

## Ground rules (confirmed with Ahmed)
- **Template:** teaching / value-first, modeled on the Martin Devans "Dissonance pipeline" structure: define the vocabulary and the constraints first, then walk the system and explain the WHY of each stage. Do NOT credit or mention Martin or Dissonance anywhere.
- **Goal:** "they helped me, mine will help others." Same value his own Mega Particle / PokerVR posts had.
- **Voice:** authentic, first person, plain, a bit dry-witty. Reads human, not AI.
- **Formatting:** keep glossary sections as simple bullet lists (easy to digest), prose for the pipeline walkthroughs.
- **HARD RULE: never use em dashes (—) in the writing.** Use commas, colons, or parentheses instead.
- **First post:** NOT "How real-time voice actually works." That one stays in the series but is not the opener. Ahmed will pick the opener later.

## Drafted (approved content, awaiting the 3 fact-checks: VAD-before-DSP order, AEC confirmation, exact frame size / sample rate)
- **How real-time voice actually works (building FnVoice)** — pipeline overview: the five goals (latency, quality, bandwidth, packet loss, clock skew), vocabulary (signal, sample, sample rate, frame), capture -> VAD -> DSP -> Opus -> network -> jitter buffer -> decode -> playback, threading + 7-platform native.

## Post idea backlog (topics only)
Series order: Networking (FigNet/Entangle) first, then Voice (FnVoice), then Advanced C#, then case studies.

### Networking series (FigNet / Entangle) — FIRST
1. What a networking framework actually does: peers, messages, sockets (FigNet Core).
2. Transport abstraction: swapping ENet, LiteNetLib, WebSocket, TCP without touching game code.
3. Rooms, entities, and the tick loop: the Entangle model.
4. State replication without the bandwidth blowup: subscription-based delta encoding + dirty tracking.
5. Area of interest: a spatial grid that scales one room to hundreds of players.
6. Room authority models: relayed vs server-authoritative vs hybrid (and anti-cheat).
7. Smooth motion at low send rates: interpolation and reconciliation.
8. Staying connected: snapshot + delta sync, forced resync, token-based reconnect.

### Voice series (FnVoice) — SECOND
9. How real-time voice actually works (pipeline overview) — drafted, not the opener.
10. Opus in practice: encoding voice for the network (bitrate, frame size, packet loss concealment, DTX).
11. Calling native code from C# without crashing: P/Invoke, marshalling, and keeping it AOT / IL2CPP safe.
12. Cleaning up a voice signal: echo cancellation, noise suppression, and AGC with native WebRTC DSP.
13. Deciding what is speech: voice activity detection with a statistical (GMM) model.
14. The jitter buffer: trading latency for smoothness on a real network.
15. Cross-compiling a native audio stack for 7 platforms (meson + CI).

### Advanced C# / systems series — THIRD
16. Killing GC in hot paths: pooling, buffer reuse, single-copy receive.
17. Zero-copy serialization with Span<T> / Memory<T>.
18. Attribute-driven codegen: the [Networked] model.
19. Multithreading without foot-guns: channels, lock-free counters, live diagnostics.

### Project case studies (lighter, from real work) — LAST
20. Networked physics at Arthur: client-computed, server-distributed.
21. Meta full-body avatar networking at Immersed.
22. Draw calls from ~40 to 1: rendering customized avatars in a UI (PokerVR).
23. One codebase, many platforms: PokerVR's build pipeline.
