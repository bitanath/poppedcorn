import { torch } from "./tiny-torch/index.js"
import { weights } from "./modelweights.js"

const vocab_size = 27
const embedding_dim = 84 //ideal = 256
const hidden_layers = 168 //ideal = 320

const [charToIndex,indexToChar] = character_converters()
let initialized = false



function character_converters():[Record<string,number>,Record<number,string>]{
    const text = "abcdefghijklmnopqrstuvwxyz";
    const chars = Array.from(new Set(text)).sort();
    chars.unshift('\0');

    const charToIndex:Record<string,number> = {};
    chars.forEach((char, index) => {
        charToIndex[char] = index;
    })

    const indexToChar:Record<number,string> = {};
    chars.forEach((char, index) => {
        indexToChar[index] = char;
    })
    return [charToIndex,indexToChar]
}

export function predict_next_letter(input_string:string):[string,string]{
    const model = new torch.models.SimpleRNN(vocab_size, embedding_dim, hidden_layers)
    if(!initialized){
        console.log("INIT WITH WEIGHTS")
        model.embed.E = torch.tensor(weights["embedding.weight"])
        model.rnn.W_hh = torch.tensor(weights["rnn.W_hh"])
        model.rnn.W_ih = torch.tensor(weights["rnn.W_ih"])
        model.rnn.b_hh = torch.tensor(weights["rnn.b_hh"])
        model.rnn.b_ih = torch.tensor(weights["rnn.b_ih"])
        model.dense.W = torch.transpose(torch.tensor(weights["dense.weight"]),0,1) //NOTE: linear weights stored (vocab_size,hidden_layers) in Pytorch
        model.dense.b = torch.tensor(weights["dense.bias"])
        initialized = true
    }

    const arr = input_string.split('').map(char => charToIndex[char]);
    const tensor = torch.tensor(arr,false,"cpu").unsqueeze(0) //requires_grad is False, device is CPU
    console.log("Memory after loading in MB: ",(process.memoryUsage().heapTotal/1024/1024).toFixed(2),"/",(process.memoryUsage().heapUsed/1024/1024).toFixed(2))

    const prediction = model.forward(tensor)
    const argmaxed = torch.argmax(prediction).data
    const index:number = argmaxed[0]
    const nextLetter:string = indexToChar[index]
    const completedWord:string = input_string+nextLetter
    return [nextLetter,completedWord]
}