import {Devvit} from '@devvit/public-api'
import { PixelText } from '../libs/pixels.js';
import { NavigationPages } from '../libs/types.js';

export const Preferences = (props: {pager:(name:NavigationPages)=>void,dimensions:{width:number,height:number}}):JSX.Element=>{
    let howTos:object[] = [
        {

        },
        {

        },
        {

        }
    ]
    return (
        <zstack height="100%" width="100%" backgroundColor='#570606'>
            <image url="starburst.jpg" imageHeight="1000px" imageWidth="650px" height="100%" width="100%" resizeMode='cover'></image> 
            <vstack height="100%" width="100%" gap="small" alignment="center middle">
                <vstack height="85%" width="80%" gap="none" alignment="center" backgroundColor='#00000055' cornerRadius='large'>
                    <hstack height="10%" width="100%" gap="small" alignment='center middle' cornerRadius='none' backgroundColor='#00000022'>
                        <spacer size='small'></spacer>
                        <image url="croppedbulb.gif" imageHeight="48px" imageWidth="24px" resizeMode='fit'></image> 
                        <PixelText color='white' size={3}>HOW TO PLAY</PixelText>
                        <image url="croppedbulb.gif" imageHeight="48px" imageWidth="24px" resizeMode='fit'></image> 
                        <spacer size='small'></spacer>
                    </hstack>
                    <vstack alignment='center top' height="100%" width="100%">
                                    {
                                        howTos && howTos.map((direction,index)=>{
                                            return (<hstack height="30%" width="100%" gap="small" alignment='start middle' cornerRadius='none' backgroundColor={index%2 === 0 ? '#00000088' : '#00000022'}>
                                                <hstack width="15%" gap="small" alignment='start middle' cornerRadius='none'>
                                                    <spacer size='small'></spacer>
                                                    <PixelText color='white' size={2}>WIP</PixelText>
                                                </hstack>
                                                <hstack width="85%" gap='small' alignment='center middle' cornerRadius='none'>
                                                    <PixelText color='white' size={2}>Images here</PixelText>
                                                    <spacer size='small'></spacer>
                                                </hstack>
                                            </hstack>)
                                        })
                                    }
                    </vstack>
                    <spacer size='large'></spacer>
                </vstack>
                <hstack gap="medium" alignment='center middle'>
                    <button appearance="media" onPress={() => props.pager("cover")}>
                        🏠 Back Home
                    </button>
                    <button appearance="secondary" onPress={() => props.pager("game")}>
                        🍿 Let's Plaaay!
                    </button>
                </hstack>
            </vstack>
        </zstack>
    )

}