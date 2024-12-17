import {Devvit} from '@devvit/public-api'
import { GameNavigation } from '../libs/types.js'
import { Description } from '../components/description.js';
import { Letters } from '../components/letters.js';
import { Answer } from '../components/answer.js';
import { Difficulty } from '../components/difficulty.js';

export const Game = ({clicked,dimensions,guess,message,addLetter,setPage,setIndex,pageIndex}: GameNavigation)=>{
    return (
    <zstack height="100%" width="100%" backgroundColor='#570606'>
      <image url="starburst.jpg" imageHeight="1000px" imageWidth="650px" height="100%" width="100%" resizeMode='cover'></image> 
       <vstack height="100%" width="100%" gap="small" alignment="center middle">
       {message !== null && message.difficulty!== null && <Difficulty progress={message.difficulty}></Difficulty>}
       {message !== null && message.selected!== null && <Answer name={message.selected.name} guess={guess}></Answer>}
        <zstack alignment="center middle">
            <image url="background.png" imageHeight={dimensions.height/2.5} imageWidth={dimensions.width/1.1} resizeMode='fill'></image> 
            {message !== null && message.selected!== null && <Description height={dimensions.height/2.25} width={dimensions.width/1.25} text={message.selected.description}></Description>}
        </zstack>
        {message !== null && message.selected!== null && <Letters clicked={clicked} actual={message.selected.name} similar={message.similar.map(e=>e.name)} guess={guess} addLetter={addLetter}></Letters>}
        <hstack gap='medium'>
            <button appearance="media" onPress={() => {addLetter(null);setPage('cover')} }>
                🏠 Back Home
            </button>
            <button appearance="secondary" onPress={() => {addLetter(null);setPage('bonus');}}>
                💡 Bonus Round!
            </button>
            <button appearance="media" onPress={() => {addLetter(null);setIndex(pageIndex+1)}}>
                🍿 Skip...
            </button>
        </hstack>
      </vstack>
    </zstack>)
};


