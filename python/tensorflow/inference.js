const tf = require("@tensorflow/tfjs");
const tfn = require("@tensorflow/tfjs-node");


async function loadModel(){
    const handler = tfn.io.fileSystem("./tfjs_layers_model/model.json");
    const model = await tf.loadLayersModel(handler);
    return model
}

const chars = Array.from("\n !$&',-.3:;?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz");
const charToIdx = {};
chars.forEach((char, idx) => {
  charToIdx[char] = idx;
});


function stringToTensor(inputString) {
  const indices = [];
  for (let i = 0; i < inputString.length; i++) {
    const char = inputString[i];
    if (charToIdx[char] !== undefined) {
      indices.push(charToIdx[char]);
    } else {
      indices.push(charToIdx[' ']);
    }
  }
  
  return tf.tensor2d([indices], [1, indices.length]);
}

function idxToChar(idx) {
  return chars[idx];
}

async function generateText(model, startString, generateLength = 100) {
  
  model.resetStates();
  let currentInput = stringToTensor(startString);
  let result = startString;
  
  
  for (let i = 0; i < generateLength; i++) {
    const cinput = await currentInput.data()
    console.log("Predicting using ",cinput,result.slice(-7),result.replace(/\n/ig,' '))
    const predictions = model.predict(currentInput)
    const lastPrediction = predictions.slice([0, predictions.shape[1] - 1, 0], [1, 1, predictions.shape[2]]);
    
    const temperature = 0.25;
    const scaledPredictions = lastPrediction.div(temperature);
    
    const reshaped = scaledPredictions.reshape([scaledPredictions.shape[2]]);
    const predictionId = tf.multinomial(reshaped, 1).dataSync()[0];
    
    const predictedChar = idxToChar(predictionId);
    result += predictedChar;
    currentInput = stringToTensor(result.slice(-7));
    
  }
  
  return result;
}

async function main() {
  try {
    const model = await loadModel();
    
    const startString = 'The';
    const generatedText = await generateText(model, startString);
    
    console.log('\nGenerated Text:');
    console.log(generatedText);
  } catch (error) {
    console.error('Error:', error);
  }
}

main()