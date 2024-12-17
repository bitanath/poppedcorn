import {Devvit, useAsync, useState} from '@devvit/public-api';
import { Description } from '../components/description.js';
import { NavigationPages,GameNavigation, BonusNavigation } from '../libs/types.js';
import { getMovieFromFilmPlotBadly, compareStrings, getMovieFromEmoji } from '../processing.js';
import { PixelText } from '../libs/pixels.js';
import { Letters } from '../components/letters.js';
import { Answer } from '../components/answer.js';



export function Bonus({context,dimensions,setPage}: BonusNavigation): JSX.Element{
    //Click variables    
    const [index,setIndex] = useState(1)
    const [guess, setGuess] = useState<Array<string>>([])
    const [clicked,setClicked] = useState<Array<[number,number]>>([])
    const [celebration, setCelebration] = useState<boolean>(false)
    const [emojiMode,setEmojiMode] = useState(false)

    const { data: message, loading, error } = useAsync(async () => {
        const {actual,similar,description} = await getMovieFromFilmPlotBadly(context,index,message?.actual)
        const emoji = await getMovieFromEmoji()
        return {actual,similar,description,emoji}   
    },{depends:index})

    function addLetter(letter:string|null,position?:[number,number]|undefined){
        setCelebration(false)
        if(letter == null){
          setGuess([])
          setClicked([])
        }
        else{
          const newGuess = [...guess,letter]
          const actual = emojiMode && message ? message.emoji.actual : message ? message.actual : ""
          if(message && actual.replace(/[^a-z]/ig,'').toUpperCase() == newGuess.join("").toUpperCase()){
            setCelebration(true)
            setIndex(index+1)
            setGuess([])
            setClicked([])
          }else if(message && compareStrings(actual.replace(/[^a-z]/ig,'').toUpperCase(),newGuess.join("").toUpperCase())){
            let array = JSON.parse(JSON.stringify(newGuess));
            let spliced = [...array.slice(0, -2), array[array.length - 1]]
            
            if(message.actual.replace(/[^a-z]/ig,'').toUpperCase().startsWith(spliced.join("").toUpperCase())){
              setGuess(spliced)
              position && setClicked([...clicked.slice(0, -1),position])
            }else{
              setGuess([])
              setClicked([])
            }
          }else{
            setGuess(newGuess)
            position && setClicked([...clicked,position])
          }
        }
    }

    if(!celebration && loading)
        return (
            <zstack height="100%" width="100%" backgroundColor='#570606' alignment='center middle'>
                <image url="starburst.jpg" imageHeight="1000px" imageWidth="650px" height="100%" width="100%" resizeMode='cover'></image> 
                <image url="popcorntime.gif" imageWidth={150} imageHeight={150} resizeMode='fit'></image>
            </zstack>
        )
    else
        return (
            <zstack height="100%" width="100%" backgroundColor='#570606' alignment='center middle'>
                <image url="starburst.jpg" imageHeight="1000px" imageWidth="650px" height="100%" width="100%" resizeMode='cover'></image> 
                <vstack alignment='center middle' width="100%" height="100%">
                    <PixelText color='white' size={3}>BONUS ROUND QUESTION FROM: </PixelText>
                    <spacer size='small'></spacer>
                    <hstack gap="small">
                        {!emojiMode && <PixelText size={3} color="#ff4500">r/ExplainAFilmPlotBadly</PixelText>}
                        {emojiMode && <PixelText size={3} color="#ff4500">MOVIES TO EMOJI</PixelText>}
                        <PixelText size={3} color="#ff4500">_</PixelText>
                    </hstack>
                    {!emojiMode && message && <Answer name={message.actual} guess={guess}></Answer>}
                    {emojiMode && message && <Answer name={message.emoji.actual} guess={guess}></Answer>}
                    {!emojiMode && <zstack alignment="center middle">
                        <image url="background.png" imageHeight={dimensions.height/2.5} imageWidth={dimensions.width/1.1} resizeMode='fill'></image> 
                        {message && message.description && <Description height={dimensions.height/2.25} width={dimensions.width/1.25} text={message.description}></Description>}
                    </zstack>}
                    {emojiMode && <zstack alignment="center middle">
                        <image url="background.png" imageHeight={dimensions.height/2.5} imageWidth={dimensions.width/1.1} resizeMode='fill'></image> 
                        {message && message.emoji && <hstack height={dimensions.height/2.25} width={dimensions.width/1.25}><text style='heading' weight='bold' size="xxlarge">{message.emoji.emoji}</text></hstack>}
                    </zstack>}

                    {!emojiMode && message && <Letters clicked={clicked} actual={message.actual} similar={message.similar} guess={guess} addLetter={addLetter} ></Letters>}
                    {emojiMode && message && <Letters clicked={clicked} actual={message.emoji.actual} similar={message.emoji.similar} guess={guess} addLetter={addLetter} ></Letters>}
                    <spacer size='medium'></spacer>
                    <hstack gap='medium'>
                        <button appearance="media" onPress={() => setPage('cover') }>
                            🏠 Back Home
                        </button>
                        <button appearance={emojiMode ? "destructive" : "primary" } onPress={() => {
                                addLetter(null)
                                setEmojiMode(!emojiMode);
                            }}>
                            😎 Emoji Round!
                        </button>
                        <button appearance="media" onPress={()=> {setCelebration(false);setIndex(index+1);}}>
                            🍿 Pop Some More...
                        </button>
                    </hstack>
                </vstack>
                {celebration && loading && <image url="confetti.gif" imageWidth={512} imageHeight={512} width="100%" height="100%" resizeMode='cover'></image>}
            </zstack>
        )
}