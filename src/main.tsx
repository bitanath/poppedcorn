// Learn more at developers.reddit.com/docs
import { Devvit, useAsync, useState } from '@devvit/public-api';
import { getMovie } from './server/function.js';

import { Navigation, Similar,Movie, Leader } from './libs/types.js';
import { Leaderboard } from './pages/leaderboard.js';
import { Cover } from './pages/cover.js';
import { Game } from './pages/game.js';
import { Bonus } from './pages/bonus.js';
import { calculatePercentage,compareStrings,getLeaderboardUsers } from './processing.js';

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
    const [celebration, setCelebration] = useState<boolean>(false)


    const { data: message, loading, error } = useAsync(async () => {
      const user = await _context.reddit.getCurrentUser()
      const username = user?.username || "Guest"
      let moviesSeen:string[] = []
      let selected:Movie
      let similar:Similar[]

      
      if(!user || !user.id){
        //TODO: simply fetch a movie different from the current one
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
          const score = await _context.redis.zScore('leaderboard', user.id)
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
      
      Object.entries(movieMap).forEach(([key, value]) => { total++;solved += parseInt(value); });
      let difficulty = calculatePercentage(solved,total)

      return {username,selected,similar,difficulty}
    },{depends: pageIndex});

    function addLetter(letter:string|null,index?:[number,number]|undefined){
      setCelebration(false)
      if(letter == null){
        setGuess([])
        setClicked([])
      }
      else{
        const newGuess = [...guess,letter]

        if(message && message.selected.name.replace(/[^a-z]/ig,'').toUpperCase() == newGuess.join("").toUpperCase()){
          setCelebration(true)
          setPageIndex(pageIndex+1)
          setGuess([])
          setClicked([])
        }else if(message && compareStrings(message.selected.name.replace(/[^a-z]/ig,'').toUpperCase(),newGuess.join("").toUpperCase())){
          let array = JSON.parse(JSON.stringify(newGuess));
          let spliced = [...array.slice(0, -2), array[array.length - 1]]
          
          if(message.selected.name.replace(/[^a-z]/ig,'').toUpperCase().startsWith(spliced.join("").toUpperCase())){
            setGuess(spliced)
            index && setClicked([...clicked.slice(0, -1),index])
          }else{
            setGuess([])
            setClicked([])
            showToast("WHOOPS: You're going down the wrong track. Resetting all Letters! Please guess again.")
          }
        }else{
          setGuess(newGuess)
          index && setClicked([...clicked,index])
          if(!hinted){
            showToast("NOTE: Please guess the Full movie name with Numbers in English (example...Jaws Two)")
            setHinted(true)
          }
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
      default:
        return (
          <zstack width="100%" height="100%" alignment='center middle'>
            <Game pageIndex={pageIndex} setIndex={setPageIndex} loading={loading} dimensions={dimensions} setPage={setPage} addLetter={addLetter} guess={guess} message={message} version={version} clicked={clicked}></Game>
            {celebration && loading && <image url="confetti.gif" imageWidth={512} imageHeight={512} width="100%" height="100%" resizeMode='cover'></image>}
            {!celebration && loading && <image url="popcorntime.gif" imageWidth={150} imageHeight={150} resizeMode='fit'></image>}
          </zstack>
        )
    }
    
  },
});

export default Devvit;
