import { AsyncError, Devvit, JSONObject, RedditAPIClient } from "@devvit/public-api";

export type Navigation = {
    setPage: (page: NavigationPages) => void;
    message: {username: string,selected: Movie, similar: Array<any>, difficulty: number} | null;
    loading: boolean;
    version: string;
}

export type GameNavigation = Navigation & {
    guess: Array<string>;
    addLetter: (letter: string|null) => void;
    setIndex: (index:number) => void;
    setHints: (hints:number) => void;
    isCelebrating: boolean;
    pageIndex: number;
    dimensions: {width: number,height: number};
    clicked: Array<[number,number]>;
    hints: number;
}

export type BonusNavigation = {
    setPage: (page: NavigationPages) => void;
    dimensions: {width: number,height: number};
    context: RedditAPIClient;
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
}

export interface EmojiMovie extends JSONObject{
    emoji: string;
    embedding: string;
}

export interface Similar extends JSONObject{
    name: string;
    hash: string;
    description: string;
    similarity: number;
}

export type NavigationPages = 'cover' | 'game' | 'leaderboard' | 'bonus' | 'emoji'

