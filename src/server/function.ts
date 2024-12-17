import { Movie,EmojiMovie } from '../libs/types.js';
import { Similar } from '../libs/types.js';
import untyped_movies from "./movies_all.json"
import untyped_emoji_movies from "./movies_emoji.json"
const movies = untyped_movies as Array<Movie>
const movies_emoji = untyped_emoji_movies as Array<EmojiMovie>
const movie_db = movies.map(movie=>{
    const embedding = movie.embedding.split(",").map(parseFloat)
    const obj = {
      embedding,
      name: movie.name,
      description: movie.description,
      hash: movie.hash
    }
    return obj
})

export async function getEmojiMovie():Promise<{selected:EmojiMovie,similar:Array<Similar>}>{
  let index = parseInt((Math.random() * movies_emoji.length).toFixed(0))
  let selected:EmojiMovie = movies_emoji[index]
  return {selected:selected,similar:getSimilarMovies(selected)}
}

export async function getMovie(seen:string[]):Promise<{selected:Movie,similar:Array<Similar>}>{ 
    const set1 = new Set(seen);
    const set2 = new Set(movies.map(m=>m.hash))
    const difference = [...set2].filter(x => !set1.has(x));
    let selected:Movie
    if(difference.length == 0){
      //TODO: in case the user has seen all movies previously, return a random one
      const index = parseInt((Math.random() * movies.length).toFixed(0))
      selected = movies[index]
    }else{
      const index = parseInt((Math.random() * difference.length).toFixed(0))
      selected = movies.filter(movie=>movie.hash == difference[index])[0]
    }
    return {selected:selected,similar:getSimilarMovies(selected)}
}

export function getSimilarMovies(movie:Movie|EmojiMovie,limit=3,threshold=0.3){
  const softLimit = 10 //TODO: precursor to the final selected set of movies
  const vector1 = movie.embedding.split(",").map(parseFloat)
  return movie_db.filter(movie=>{
    const vector2 = movie.embedding
    const similarity = cosineSimilarity(vector1,vector2)
    return similarity >= threshold && similarity < 0.99 //filter out self
  }).slice(0,softLimit).map(e=>{
    const {hash,name,description,embedding} = e
    const similarity = cosineSimilarity(vector1,embedding)
    return {hash,name,description,similarity}
  }).sort((a,b)=>b.similarity - a.similarity).slice(0,limit)
}


function cosineSimilarity(vector1:Array<number>, vector2:Array<number>) {
  if (vector1.length !== 512 || vector2.length !== 512) {
    throw new Error("Vectors must be 512-dimensional");
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < 512; i++) {
    dotProduct += vector1[i] * vector2[i];
    norm1 += vector1[i] * vector1[i];
    norm2 += vector2[i] * vector2[i];
  }

  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);

  if (norm1 === 0 || norm2 === 0) {
    return 0;
  }

  return dotProduct / (norm1 * norm2);
}
