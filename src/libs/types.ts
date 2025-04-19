import { AsyncError, Devvit, JSONObject, RedditAPIClient } from "@devvit/public-api";

export type Navigation = {
    setPage: (page: NavigationPages) => void;
    message: {username: string,selected: Movie, emoji:string[], similar: Array<any>, difficulty: number, score: number, rank: number} | null;
    loading: boolean;
    version: string;
    dimensions: {width:number,height:number};
}

export type GameNavigation = Navigation & {
    guess: Array<string>;
    addLetter: (letter: string|null) => void;
    setIndex: (index:number) => void;
    isCelebrating: boolean;
    pageIndex: number;
    dimensions: {width: number,height: number};
    clicked: Array<[number,number]>;
}

export type Leader = {
    name: string;
    id:  string;
    url: string;
    score: number;
    rank: number;
    avatar: string;
}

export interface Movie extends JSONObject{
    name: string;
    hash: string;
    description: string;
    embedding: string;
    funfact: string;
    similar: string[];
    emoji: string[];
}

export interface EmojiMovie extends JSONObject{
    emoji: string;
    embedding: string;
    funfact: string;
    similar: string[];
}

export interface Similar extends JSONObject{
    name: string;
    hash: string;
    description: string;
    similarity: number;
}

export type NavigationPages = 'cover' | 'game' | 'leaderboard' | 'preferences' | 'emoji' | 'howto'

