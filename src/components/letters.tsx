import {Devvit, useState} from '@devvit/public-api'

export function Letters(props: {clicked:Array<[number,number]>,guess:Array<string>,actual:string,similar:Array<string>,addLetter:(letter:string,index:[number,number])=>void, hints:number}): JSX.Element{
    //Click variables
    const {actual,similar,hints} = props
    const allLetterHints = filterLetterHints(findRequiredLetters(actual,similar),actual,Math.min(hints,3))
    const batchedLetterHints = createLetterBatches(allLetterHints)
    
    return (
            <vstack gap="small" height="136px" maxHeight="136px" minHeight="136px">
                {
                    batchedLetterHints.map((batch,j)=>{
                        return (
                            <hstack gap='small' alignment='center'>
                                {
                                    batch.map((letter,i)=>{
                                        if(/[aeiou]/ig.test(letter)){
                                            return (<button appearance='destructive' disabled={findPair(props.guess.length,props.clicked,j,i)} width="40px" height="40px" textColor='white' onPress={()=>{props.addLetter(letter,[j,i])}}>{letter.toUpperCase()}</button>)
                                        }else{
                                            return (<button appearance='primary' disabled={findPair(props.guess.length,props.clicked,j,i)} width="40px" height="40px" textColor='white' onPress={()=>{props.addLetter(letter,[j,i])}}>{letter.toUpperCase()}</button>)
                                        }
                                    })
                                }
                            </hstack>
                        )
                    })
                }
            </vstack>
        )
}

function findPair(guessLength: number,arr: number[][], num1: number, num2: number): boolean {
    if(guessLength < 1){
        return false
    }

    return arr.some(([first, second]) => 
        (first === num1 && second === num2)
    );
}

export function createLetterBatches(letters: string[]): string[][] {
    const maxBatchSize = 14;
    const batches: string[][] = [];
    let remainingLetters = [...letters];
    
    while (remainingLetters.length > 0) {
        const batch = remainingLetters.splice(0, maxBatchSize);
        batches.push(batch);
    }
    
    return batches;
}


function findRequiredLetters(thisSentence: string, otherSentences: string[]): string[] {
    
    const cleanSentence = thisSentence.toLowerCase().replace(/[^a-z]/g, '');
    const cleanOtherSentences = otherSentences.map(s => 
        s.toLowerCase().replace(/[^a-z]/g, '')
    );

    const mainLetterCount = new Map<string, number>();
    for (const char of cleanSentence) {
        mainLetterCount.set(char, (mainLetterCount.get(char) || 0) + 1);
    }

    let bestCombination: string[] = [];
    let minTotalLetters = Infinity;

    for (const otherSentence of cleanOtherSentences) {
        const letterPool: string[] = [];
        
        const combined = cleanSentence + otherSentence;
        for (const char of combined) {
            letterPool.push(char);
        }

        if (letterPool.length < minTotalLetters) {
            minTotalLetters = letterPool.length;
            bestCombination = letterPool;
        }
    }

    if (minTotalLetters > 28) {
        return cleanSentence.split('').sort();
    }

    return bestCombination.sort();
}

const filterLetterHints = (
    allLetterHints: string[], 
    actual: string, 
    hintsCount: number
): string[] => {
    // Convert actual to lowercase array of characters
    const actualLetters = [...actual.toLowerCase()];
    
    // Create a copy of allLetterHints to work with
    let result = [...allLetterHints];
    
    // Track letters we've removed to handle duplicates
    const removedCount: { [key: string]: number } = {};
    let removedTotal = 0;
    
    // Remove letters from right to left
    for (let i = result.length - 1; i >= 0; i--) {
        const letter = result[i].toLowerCase();
        
        // Count how many times this letter appears in actual
        const letterFrequencyInActual = actualLetters.filter(l => l === letter).length;
        
        // Initialize removal counter for this letter
        removedCount[letter] = removedCount[letter] || 0;
        
        // If letter isn't in actual OR we've already kept enough of this letter
        if (!actualLetters.includes(letter) || 
            (removedCount[letter] < (result.filter(l => l.toLowerCase() === letter).length - letterFrequencyInActual))) {
            
            // Only remove if we haven't hit our hints limit
            if (removedTotal < hintsCount) {
                result.splice(i, 1);
                removedCount[letter]++;
                removedTotal++;
            }
        }
    }
    
    return result;
};