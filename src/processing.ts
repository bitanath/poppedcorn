import { Devvit, RedditAPIClient } from "@devvit/public-api";
import { Movie,EmojiMovie,Similar } from "./libs/types.js";
import { getEmojiMovie } from "./server/function.js";
import { Glyphs } from "./libs/pixels.js";

export function fnv1aHash(str:string) {
    let hash = 2166136261; // FNV offset basis
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
}

export function calculatePercentage(value: number, total: number): number {
    const percentage = (value / total) * 100;
    const roundedPercentage = Math.round(percentage / 10) * 10;
    return roundedPercentage;
}

// export async function getMovieFromEmoji():Promise<{actual:string,description:string,similar:Array<string>,emoji:string}>{
//     const {selected,similar}:{selected:EmojiMovie,similar:Array<Similar>} = await getEmojiMovie()
//     const actual = selected.name as string
//     const {emoji,description} = selected
//     const result = {actual,emoji,description: description as string,similar:similar.map(s=>s.name)}
//     return result
// }

export async function getMovieFromEmoji():Promise<{actual:string,description:string,similar:Array<string>,emoji:string}>{
    const {selected,similar}:{selected:EmojiMovie,similar:Array<string>} = await getEmojiMovie()
    const actual = selected.name as string
    const {emoji,description} = selected
    const result = {actual,emoji,description: description as string,similar:similar}
    return result
}

export async function getMovieFromFilmPlotBadly(reddit:RedditAPIClient,index:number,current:string|undefined):Promise<{actual:string,description:string,similar:Array<string>}>{
    //TODO: get movie from the r/ExplainAFilmPlotBadly
    let result:{actual:string,description:string,similar:Array<string>}
    try{
        const listing = reddit.getCommentsByUser({
            username: "FilmPlot_Bot",
            sort: "new",
            pageSize: 100,
            limit: 2000
        })
    
        const allcomments = await listing.get(10*index)
        const regex = /solution is \[here\]\(\/r\/ExplainAFilmPlotBadly\/comments\/(.*?)\/.*?\/(.*?)\//ig
    
        const filtered = allcomments.filter(comment=>{
            return comment.isStickied()
        })

        
        let results = []
        for(const comment of filtered){
            const matchedSolution = [...comment.body.matchAll(regex)].map(match => match.slice(1)).flat()
            
            if(matchedSolution.length < 2){
                continue
            }
            const postId = comment.postId as string
            const [postHash,commentHash] = matchedSolution
            const post = await reddit.getPostById(postId)
            
            const question = post.title || post.body
            if(!question){
                continue
            }
            const solution = await reddit.getCommentById(`t1_${commentHash}`)
            let answer = solution.body
            
            if(!answer||hasNonAlphabeticChars(answer)){
                continue
            }

            if(answer.length > 28){
                continue
            }

            if(question.length > 28*6){
                continue
            }
            
            answer = answer.replace(/[\?;]+/ig,"")

            if(answer === current){
                continue
            }
            
            results.push({question,answer})
        }
        
        // const similar = results.length > 1 ? results.map(e=>e.answer) : []
        const similar:string[] = [] //HACK: only show the required anagram for the movie when quessing from explain film plot badly
        results = results.length > index ? results.slice(index,index+1) : results
        const actual = results[0].answer
        const description = results[0].question
        
        return {actual,similar,description}
    }catch(e){
        console.log("Errored out with ",e)
        result = {actual:"Error! Cannot fetch correctly!",description:"Errored out while querying subreddit", similar: []}
        return result
    }
    
}

function hasNonAlphabeticChars(str:string) {
    if (typeof str !== 'string') {
        throw new Error('Input must be a string');
    }
    if (str.length === 0) {
        return false;
    }

    const regex = /[^A-Za-z\s:;\-\?\,]/;
    return regex.test(str);
}

export async function getLeaderboardUsers(reddit: RedditAPIClient,leaderboard:Array<{member:string;score:number}>,currentUserId:string|undefined,currentUserRank:number, currentUserScore: number){
    let results = [];
    let rank = 1
    let currentUserRanked = leaderboard.filter(leader=>leader.member === currentUserId).length > 0
    
    for(const userObject of leaderboard.sort((a,b)=>b.score-a.score)){
        try{
            const {member,score} = userObject
            const user = await reddit.getUserById(member)
            if(!user){continue}
            const avatar = await user.getSnoovatarUrl() || "https://www.redditstatic.com/avatars/avatar_default_02_FF4500.png"
            
            results.push({
                name: user.username,
                id: user.id,
                url: user.url,
                score: score,
                rank: rank,
                avatar: avatar
            })
            rank++
            
        }catch(e){
            console.log(e)
        } 
    }

    if(!currentUserRanked && currentUserId){
        const user = await reddit.getUserById(currentUserId)
        if(!user){return results}
        const avatar = await user.getSnoovatarUrl() || "https://www.redditstatic.com/avatars/avatar_default_02_FF4500.png"
        results.push({
            name: user.username,
            id: user.id,
            url: user.url,
            score: currentUserScore,
            rank: currentUserRank + 1,
            avatar: avatar
        }) //Replace the last ranked user with the current one
    }

    return results

}

export function compareStrings(name: string, guess: string): boolean {
    const shorterLength = Math.min(name.length+1, guess.length);
    let mismatched = false
    for (let i = 0; i < shorterLength; i++) {
        if(mismatched){
            return true; //HACK: mismatches only happen at the end so this kinda works
        }

        if (name[i] !== guess[i]) {
            mismatched = true;
        }
    }

    return false
}

export const formatRank = (rank:number) => {
    return rank.toFixed(0).toString().padStart(2, ' ') + ".";
};
  

const calculateStringWidth = (text: string): number => {
    return text.split('').reduce((totalWidth: number, char: string) => {
      return totalWidth + (Glyphs[char]?.width ?? 0);
    }, 0);
  };
  
export const formatGlyphText = (inputText: string, maxWidth: number = 120): string => {
    let text = "u/"+inputText
    if (!text) return text;
  
    const ellipsisWidth: number = calculateStringWidth('...');
    let currentWidth: number = calculateStringWidth(text);
  
    //NOTE: If text fits, return as is
    if (currentWidth <= maxWidth) {
        const spacesNeeded: number = maxWidth - currentWidth;
        return text + ' '.repeat(Math.ceil(spacesNeeded / Glyphs['*'].width));
    }
  
    let truncatedText: string = '';
    let width: number = 0;
    
    for (let i = 0; i < text.length; i++) {
      const charWidth: number = Glyphs[text[i]]?.width ?? 0;
      
      if (width + charWidth + ellipsisWidth > maxWidth) {
        return truncatedText + '...';
      }
      
      width += charWidth;
      truncatedText += text[i];
    }

    const spacesNeeded: number = maxWidth - width - 3;
    return truncatedText +"..." + ' '.repeat(Math.ceil(spacesNeeded / Glyphs['*'].width));
};