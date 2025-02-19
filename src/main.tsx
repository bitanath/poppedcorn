// Learn more at developers.reddit.com/docs
import { Devvit, useAsync, useState } from '@devvit/public-api';
import { getMovie } from './server/function.js';

import { Navigation, Similar,Movie, Leader } from './libs/types.js';
import { Leaderboard } from './pages/leaderboard.js';
import { Cover } from './pages/cover.js';
import { Game } from './pages/game.js';
import { Bonus } from './pages/bonus.js';
import { calculatePercentage,compareStrings,getLeaderboardUsers } from './processing.js';
import { HowTo } from './pages/howto.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
  http: true
});

// Add a menu item to the subreddit menu for instantiating the new experience post
Devvit.addMenuItem({
  label: 'Add Poppedcorn to Subreddit',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    await reddit.submitPost({
      title: 'Guess the movie from the cryptic description!!',
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading Game...</text>
        </vstack>
      ),
    });
    ui.showToast({ text: 'Created post!' });
  },
});

// Add a post type definition
Devvit.addCustomPostType({
  name: 'Popped Corn Game',
  height: 'tall',
  render: (_context) => {
    //Navigation variables
    const version = _context.appVersion
    const dimensions = _context.dimensions || {width: 456, height: 320}
    const [page,setPage] = useState('cover')
    const [pageIndex,setPageIndex] = useState(0)

    //State variables
    const [guess, setGuess] = useState<Array<string>>([])
    const [clicked,setClicked] = useState<Array<[number,number]>>([])
    const [hinted, setHinted] = useState<boolean>(false)
    const [hints,setHints] = useState(0)
    const [celebration, setCelebration] = useState<boolean>(false)


    const { data: message, loading, error } = useAsync(async () => {
      const user = await _context.reddit.getCurrentUser()
      const username = user?.username || "Guest"
      let moviesSeen:string[] = []
      let selected:Movie
      let similar:string[]
      let rank:number|undefined = undefined
      let score:number|undefined = undefined
      let emoji:string[] = []
      
      if(!user || !user.id){
        //NOTE: simply fetch a movie different from the current one
        const currentMovie = message?.selected.hash
        if(currentMovie){moviesSeen.push(currentMovie)}
        const returnedMovie = await getMovie(moviesSeen) 
        selected = returnedMovie.selected
        similar = returnedMovie.similar
      }else{
        moviesSeen = await _context.redis.hKeys(user.id)
        if(celebration && message && message.selected){
          await _context.redis.hSet(user?.id,{[message.selected.hash]:'1'})
          await _context.redis.hSet(message.selected.hash,{[user.id]:'1'}) 
          score = await _context.redis.zScore('leaderboard', user.id)
          rank = await _context.redis.zRank('leaderboard',user.id)
          const increment = message.difficulty < 30 ? 3 : message.difficulty < 60 ? 2 : 1
          if(!score){
            await _context.redis.zAdd('leaderboard',{member:user.id,score:increment})
          }else{
            await _context.redis.zIncrBy('leaderboard',user.id,increment)
          }
        }
        const returnedMovie = await getMovie(moviesSeen) //movie is guaranteed to be one that user hasnt seen before, or restarted after list is over
        selected = returnedMovie.selected
        similar = returnedMovie.similar
        await _context.redis.hSet(user?.id,{[selected.hash]:'0'})
        await _context.redis.hSet(selected.hash,{[user.id]:'0'}) //0 is unsolved, 1 is solved
        
      }
      
      const movieMap = await _context.redis.hGetAll(selected.hash)
      let total = 1,solved = 1
      
      Object.entries(movieMap).forEach(([_, value]) => { total++;solved += parseInt(value); });
      let difficulty = calculatePercentage(solved,total)
      score = score ? score : 0
      rank = rank ? rank : 0
      emoji = selected.emoji

      return {username,selected,similar,emoji,difficulty,score,rank}
    },{depends: pageIndex, finally: ()=>{
        addLetter(null)
    }});

    function addLetter(letter:string|null,index?:[number,number]|undefined){
      setCelebration(false)
      if(letter == null){
        setHints(0)
        setGuess([])
        setClicked([])
      }
      else{
        const newGuess = [...guess,letter]
        const replacedName = message!.selected.name.replace(/[^a-z]/ig,'')

        if(replacedName.toUpperCase() == newGuess.join("").toUpperCase()){
          setGuess(newGuess)
          index && setClicked([...clicked,index])
          setCelebration(true)
        }else if(compareStrings(replacedName.toUpperCase(),newGuess.join("").toUpperCase())){

          let array = JSON.parse(JSON.stringify(newGuess));
          let spliced = [...array.slice(0, -2), array[array.length - 1]] //TODO: remove the second last letter instead of the last to handle typos
          
          if(replacedName.toUpperCase().startsWith(spliced.join("").toUpperCase())){
            replacedName.toUpperCase() == spliced.join("").toUpperCase() ? setCelebration(true) : setCelebration(false)
            setGuess(spliced)
            index && setClicked([...clicked.slice(0, -1),index])
          }else{
            setGuess([])
            setClicked([])
            if(!hinted){
              showToast("NOTE: Guess Full Name with numbers (example...Jaws Two)")
              setHinted(true)
            }else{
              showToast("WHOOPS: Going down the wrong track. Resetting all Letters!")
            }
          }
        }else{
          setGuess(newGuess)
          index && setClicked([...clicked,index])
        }
      }
    }

    function openLink(url:string){
      _context.ui.navigateTo(url)
    }

    function showToast(message:string){
      _context.ui.showToast(message)
    }
    
    switch(page){
      case 'cover': 
        return (<Cover setPage={setPage} message={message} loading={loading} version={version}></Cover>)
      case 'leaderboard':
        return (<Leaderboard reddit={_context.reddit} redis={_context.redis} pager={setPage} navigation={openLink}></Leaderboard>)
      case 'bonus':
        return (<Bonus setPage={setPage} dimensions={dimensions} context={_context.reddit}></Bonus>)
      case 'howto':
        return (<HowTo pager={setPage} dimensions={dimensions}></HowTo>)
      default:
        return (<Game pageIndex={pageIndex} setIndex={setPageIndex} loading={loading} dimensions={dimensions} setPage={setPage} addLetter={addLetter} guess={guess} message={message} version={version} clicked={clicked} isCelebrating={celebration}></Game>)
    }
    
  },
});

export default Devvit;
