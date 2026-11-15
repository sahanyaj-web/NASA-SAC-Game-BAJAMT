# Moonbase Mission Makers

Your challenge is to design and build an interactive game or app that lets kids ages 7–12 manage a lunar or Martian outpost, making real decisions about life support, radiation shielding, power budgeting, food production, and communication delay, and experiencing how those choices play out over the course of a simulated mission.

Think about how your tool can turn genuine mission constraints into gameplay: what does it feel like to trade oxygen reserves for an extra research opportunity, or to reinforce shielding against a radiation event at the cost of tonight's power supply? How will you represent competing resources so that no choice is free, and every decision teaches something true about what astronauts and mission planners actually navigate?

You're encouraged to ground your simulation in real NASA open data wherever possible — for example, using DONKI to reflect actual solar activity and radiation risk, the OSDR for real astronaut health and biological research findings, or Artemis and Mars surface mission data to inform environmental conditions at your chosen site. Incorporating live or archived NASA datasets, rather than fabricated numbers, will make the experience more authentic and give players a genuine window into how mission-critical decisions are made.

Format is open: you could build a resource-management survival game, a narrative-driven decision simulator, a mission-control-style dashboard experience, or something else entirely — browser-based, mobile, or desktop. The goal is a working prototype that demonstrates the trade-off mechanic clearly enough that a young player walks away understanding a real constraint of deep space survival, not just having played a fun game. Creative interpretations of "outpost," "site," or "mission" beyond the Moon and Mars are welcome, provided the underlying educational goal — teaching real engineering trade-offs through play — stays central.

Potential Considerations You may (but are not required to) consider the following:

Audience and Accessibility

Your target audience is kids ages 7–12, but consider whether your tool can flex to engage older siblings, parents, or classroom settings too. Favor plain language over jargon; where a scientific term is unavoidable — radiation dose, microgravity, sol — briefly explain it in-context rather than assuming prior knowledge. Low barrier to entry matters — a browser-playable experience with no download or account required will reach more participants during judging and more students afterward. Grounding in Real Data

Wherever possible, pull from NASA's public APIs and open datasets rather than inventing plausible-sounding numbers—even a small amount of real data—a real radiation reading, a real Mars photo, a real astronaut health finding—makes the experience meaningfully more credible than an entirely simulated one. Clearly attribute your data sources within the tool itself, so players understand they're engaging with real NASA science, not just a themed game. If live API calls aren't feasible during your build window, a curated real dataset embedded directly into your tool is a reasonable and honest alternative—just don't present static data as live. Gameplay and Design Pitfalls to Avoid

Avoid designing a "safe" choice that has no cost—the educational value comes from every decision involving a genuine trade-off, mirroring real mission planning. Don't let visual polish substitute for mechanical accuracy—a simple game that teaches a real constraint beats a beautiful one that doesn't. Avoid overwhelming young players with too many simultaneous systems to track; two or three core resources—life support, power, shielding—are usually more effective than five or six. What Would Make a Solution Stand Out

Tools that let players see the real-world consequences of their in-game choice—linking a radiation-shielding decision to actual current space weather data. Replayability—mechanics or events that vary between playthroughs encourage kids to try different strategies and learn from failure without it feeling punitive. Accompanying a working prototype with a short explanation of which NASA datasets were used and why, making the science traceable and verifiable by judges.-----ask questions if needed

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://moonbase-mission-makers.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/224e42ac-3c1e-574b-a778-e7e3e152c5a4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
