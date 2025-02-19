import { Devvit, RedditAPIClient, RichTextBuilder } from "@devvit/public-api";

export async function postAchievement(reddit:RedditAPIClient,submission:string){
    
    const post = await reddit.submitPost({
           subredditName: 'poppedcorn',
           title: 'Hello World',
           richtext: new RichTextBuilder()
             .heading({ level: 1 }, (h) => {
               h.rawText('Hello world');
             })
             .codeBlock({}, (cb) => cb.rawText('This post was created via the Devvit API'))
    });
}