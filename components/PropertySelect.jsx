import styles from '../styles/Home.module.css';
import { useState, useEffect } from 'react';

export default function PropertySelect(props){
  // const words = ["angry", "anxious", "beautiful", "bright", "calming", "cloudy", "confusing", "dark", "depressed", "euphoric", "excitement", "fast", "happy", "happy tears", "heartbreak", "night", "nostalgic", "party", "peaceful", "rainy day", "random", "relaxing", "sad", "slow", "sunny", "sunset", "surreal"]

  const [words, setWords] = useState(props.data)

  function handleClick(word){
    let selectedCounter = 0;
    words.map(entry => {
      if(entry.isSelected){
        selectedCounter += 1
      }
    })
    const newWordArray = words.map(entry => {
      if(entry.value === word.value){
        if(selectedCounter < props.limit && !entry.isSelected){
          return {...entry, isSelected: !entry.isSelected}
        }
        else if(entry.isSelected){
          return {...entry, isSelected: !entry.isSelected}
        }
      }
      return entry;
    })
    setWords(newWordArray);
  }

  const wordBank = words.map((word) =>{
    return <div className={word.isSelected ? styles.selectedWordButton : styles.wordButton} onClick={() => handleClick(word)}>{word.value}</div>
  })

  return(
    <div className={styles.wordBankContainer}>
      {wordBank}
    </div>
  )
}