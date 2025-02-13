import {Devvit} from '@devvit/public-api'
import { PixelText } from '../libs/pixels.js'
import { breakIntoLines } from './description.js'

export function Interstitial(props: {movie:string, description: string, height:number,width:number}): JSX.Element{ 
    const lines = breakIntoLines(props.description, 0.9 * 36 * (props.width - (props.height * 0.5 * 0.75))/(props.width))
    return (
        <vstack alignment='middle start' gap='small' height={props.height} width="100%" padding='small'>
            <hstack gap='none' alignment='start middle' padding='small' width="100%">
                <vstack cornerRadius='small' alignment='start' height="100%">
                    <image url={getImageName(props.movie)} imageWidth={props.height * 0.5 * 0.75} imageHeight={props.height * 0.5} resizeMode='fit' />
                </vstack>
                <spacer size='small'></spacer>
                <vstack gap='small' alignment='start middle' width="100%" height="100%" padding='small'>
                    <spacer size='small'></spacer>
                    {
                        lines.map(line=>(
                            <PixelText size={2}>{line}</PixelText>
                        ))
                    }
                    <spacer size='small'></spacer>
                </vstack>
            </hstack>
            
        </vstack>
        )
}

function getImageName(name:string):string{
    const sanitizedName = name
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
    const filename = `posters/${sanitizedName}.jpg`;
    return filename
}