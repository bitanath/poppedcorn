import {Devvit} from '@devvit/public-api'
import { PixelText } from '../libs/pixels.js'

export function Description(props: {text:string,height:number,width:number}): JSX.Element{
    const lines = breakIntoLines(props.text)
    return (
        <vstack gap='small' height={props.height} width="100%" padding='small'>
            {
                lines.map(line=>(
                    <PixelText size={2}>{line}</PixelText>
                ))
            }
        </vstack>
        )
}

export function breakIntoLines(text: string,maxLength = 36): string[] {
    const words = text.split(' ').filter(word => word.length > 0);
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const nextWord = words[i + 1];
        const wouldExceedLength = (currentLine + (currentLine ? ' ' : '') + word).length > maxLength;
        
        const hasPunctuationPair = word.match(/[.,!?]$/) && 
                                  nextWord?.match(/^[.,!?]/);

        if (!wouldExceedLength && !hasPunctuationPair) {
            currentLine = currentLine ? `${currentLine} ${word}` : word;
        } else {
            
            if (currentLine) {
                lines.push(currentLine);
            }
            currentLine = word;
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}