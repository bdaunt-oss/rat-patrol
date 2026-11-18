# Rat Patrol

A small subway arena shooter starring a girl in a Fordham sweatshirt inspired by the movement and shooting controls of Journey of the Prairie King. All graphics are original, drawn in code.

Author: Bernie Daunt

## Play

Download the repository using **Code → Download ZIP**, unzip it, then follow the instructions below.
Open `dist/index.html` in a desktop browser. No installation or packages are required. Internet access is optional (used only for display fonts).

- WASD: move. Hold two keys for diagonal movement.
- Arrow keys: shoot. Hold to fire continuously; combine arrows for diagonal shots.
- Survive 60 seconds in stages 1 and 2, then defeat the Rat King in stage 3. A rat touch ends the run unless shielded.
- P: pause/resume. Enter: start/restart. Losing browser focus automatically pauses.

Enemies enter around the arena fence and chase you. Their arrival rate gradually increases. Restart to play again.

Complete three stages: two survival arenas followed by a boss fight.

## Coins and power-ups
Walk over gold coins to collect them; the top-right counter tracks your total for the current run. Coins appear every 7–10 seconds toward a distant edge and disappear after 7 seconds. Rats have a 12% chance of dropping a coin that lasts 5 seconds. At most three coins can be on the arena at once.

Glowing power-ups appear after 14 seconds, then every 17–21 seconds, cycling through shield (S), speed (»), and rapid fire (R). Walk over one to activate it for 8 seconds. Shields protect from rat contact, speed increases movement, and rapid fire increases shooting rate. Uncollected power-ups disappear after 6 seconds. Active effects and remaining time appear below the arena. Pause freezes all timers; restart resets coins and effects.

Stage 1 is a stylized fictional closed arena inspired by the 1 train station at 59 St–Columbus Circle. Station art is decorative; tracks are outside the playable area.

## Three-stage run
1. 59 St–Columbus Circle: survive 60 seconds.
2. Central Park: survive 60 seconds against faster rats.
3. Rockefeller Center Christmas tree: defeat the Rat King (40 hits). Dodge the boss and red projectiles; it fires faster below half health. Shields protect against the boss and projectiles as well as ordinary rats. Defeating it awards 25 coins and wins the run.

Click Next Stage or press Enter between stages. Coin and defeated-rat totals carry over; loose pickups and active power-ups reset for each stage. Death ends the full run; restart returns to stage 1. Boss stage has no time limit.

## Between-stage upgrade shop
After clearing stages 1 and 2, choose permanent upgrades or continue without buying:
- 5 coins — Quick Step: 10% faster movement.
- 10 coins — Fast Hands: 25% shorter shooting cooldown.
- 15 coins — Heavy Hitter: double damage against the boss.

Each upgrade can be bought once per run. Purchased upgrades stack with temporary arena power-ups and persist into subsequent stages. The coin counter shows spendable coins; purchases subtract their cost. Unaffordable and owned upgrades are disabled. Death/restart clears purchases. The final boss ends the run with victory.

## Practice
Choose Practice Boss Fight from the menu to jump directly to stage 3.
