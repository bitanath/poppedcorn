## 🍿 Popped Corn - now WIP until we add in more features woot
_<Addiction Epoch> Guess the movie before an AI can_

A Guess The Movie Game with an interesting twist. Over 1000+ blockbuster top grossing movies to guess. Big Box Office Hollywood hits only!

### How to play
- ⬇️ Add game to subreddit from the menu option (visible if you're a mod)
- 🔎 Guess the movie name from the cryptic hint provided
- 🤖 An AI based on a simple Markov Chain tries to fill in the alphabets before you
- 🦾 Guess the name of the movie faster than the AI to Assert Dominance
- 🔐 Movies are Full Names with Numbers converted to Letters (think Star Wars Episode Five - The Empire Strikes Back)
- 💎 Score points and climb up the leaderboard (Top 10 + wherever you are)
- 🍿 Share your progress on the sub, or share random facts and trivia
- Don't like the experience? Toggle Some Preferences or reach out to us via the Sub

### Features
- ⭐️ Design UI based entirely on native Devvit blocks (since this game is exclusively for Reddit consumption, and we're opinionated anti webview -__-)
- 💯+0️⃣ Over a thousand movies to guess and enjoy with manually curated cryptic descriptions, all are popular box office hits
- 👯 Bait movies chosen based on a similarity score assigned by an LLM (you can make two movies from the letters provided)
- 🤷‍♂️ Dynamic difficulty level - Rarely guessed movies make extra points for the leaderboard
- 💡 Movie image hints are AI generated, game artwork is artist made, we use a combination of both for the in game hints in some cases
 
❤️ Built with loads of love, we really hope you love playing the game!

### Additional dependencies for python PIL image to pixel art generator (class Pixelit)
Used to pixel art the hint images. Not directly included in the Devvit custom post.
```shell
pip install blend-modes==2.2.0 #for multiply blend mode on two pillow images
pip install kornia==0.8.0 #for Dexined edge detector
pip install pymeanshift==0.2.2 #best implementation of the mean shift segmentation algo, might need to build from https://github.com/fjean/pymeanshift
```