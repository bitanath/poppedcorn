import {Devvit} from '@devvit/public-api'
import { Navigation } from '../libs/types.js'
import { PixelText } from '../libs/pixels.js';

export const Cover = ({setPage,message,loading,version}: Navigation)=>(
    <zstack height="100%" width="100%" backgroundColor='#570606'>
      <image url="starburst.jpg" imageHeight="1000px" imageWidth="650px" height="100%" width="100%" resizeMode='cover'></image> 
       <vstack height="100%" width="100%" gap='small' alignment="center middle">
       {message && <hstack gap="small"><PixelText size={1} color='white'>👋 Hiyo </PixelText><PixelText size={1} color='#7193FF'>{message.username == "Guest" ? message.username : "u/"+message.username+"!"}</PixelText><PixelText size={1} color='white'>Are you ready to...</PixelText></hstack>}
       <spacer size='large'></spacer>
        <image
          url="logo_no_text.png"
          description="logo"
          imageHeight={384}
          imageWidth={384}
          height="128px"
          width="128px"
        />
        <vstack>
          <PixelText size={6} color='#FFFFFF'>GUESS THAT</PixelText>
          <hstack gap="small">
            <PixelText size={7} color="#FF4500">MOVIE</PixelText>
            <PixelText size={7} color="#FF4500">_</PixelText>
          </hstack>
        </vstack>
        
        <vstack gap="small">
          <PixelText size={2} color="white">From this horrible,</PixelText>
          <hstack gap="medium">
            <PixelText size={2} color="white">terrible, no good </PixelText>
            <PixelText size={2} color="#7193FF">plot summary</PixelText>
          </hstack>
        </vstack>
        <hstack alignment='center'>
        <text size='small'>Ver. {version}</text>
        </hstack>
        <spacer size='large'></spacer>
        <hstack gap="medium">
          <button appearance="secondary" onPress={() => setPage("leaderboard")}>
            ⭐️ Leaderboard
          </button>
          <button appearance="media" onPress={() => {setPage('preferences');}}>
            ⚙️ Preferences
            </button>
          <button appearance="primary" disabled={loading} onPress={() => { setPage("game") }}>
            🍿 Let's Plaaay!
          </button>
        </hstack>
      </vstack>
    </zstack>
   
  );