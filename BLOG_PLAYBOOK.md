# Blog Playbook — Muhammad Ahmed

Reference for writing the technical blog. Self contained so it can be pasted or tagged in any tool.

**Revive keyword:** `fnvoice` (tag this to reload the plan and continue.)

---

## 1. Purpose

Write technical posts that add real value: the kind that make a concept finally click for the reader. The bar is "these posts taught me, mine will teach others." Every post explains how something actually works, using the real systems I have built (FigNet, Entangle, FnVoice) and shipped projects as the worked example.

Positioning: a technical developer with deep systems understanding, on the road to Tech Lead / CTO. The writing should read human, not AI generated.

---

## 2. Voice and style rules

- First person, plain, direct, teaching tone. A little dry wit is welcome.
- Start from the problem or from honest curiosity ("this was a black box to me"), never from self promotion.
- Explain the WHY of every decision, not just the what.
- Real numbers, small code snippets, and short war stories are what make it read like me and not a textbook.
- Do not credit or mention external reference posts or products we modeled the style on.
- Be careful with sensitive employer figures: prefer percentages over absolute dollar costs.

### Hard rules
- **Never use em dashes (—) anywhere in the writing.** Use commas, colons, or parentheses instead.
- Keep glossary / concept lists as simple bullet lists (easy to digest).
- Use prose for the pipeline / system walkthroughs.

---

## 3. The post template (teaching structure)

Every post follows this shape. Not every section is mandatory, but the order holds.

1. **Hook / intro.** Two to four short paragraphs. Frame the problem or the honest starting point. No preamble, no selling.
2. **What it has to do (the constraints).** A short bullet list of the competing goals or requirements. This gives every later decision a reason to exist.
3. **The vocabulary.** Define only the terms the reader needs for this post, plainly, one idea each, as a bullet list. Cross reference terms in italics where useful.
4. **The system at a glance.** One line or a simple diagram of the whole flow. State the guiding principles ("golden rules") the design follows.
5. **Walk the stages.** Prose, one focused section per stage. Always tie the stage back to the constraints from step 2. Add small code snippets only where they clarify.
6. **The production grade notes.** Threading, performance, portability: what made this real instead of a demo.
7. **What's next.** Tease the follow up posts in the series.

### Pre publish checklist
- [ ] No em dashes anywhere.
- [ ] Glossary is bullets, walkthrough is prose.
- [ ] Every stage answers "why" and ties back to a stated constraint.
- [ ] At least one real number or concrete detail.
- [ ] Reads in my voice, not generic.
- [ ] Sensitive employer numbers softened (percentages, not raw costs).

---

## 4. Series order

1. Networking (FigNet / Entangle) — first
2. Voice (FnVoice) — second
3. Advanced C# / systems — third
4. Project case studies — last

The opener has not been picked yet. "How real-time voice actually works" is drafted but is NOT the opener.

---

## 5. Post backlog (topics)

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
9. How real-time voice actually works (pipeline overview). Drafted, not the opener.
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

---

## 6. Drafted so far

- **How real-time voice actually works (building FnVoice).** Full pipeline overview: the five goals (latency, quality, bandwidth, packet loss, clock skew), vocabulary (signal, sample, sample rate, frame), then capture, VAD, DSP, Opus, network, jitter buffer, decode, playback, plus threading and 7-platform native. Status: content approved, pending 3 fact checks (VAD-before-DSP order, echo cancellation confirmation, exact frame size / sample rate).
