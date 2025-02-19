import {Devvit} from '@devvit/public-api'
import { PixelText } from '../libs/pixels.js'

export function Difficulty(props: {progress:number}): JSX.Element{
    return (
          <vstack backgroundColor='#FFD5C6' cornerRadius='full' width='80%' height="24px">
            <zstack alignment='start middle'>
                <hstack alignment='start middle' backgroundColor={props.progress < 30? "#8B2020" : props.progress < 60? "#A66F00" : "#246B32"} width={`${props.progress}%`} height="24px" padding='small'>
                    <spacer size='medium' shape='square' />
                </hstack>
                <hstack gap='small' alignment='center middle'>
                    <spacer size='large'></spacer>
                    <image url={props.progress < 30? "gold_trophy.png" : props.progress < 60? "silver_trophy.png" : "bronze_trophy.png"} imageHeight="16px" imageWidth="16px" resizeMode='fit'></image> 
                    <hstack gap='small'>
                        <PixelText color='black' size={1}>{props.progress < 30? "HARD" : props.progress < 60? "MODERATE" : "EASY"}</PixelText>
                        <PixelText color='black' size={1}>{"("+props.progress.toFixed(0)+"%solved)"}</PixelText>
                    </hstack>
                    
                    <spacer></spacer>
                </hstack>
                
            </zstack>
          </vstack>
      )
}