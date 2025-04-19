import { Movie } from '../libs/types.js';
import { predict_next_letter } from './model.js';

import untyped_movies from "./movies_all.json" with {type: "json"};
const movies = untyped_movies as Array<Movie>

export async function getMovie(seen:string[]):Promise<{selected:Movie,similar:Array<string>}>{ 
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
    return {selected:selected,similar:selected.similar}
}

export async function getNextLetter(currentLetters:string):Promise<[string,string]>{
  
  // console.log(process.versions)
  console.log(process.arch)
  console.log(process.platform)
  console.log("Memory before loading in MB: ",(process.memoryUsage().heapTotal/1024/1024).toFixed(2),"/",(process.memoryUsage().heapUsed/1024/1024).toFixed(2))
  console.log(process.memoryUsage())
  
  const [letter,word] = predict_next_letter(currentLetters)
  console.log("Memory after prediction in MB: ",(process.memoryUsage().heapTotal/1024/1024).toFixed(2),"/",(process.memoryUsage().heapUsed/1024/1024).toFixed(2))
  console.log(process.memoryUsage())
  return [letter,word]
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
