import {Devvit, useState, useAsync, RedditAPIClient,RedisClient} from '@devvit/public-api'
import { Leader } from '../libs/types.js';
import { PixelText } from '../libs/pixels.js';
import { NavigationPages } from '../libs/types.js';
import { getLeaderboardUsers, formatRank, formatGlyphText } from '../processing.js';


export const Leaderboard = ({reddit,redis,pager,navigation}: {reddit:RedditAPIClient;redis:RedisClient;pager:(name:NavigationPages)=>void;navigation:(url:string)=>void})=>{
    const [index,setIndex] = useState(0)

    const { data: message, loading, error } = useAsync(async () => {
        const user = await reddit.getCurrentUser()
        const leaders = await redis.zRange('leaderboard', 0, 9, { by: 'rank',reverse:true });
        const total = await redis.zCard('leaderboard')
        
        let leaderboard
        if(!user){
            leaderboard = await getLeaderboardUsers(reddit,leaders,undefined,0,0)
        }else{
            let rank = await  redis.zRank('leaderboard',user.id)
            let score = await redis.zScore('leaderboard',user.id)
            rank = total-(rank||0) //TODO: calculate effective rank since all redis leaderboard is sorted ascending
            score = score != undefined ? score : 0
            leaderboard = await getLeaderboardUsers(reddit,leaders,user.id,rank,score)
        }
        
        return {leaderboard}
    },{depends:index})

    if(!loading)
    return (
    <zstack height="100%" width="100%" backgroundColor='#570606' alignment='center middle'>
      <image url="starburst.jpg" imageHeight="1000px" imageWidth="650px" height="100%" width="100%" resizeMode='cover'></image> 
      <vstack gap="small" height="100%" width="100%" alignment='center middle'>
            <vstack height="85%" width="80%" gap="none" alignment="center" backgroundColor='#00000055' cornerRadius='large'>
                <hstack height="10%" width="100%" gap="small" alignment='center middle' cornerRadius='none' backgroundColor='#00000022'>
                        <spacer size='small'></spacer>
                        <image url="mcg.gif" imageHeight="32px" imageWidth="32px" resizeMode='fit'></image> 
                        <PixelText color='white' size={3}>TOP 10 LEADERBOARD</PixelText>
                        <image url="mcg.gif" imageHeight="32px" imageWidth="32px" resizeMode='fit'></image> 
                        <spacer size='small'></spacer>
                </hstack>
                <vstack alignment='center top' height="100%" width="100%">
                {
                    message && message.leaderboard.map((leader,index)=>{
                        return (<hstack height="9%" width="100%" gap="small" alignment='start middle' cornerRadius='none' backgroundColor={index%2 === 0 ? '#00000088' : '#00000022'}>
                            <hstack width="85%" gap="small" alignment='start middle' cornerRadius='none'>
                                <spacer size='small'></spacer>
                                <PixelText color='white' size={2}>{formatRank(leader.rank)}</PixelText>
                                <spacer size='medium'></spacer>
                                <image url={leader.avatar} onPress={()=>navigation(leader.url)} imageWidth={18} imageHeight={18} resizeMode='fit'></image>
                                <PixelText color='white' size={2}>{formatGlyphText(leader.name,120)}</PixelText>
                                <spacer size='medium'></spacer>
                            </hstack>
                            <hstack alignment='end middle' width="15%" maxWidth="120px" gap='small'>
                                <PixelText color='white' size={2}>{leader.score.toFixed(0)}</PixelText>
                                {index == 0 && <image url="gold_trophy.png" imageWidth={18} imageHeight={18} resizeMode='fit'></image>}
                                {index == 1 && <image url="silver_trophy.png" imageWidth={18} imageHeight={18} resizeMode='fit'></image>}
                                {index == 2 && <image url="bronze_trophy.png" imageWidth={18} imageHeight={18} resizeMode='fit'></image>}
                                {index > 2 && <spacer size='large'></spacer>}
                                {index <=2 && <spacer size='small'></spacer>}
                            </hstack>
                        </hstack>)
                    })
                }
                </vstack>
            </vstack>
            <hstack gap="medium" alignment='center middle'>
                <button appearance="secondary" onPress={() => pager("cover")}>
                    🏠 Home
                </button>
                <button appearance="media" onPress={() => setIndex(index+1)}>
                    🔄 Refresh
                </button>
            </hstack>
        </vstack>
    </zstack>)
    else
    return (
        <zstack height="100%" width="100%" backgroundColor='#570606' alignment='center middle'>
            <image url="starburst.jpg" imageHeight="1000px" imageWidth="650px" height="100%" width="100%" resizeMode='cover'></image> 
            <image url="popcorntime.gif" imageWidth={150} imageHeight={150} resizeMode='fit'></image>
        </zstack>
    )
}


