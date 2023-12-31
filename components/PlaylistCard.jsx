import styles from '../styles/Home.module.css';
import { useEffect, useState } from "react";

export default function PlaylistCard(props){
  //Styling based on passed in props
  return(
      <div className={styles.card} onClick={props.onClick}>
        <img src={props.imgSrc} alt={props.name} className={props.isSelected ? styles.cardImg2 : styles.cardImg}/>
        <h3 className={styles.cardName}>{props.name}</h3>
      </div>
  )
}