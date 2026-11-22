# Gilded Hour — Heist at the Meridian Museum

You are **MOTH**, a cat burglar loose in the Meridian Museum at midnight.
Steal every treasure in all three wings — The Gallery, The Vault Hall and
The Crown Room — then slip out through the green EXIT while the alarm climbs.

## How to play

- **WASD / arrow keys** — move. **Shift** — sneak (slower, harder to spot).
- **E (hold)** — take loot at a pedestal, hack a camera terminal, pick the vault lock.
- **Q or click** — throw a coin; nearby guards walk over to investigate the jingle.
- **F** — smoke pellet (2 per wing): breaks line of sight for a few seconds.
- **R** — retry the room. **P** — pause. **M** — mute.

## The rules of the night

- **Amber cones** are guard vision (75°). **Red cones** are cameras, sweeping
  back and forth. **"?"** means a guard is suspicious; **"!"** means a chase.
- Hack terminals sit in camera blind spots, joined to their camera by a glowing
  floor cable. Hold E at one for ~2.5 s and the camera goes dark for 20 s.
- The **alarm meter** has ratchet notches at 35% and 70%: once crossed, the
  alarm never falls below that notch again. Hiding only lets it decay below
  the active notch. At 100% the museum locks down and every guard runs at you.
- Velvet curtains hide you (you show as a translucent silhouette); vents let
  you crawl unseen, slowly. Display cases and walls block sight lines.
- If a guard catches you, the screen tells you exactly who saw you.
- Finish unseen and you earn the **Ghost bonus** (+$5,000).

## Run it

```
node serve.ts        # then open http://localhost:8080
```

No build step, no network: every file the game loads lives under `game/`.
Screenshots are deterministic scenes: open
`?shot=cover|sneak|camera|getaway&seed=1`.

Made for the make.fun bounty
[best-heist-game-20261122-0559](https://make.fun/bounty/best-heist-game-20261122-0559).
