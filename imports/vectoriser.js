import { UniversalSentenceEncoder } from "./use.js";
import * as tf from "./tf.js";
import { use_vocab } from "./vocab.js";
import { use_model } from "./model.js";
import { use_weights } from "./weights.js";
import fs from 'fs'


function toArrayBuffer(buffer) {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

const weights_buffer = Buffer.from(use_weights, 'base64');
const weights_array_buffer = toArrayBuffer(weights_buffer)


const model = tf.loadGraphModelSync([use_model,weights_array_buffer]);
const use = new UniversalSentenceEncoder(model, use_vocab);

function fnv1aHash(str) {
  let hash = 2166136261; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
      hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

async function embedJSON(inputFile){
  console.log("Embedding json...")
  const arr = JSON.parse(fs.readFileSync(inputFile, 'utf8'))
  const results = []
  for(const item of arr){
      const tensor = await use.embed(item.description)
      const vectors = tensor.arraySync()
      const vector = vectors[0]
      const hash = item.emoji ? fnv1aHash(item.movie+item.emoji) : fnv1aHash(item.movie)
      const embedding = vector.map(k=>k.toFixed(8)).join(",")
      const obj = {
        ...item,
        hash,
        embedding
      }
      console.log("Got new obj",obj)
      results.push(obj)
  }

  fs.writeFileSync(
    "./movies_emoji.json", 
    JSON.stringify(results, null, 2)
  );
  
}

embedJSON("all_emoji.json")