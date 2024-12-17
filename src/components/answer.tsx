import {Devvit} from '@devvit/public-api'

export function Answer(props: {name:string,guess:Array<string>}): JSX.Element{
    const formatted = props.name.toUpperCase().replace(/[^A-Z]/ig," ")
    const no_spaces = props.name.toUpperCase().replace(/[^A-Z]/ig,"")
    let incorrect = false
    let counter = 0
    let result = []
    for (const [index, letter] of [...formatted].entries()) {
       if(/[^A-Z]/g.test(letter)){
            result.push(<spacer width="20px" height="40px"></spacer>)
       }else if(props.guess.at(counter)){
            if(no_spaces.charAt(counter).toUpperCase() == props.guess.at(counter)?.toUpperCase() && !incorrect){
                result.push(<button appearance='success' textColor='white' width="20px" height="40px">{props.guess.at(counter)?.toUpperCase()}</button>)
            }else if(!incorrect){
                incorrect = true
                result.push(<button appearance='destructive' textColor='white' width="20px" height="40px">{props.guess.at(counter)?.toUpperCase()}</button>)
            }
            else{
                result.push(<spacer width="20px" height="40px"></spacer>)
            }
            counter++
       }
    }
    return (
        <hstack gap='small' height="48px" width="90%" padding='small' alignment={props.guess.length < 16 ? 'center' : 'end'}>
            {result}
        </hstack>
    )
}