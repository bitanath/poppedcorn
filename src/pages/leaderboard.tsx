import {Devvit, useState, useAsync, RedditAPIClient,RedisClient} from '@devvit/public-api'
import { Leader } from '../libs/types.js';
import { PixelText } from '../libs/pixels.js';
import { NavigationPages } from '../libs/types.js';
import { getLeaderboardUsers } from '../processing.js';


export const Leaderboard = ({reddit,redis,pager,navigation}: {reddit:RedditAPIClient;redis:RedisClient;pager:(name:NavigationPages)=>void;navigation:(url:string)=>void})=>{
    const [index,setIndex] = useState(0)

    const { data: message, loading, error } = useAsync(async () => {
        const user = await reddit.getCurrentUser()
        const leaders = await redis.zRange('leaderboard', 0, 9, { by: 'rank' });
        let leaderboard
        if(!user){
            leaderboard = await getLeaderboardUsers(reddit,leaders,undefined,0,0)
        }else{
            const rank = await  redis.zRank('leaderboard',user.id)
            const score = await redis.zScore('leaderboard',user.id)
            leaderboard = await getLeaderboardUsers(reddit,leaders,user.id,rank||0,score||0)
        }
        leaderboard = leaderboard.sort((a,b)=>b.score - a.score)
        
        return {leaderboard}
    },{depends:index})

    if(!loading)
    return (
    <zstack height="100%" width="100%" backgroundColor='#570606' alignment='center middle'>
      <image url="starburst.jpg" imageHeight="1000px" imageWidth="650px" height="100%" width="100%" resizeMode='cover'></image> 
      <vstack gap="small" height="100%" width="100%" alignment='center middle'>
            <vstack height="80%" width="80%" gap="none" alignment="center" backgroundColor='#00000055' cornerRadius='large'>
                <hstack height="15%" width="100%" gap="small" alignment='center middle' cornerRadius='none' backgroundColor='#00000022'>
                        <spacer size='small'></spacer>
                        <PixelText color='white' size={4}>TOP 10 LEADERBOARD</PixelText>
                        <spacer size='small'></spacer>
                </hstack>
                <vstack alignment='center top' height="100%" width="100%">
                {
                    message && message.leaderboard.map((leader,index)=>{
                        return (<hstack height="10%" width="100%" gap="small" alignment='start middle' cornerRadius='none' backgroundColor={index%2 === 0 ? '#00000088' : '#00000022'}>
                            <spacer size='small'></spacer>
                            <PixelText color='white' size={3}>{leader.rank.toFixed(0)+"."}</PixelText>
                            <spacer size='large'></spacer>
                            <image url={leader.avatar} onPress={()=>navigation(leader.url)} imageWidth={18} imageHeight={18} resizeMode='fit'></image>
                            <PixelText color='white' size={leader.name.length < 9 ? 3 : leader.name.length < 18 ? 2 : 1}>{"u/"+leader.name}</PixelText>
                            <spacer size='large'></spacer>
                            <spacer size='large'></spacer>
                            <PixelText color='white' size={3}>{leader.score.toFixed(0)}</PixelText>
                            {index == 0 && <image url="gold_trophy.png" imageWidth={20} imageHeight={20} resizeMode='fit'></image>}
                            {index == 1 && <image url="silver_trophy.png" imageWidth={20} imageHeight={20} resizeMode='fit'></image>}
                            {index == 2 && <image url="bronze_trophy.png" imageWidth={20} imageHeight={20} resizeMode='fit'></image>}
                        </hstack>)
                    })
                }
                </vstack>
            </vstack>
            <hstack gap="medium" alignment='center middle'>
                <button appearance="media" onPress={() => pager("cover")}>
                    🏠 Back Home
                </button>
                <button appearance="primary" onPress={() => setIndex(index+1)}>
                    🔄 Refresh Leaderboard
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


