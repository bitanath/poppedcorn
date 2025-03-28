/**
 * Hidden Markov Model for Word Completion
 * 
 * This model generates words with some fixed letters and predicts the missing ones
 * based on English letter transition probabilities.
 */

interface TransitionProbabilities {
    [key: string]: number;
  }
  
  interface TransitionMap {
    [key: string]: TransitionProbabilities;
  }
  
  interface WordDictionary {
    [key: number]: string[];
  }
  
  class HiddenMarkovModel {
    private transitions: TransitionMap;
    private initialProbs: TransitionProbabilities;
    private wordsByLength: WordDictionary;
    
    constructor() {
      // Transition probabilities between states (letters)
      this.transitions = {};
      
      // Initial state probabilities
      this.initialProbs = {};
      
      // Dictionary of common English words by length
      this.wordsByLength = {};
      
      // Initialize with some common English letter transitions
      this.initializeModel();
    }
  
    /**
     * Initialize the model with English letter transition probabilities
     */
    private initializeModel(): void {
      // Common English words for training
      const trainingCorpus: string[] = [
        "the", "be", "to", "of", "and", "a", "in", "that", "have", "I", 
        "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
        "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
        "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
        "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
        "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
        "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
        "than", "then", "now", "look", "only", "come", "its", "over", "think", "also"
      ];
      
      // Group words by length for later use
      trainingCorpus.forEach(word => {
        const length: number = word.length;
        if (!this.wordsByLength[length]) {
          this.wordsByLength[length] = [];
        }
        this.wordsByLength[length].push(word);
      });
      
      // Count initial letters
      const initialCounts: { [key: string]: number } = {};
      let totalInitial: number = 0;
      
      // Count transitions
      const transitionCounts: { [key: string]: { [key: string]: number } } = {};
      
      // Process training corpus
      trainingCorpus.forEach(word => {
        // Count initial letter
        const firstLetter: string = word[0].toLowerCase();
        initialCounts[firstLetter] = (initialCounts[firstLetter] || 0) + 1;
        totalInitial++;
        
        // Count transitions
        for (let i = 0; i < word.length - 1; i++) {
          const current: string = word[i].toLowerCase();
          const next: string = word[i + 1].toLowerCase();
          
          if (!transitionCounts[current]) {
            transitionCounts[current] = {};
          }
          
          transitionCounts[current][next] = (transitionCounts[current][next] || 0) + 1;
        }
      });
      
      // Convert counts to probabilities
      for (const letter in initialCounts) {
        this.initialProbs[letter] = initialCounts[letter] / totalInitial;
      }
      
      for (const current in transitionCounts) {
        this.transitions[current] = {};
        let total: number = 0;
        
        // Calculate total transitions from this state
        for (const next in transitionCounts[current]) {
          total += transitionCounts[current][next];
        }
        
        // Convert to probabilities
        for (const next in transitionCounts[current]) {
          this.transitions[current][next] = transitionCounts[current][next] / total;
        }
      }
    }
    
    /**
     * Choose a letter based on probability distribution
     * @param probs - Probability distribution
     * @returns Chosen letter
     */
    private chooseFromDistribution(probs: TransitionProbabilities): string {
      const rand: number = Math.random();
      let cumulativeProb: number = 0;
      
      for (const outcome in probs) {
        cumulativeProb += probs[outcome];
        if (rand < cumulativeProb) {
          return outcome;
        }
      }
      
      // Fallback: return a random letter
      const keys: string[] = Object.keys(probs);
      return keys[Math.floor(Math.random() * keys.length)];
    }
    
    /**
     * Generate a word with some fixed letters
     * @param knownLetters - Array of possible letters at each position (empty array means any letter)
     * @param wordLength - Total length of the word
     * @returns Generated word
     */
    public generateWordWithConstraints(knownLetters: string[][], wordLength: number): string {
      // Validate input
      if (wordLength <= 0) return "";
      if (knownLetters.length > wordLength) {
        knownLetters = knownLetters.slice(0, wordLength);
      }
      
      // Extend knownLetters array if it's shorter than wordLength
      while (knownLetters.length < wordLength) {
        knownLetters.push([]);
      }
      
      // Try to find a real word that matches the constraints
      if (Math.random() < 0.3 && this.wordsByLength[wordLength]) {
        const matchingWords = this.wordsByLength[wordLength].filter(word => {
          for (let i = 0; i < knownLetters.length; i++) {
            if (knownLetters[i].length > 0 && !knownLetters[i].includes(word[i])) {
              return false;
            }
          }
          return true;
        });
        
        if (matchingWords.length > 0) {
          return matchingWords[Math.floor(Math.random() * matchingWords.length)];
        }
      }
      
      // Generate a word using the Markov model with constraints
      let word: string = "";
      
      // Generate the first letter
      if (knownLetters[0].length > 0) {
        // Use one of the known letters for the first position
        word = knownLetters[0][Math.floor(Math.random() * knownLetters[0].length)];
      } else {
        // Choose based on initial probabilities
        word = this.chooseFromDistribution(this.initialProbs);
      }
      
      // Generate the rest of the letters
      for (let i = 1; i < wordLength; i++) {
        const prevLetter = word[i - 1];
        
        if (knownLetters[i].length > 0) {
          // This position has constraints
          if (this.transitions[prevLetter]) {
            // Filter transitions based on constraints
            const possibleNextLetters = knownLetters[i].filter(letter => 
              this.transitions[prevLetter][letter] !== undefined
            );
            
            if (possibleNextLetters.length > 0) {
              // Create a normalized distribution of the possible next letters
              const filteredProbs: TransitionProbabilities = {};
              let totalProb = 0;
              
              possibleNextLetters.forEach(letter => {
                filteredProbs[letter] = this.transitions[prevLetter][letter];
                totalProb += filteredProbs[letter];
              });
              
              // Normalize probabilities
              for (const letter in filteredProbs) {
                filteredProbs[letter] /= totalProb;
              }
              
              word += this.chooseFromDistribution(filteredProbs);
            } else {
              // No valid transitions, just pick one of the constraints
              word += knownLetters[i][Math.floor(Math.random() * knownLetters[i].length)];
            }
          } else {
            // No transitions for previous letter, just pick one of the constraints
            word += knownLetters[i][Math.floor(Math.random() * knownLetters[i].length)];
          }
        } else {
          // No constraints for this position
          if (this.transitions[prevLetter]) {
            word += this.chooseFromDistribution(this.transitions[prevLetter]);
          } else {
            // No transitions for previous letter, pick based on initial probabilities
            word += this.chooseFromDistribution(this.initialProbs);
          }
        }
      }
      
      return word;
    }
    
    /**
     * Generate a sentence with specific word constraints and lengths
     * @param wordConstraints - Array of arrays containing letter constraints for each word
     * @param wordLengths - Array of word lengths
     * @returns Generated sentence
     */
    public generateSentenceWithConstraints(
      wordConstraints: string[][][], 
      wordLengths: number[]
    ): string {
      if (!wordConstraints || !wordLengths || wordConstraints.length === 0 || wordLengths.length === 0) {
        return "";
      }
      
      // Make sure the arrays have the same length
      const numWords = Math.min(wordConstraints.length, wordLengths.length);
      
      const words: string[] = [];
      
      for (let i = 0; i < numWords; i++) {
        words.push(this.generateWordWithConstraints(wordConstraints[i], wordLengths[i]));
      }
      
      let sentence: string = words.join(" ");
      
      // Capitalize first letter
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
      
      // Add period at the end
      sentence += ".";
      
      return sentence;
    }
  }
  