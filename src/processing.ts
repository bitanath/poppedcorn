import { Devvit, RedditAPIClient } from "@devvit/public-api";
import { Movie,EmojiMovie,Similar } from "./libs/types.js";
import { getEmojiMovie } from "./server/function.js";

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

export async function getMovieFromEmoji():Promise<{actual:string,description:string,similar:Array<string>,emoji:string}>{
    const {selected,similar}:{selected:EmojiMovie,similar:Array<Similar>} = await getEmojiMovie()
    const actual = selected.name as string
    const {emoji,description} = selected
    const result = {actual,emoji,description: description as string,similar:similar.map(s=>s.name)}
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
        
        const similar = results.length > 1 ? results.map(e=>e.answer) : []
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

export function compareStrings(str1: string, str2: string): boolean {
    const shorterLength = Math.min(str1.length, str2.length);
    let mismatched = false
    for (let i = 0; i < shorterLength; i++) {
        if(mismatched){
            return true;
        }
        if (str1[i] !== str2[i]) {
            mismatched = true;
        }
    }

    return false
}