## Update

- We want to completely replace our slow local Stockfish Web Worker analysis with the open-source, free Lichess Cloud Evaluation API to achieve instant, server-side speeds without slowing down user devices.

Please refactor 'hooks/useAnalysisController.ts' and the analysis page data fetching logic with this cloud architecture:

1. CLOUD EVALUATION FETCHING LOGIC:
   - For every move/position in the game, instead of posting a message to a local worker, trigger an asynchronous HTTP GET request to the official free Lichess Cloud Eval endpoint:
     `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(currentFen)}`
   - Wrap this fetch call in a standard try/catch block.

2. API RESPONSE MAPPING:
   - Lichess will return a JSON object containing `pvs` (predicted variations) and `depth`. Extract the evaluation score:
     * If the response contains `cp` (centipawns), convert it to a standard evaluation number (e.g., +1.2 or -0.5).
     * If the response contains `mate`, display it as a forced mate string (e.g., "M4").
   - Map these evaluation deltas into our existing move classification logic (determining if a move is a Book, Best, Brilliant, or Blunder) so our custom 32x32 PNG icons array (`best_32x.png`, `blunder_32x.png`) remains fully functional and visual on the board.

3. LOCAL FALLBACK BACKUP:
   - In case the current FEN position is a highly unique endgame that Lichess doesn't have in their cloud database (which returns a 404 or empty error), implement a lightweight fallback:
   - If the Cloud API fails or returns empty, automatically trigger a fast local calculation hook using a minimal version of our local engine capped strictly at "go depth 10" or "go movetime 150" so the UI never gets stuck waiting.

Refactor the data management system to support this high-speed asynchronous fetch-based analysis flow smoothly.


- For the 'Play with Bot' page ('app/arena-training/play/page.tsx'), we will NOT use Cloud APIs due to latency and rate-limiting. Instead, we must keep the local Stockfish Web Worker but optimize it heavily to act as an adjustable, instant-response AI opponent that consumes near-zero CPU resources.

Please update the bot playing controller layer with the following setup:

1. INSTANT-RESPONSE LIMITS:
   - When it is the Bot's turn to move, never let the engine think deeply. Force it to move within a strict time limit by sending the command: `go movetime 150` (The bot will calculate and respond in exactly 0.15 seconds, making gameplay feel instantaneous and buttery smooth).

2. CONFIGURABLE BOT ELO LEVELS:
   - Create a selection dropdown in the UI for Bot Difficulty:
     * "Bot Pemula (ELO 800)": Send UCI commands: `setoption name Skill Level value 3`
     * "Bot Menengah (ELO 1500)": Send UCI commands: `setoption name Skill Level value 10`
     * "Bot Coach TCO (ELO 2200)": Send UCI commands: `setoption name Skill Level value 20`

3. EXTREME HARDWARE THROTTLING:
   - Ensure the bot worker always runs on:
     * "setoption name Threads value 1"
     * "setoption name Hash value 16" (Minimizes memory foot-print entirely).

Refactor the play page so that playing against the bot feels hyper-responsive, features multiple difficulty settings, and consumes practically zero system resources on mobile web browsers.