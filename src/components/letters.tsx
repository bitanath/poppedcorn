import {Devvit, useState} from '@devvit/public-api'

export function Letters(props: {clicked:Array<[number,number]>,guess:Array<string>,actual:string,similar:Array<string>,addLetter:(letter:string,index:[number,number])=>void}): JSX.Element{
    //Click variables
    const {actual,similar} = props
    const allLetterHints = findRequiredLetters(actual,similar)
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

function createLetterBatches(letters: string[]): string[][] {
    const maxBatchSize = 14;
    const batches: string[][] = [];
    let remainingLetters = [...letters];
    
    while (remainingLetters.length > 0) {
        const batch = remainingLetters.splice(0, maxBatchSize);
        batches.push(batch);
    }
    
    return batches;
}


function collectLetters(thisSentence: string, otherSentences: string[]): string[] {
    let targetSentence = [...thisSentence].reverse().join('')
    const getLetterCount = (str: string): Map<string, number> => {
        const count = new Map<string, number>();
        str.toLowerCase().replace(/[^a-z]/g, '').split('').forEach(char => {
            count.set(char, (count.get(char) || 0) + 1);
        });
        return count;
    };

    
    const targetCount = getLetterCount(targetSentence);
    
    let bestMatchCount = new Map<string, number>();
    let bestMatch = '';
    
    otherSentences.forEach(sentence => {
        const sentenceCount = getLetterCount(sentence);
        let additionalLettersNeeded = 0;
        
        sentenceCount.forEach((count, letter) => {
            const targetNeeds = targetCount.get(letter) || 0;
            if (count > targetNeeds) {
                additionalLettersNeeded += count - targetNeeds;
            }
        });
        
        if (!bestMatch || additionalLettersNeeded < bestMatchCount.size) {
            bestMatch = sentence;
            bestMatchCount = sentenceCount;
        }
    });

    
    const requiredLetters = new Map<string, number>();
    
    targetCount.forEach((count, letter) => {
        requiredLetters.set(letter, count);
    });

    bestMatchCount.forEach((count, letter) => {
        const currentCount = requiredLetters.get(letter) || 0;
        if (count > currentCount) {
            requiredLetters.set(letter, count);
        }
    });

    
    const letters: string[] = [];
    
    requiredLetters.forEach((count, letter) => {
        for (let i = 0; i < count; i++) {
            letters.push(letter);
        }
        
        const extras = Math.min( Math.min(24 - letters.length,0),1); 
        for (let i = 0; i < extras; i++) {
            letters.push(letter);
        }
    });

    return letters;
}

function subtractLetters(originalLetters: string[], lettersToRemove: string[]): string[] {
    const removeCount = new Map<string, number>();
    for (const letter of lettersToRemove) {
        removeCount.set(letter, (removeCount.get(letter) || 0) + 1);
    }

    const result: string[] = [];
    for (const letter of originalLetters) {
        if (removeCount.has(letter) && removeCount.get(letter)! > 0) {
            removeCount.set(letter, removeCount.get(letter)! - 1);
        } else {
            result.push(letter);
        }
    }

    return result;
}

function findRequiredUniqueLetters(thisSentence: string, otherSentences: string[]): string[] {
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
        const seenInOther = new Set<string>();
        
        for (const char of cleanSentence) {
            letterPool.push(char);
        }

        for (const char of otherSentence) {
            if (!mainLetterCount.has(char) && !seenInOther.has(char)) {
                letterPool.push(char);
                seenInOther.add(char);
            }
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