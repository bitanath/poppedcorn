import {Devvit, useState} from '@devvit/public-api'
import { GameNavigation } from '../libs/types.js'
import { Description } from '../components/description.js';
import { Letters } from '../components/letters.js';
import { Answer } from '../components/answer.js';
import { Difficulty } from '../components/difficulty.js';
import { Interstitial } from '../components/interstitial.js';
import { PixelText } from '../libs/pixels.js';
import { Emoji } from '../components/emoji.js';

export const Game = ({clicked,dimensions,guess,message,addLetter,setPage,setIndex,pageIndex, loading,isCelebrating}: GameNavigation)=>{
    let [emojiMode,setEmojiMode] = useState(false)
    if(!isCelebrating && loading)
        return (
            <zstack height="100%" width="100%" backgroundColor='#570606' alignment='center middle'>
                <image url="starburst.jpg" imageHeight="1000px" imageWidth="650px" height="100%" width="100%" resizeMode='cover'></image> 
                <image url="popcorntime.gif" imageWidth={150} imageHeight={150} resizeMode='fit'></image>
            </zstack>
    )
    else
    return (
    <zstack height="100%" width="100%" backgroundColor='#570606'>
      <image url="starburst.jpg" imageHeight="1000px" imageWidth="650px" height="100%" width="100%" resizeMode='cover'></image> 
       <vstack height="100%" width="100%" gap="small" alignment="center middle">
       {message !== null && !isCelebrating && <Difficulty progress={message.difficulty}></Difficulty>}
       {message !== null && !isCelebrating && <Answer name={message.selected.name} guess={guess}></Answer>}
       {!isCelebrating && <zstack alignment="center middle">
            <image url="pixelitanime.gif" imageHeight={dimensions.height/2.5} imageWidth={dimensions.width/1.1} resizeMode='fill'></image>
            {message && !emojiMode && <Description height={dimensions.height/2.25} width={dimensions.width/1.25} text={message.selected.description}></Description>}
            {message && emojiMode && <Emoji emoji={message.emoji} height={dimensions.height/2.25} width={dimensions.width/1.25}></Emoji>}
        </zstack>}
        {message !== null && !isCelebrating && <Letters clicked={clicked} actual={message.selected.name} similar={message.similar} guess={guess} addLetter={addLetter}></Letters>}
        {!isCelebrating && message != null &&
            <hstack gap='medium'>
                <button appearance="media" onPress={() => {addLetter(null);setPage('cover')} }>
                    🏠 Home
                </button>
                <button appearance={emojiMode?"destructive":"secondary"} onPress={() => {setEmojiMode(!emojiMode)} }>
                    💡 Emojify
                </button>
                <button appearance="media" onPress={() => {addLetter(null);setIndex(pageIndex+1)}}>
                    🍿 Skip...
                </button>
            </hstack>
        }
      </vstack>
      {isCelebrating && 
        <vstack alignment='top center' height="100%" width="100%">
            <spacer size="medium"></spacer>
            {message !== null && <vstack backgroundColor='#FFD5C6' cornerRadius='full' width='80%' height="24px">
                        <zstack alignment='start middle'>
                            <hstack alignment='start middle' backgroundColor={message.difficulty < 30? "#8B2020" : message.difficulty < 60? "#A66F00" : "#246B32"} width="90%" height="24px" padding='small'>
                                <spacer size='medium' shape='square' />
                            </hstack>
                            <hstack gap='small' alignment='center middle'>
                                <spacer size='large'></spacer>
                                <image url="mcg.gif" imageHeight="16px" imageWidth="16px" resizeMode='fit'></image> 
                                <hstack gap='small'>
                                    <PixelText color='white' size={1}>Added</PixelText>
                                    <PixelText color='white' size={1}>{message.difficulty < 30? "3" : message.difficulty < 60? "2" : "1"}</PixelText>
                                    <PixelText color='white' size={1}>{"points to leaderboard for solving on"}</PixelText>
                                    <PixelText color='white' size={1}>{message.difficulty < 30? "HARD" : message.difficulty < 60? "MODERATE" : "EASY"}</PixelText>
                                    <PixelText color='white' size={1}>difficulty!</PixelText>
                                </hstack>
                                <spacer size='large'></spacer>
                            </hstack>
                        </zstack>
                      </vstack>}
            <spacer size="small"></spacer>
            {message !== null && <Answer name={message.selected.name} guess={guess}></Answer>}
        </vstack>
      }
      {isCelebrating && <image url="confetti.gif" imageWidth={512} imageHeight={512} width="100%" height="100%" resizeMode='cover'></image>}
      {isCelebrating && 
        <vstack alignment='middle center' height="100%" width="100%" gap="small">
            <zstack padding='small' alignment='center middle'>
                {<image url="pixelit.png" imageHeight={dimensions.height/2.2} imageWidth={dimensions.width/1.075} resizeMode='fill'></image>}
                {message !== null && isCelebrating && <Interstitial height={dimensions.height/2.15} width={dimensions.width/1.15} movie={message.selected.name} description={message.selected.funfact} loading={loading}></Interstitial>}
            </zstack>
            <spacer size='small'></spacer>
            <hstack gap='small'>
                <button size='medium' icon='share-new' disabled={loading} appearance="primary" onPress={() => {setIndex(pageIndex+1)} }>Share On Sub</button>
                <button size='medium' icon='forward' disabled={loading} appearance="secondary" onPress={() => {setIndex(pageIndex+1)} }> Pop more 🍿</button>
            </hstack>
            
        </vstack>
      }
      
    </zstack>)
};


