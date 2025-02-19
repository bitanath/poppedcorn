import {Devvit} from '@devvit/public-api'
import { PixelText } from '../libs/pixels.js'

export function Emoji(props: {emoji:string[],height:number,width:number}): JSX.Element{
    if(props.emoji.length < 4)
        return (<PixelText size={4}>Image Hint Here</PixelText>)
    else
    return (
        <hstack gap='large' alignment='center middle'>
            <vstack gap='small' height={props.height} width="25%" padding='small'>
                <text style='heading' weight='bold' size="xxlarge">{props.emoji.slice(0,2).join("")}</text>
                <text style='heading' weight='bold' size="xxlarge">{props.emoji.slice(2,4).join("")}</text>
            </vstack>
            <vstack gap='none' height={props.height} width="45%">
                <PixelText size={3}>Image Hint Here</PixelText>
            </vstack>
            <vstack gap='small' height={props.height} width="25%" padding='small'>
                <text style='heading' weight='bold' size="xxlarge">{props.emoji.slice(2,4).join("")}</text>
                <text style='heading' weight='bold' size="xxlarge">{props.emoji.slice(0,2).join("")}</text>
            </vstack>
        </hstack>
        
        )
}