import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';

// import { Configuration, OpenAIApi } from "openai"
// import PropertySelect from './PropertySelect'

export default function PlaylistOverlay(props) {
  const [songList, setSongList] = useState([]);

  const [songData, setSongData] = useState([]);

  const [avgData, setAvgData] = useState({})

  const [aiGenerated, setAIGenerated] = useState(false);

  const [loadingAI, setLoadingAI] = useState(false);

  const [playlistSummary, setPlaylistSummary] = useState("");

  const [imagePrompt, setImagePrompt] = useState("");

  const [buttonClick, setButtonClick] = useState(false);

  const [showBlurb, setShowBlurb] = useState(false);

  const accessToken = localStorage.getItem('access_token')

  const artStyles = [
    {value: "Minimalism", isSelected: false},
    {value: "Realism", isSelected: false},
    {value: "Retro/Vintage", isSelected: false},
    {value: "Geometric", isSelected: false},
    {value: "Surrealism", isSelected: false},
    {value: "Psychedelic", isSelected: false}
  ]

  useEffect(()=>{
    fetchPlaylistSongs(accessToken)
    if(songList.length > 0){
      fetchSongData(accessToken)
      if(songData.length > 0){
        let totDanceability = 0;
        let totEnergy = 0;
        let totLoudness = 0;
        let totSpeech = 0;
        let totTempo = 0;
        let totValence = 0;
        songData.map((song) => {
          totDanceability += song.danceability
          totEnergy += song.energy
          totLoudness += song.loudness
          totSpeech += song.speechiness
          totTempo += song.tempo
          totValence += song.valence
        })
        setAvgData({
          danceability: totDanceability / songData.length,
          energy: totEnergy / songData.length,
          loudness: totLoudness / songData.length,
          speechiness: totSpeech / songData.length,
          tempo: totTempo / songData.length,
          valence: totValence / songData.length,
        })
      }
      console.log(avgData)}
  }, [])


  async function fetchPlaylistSongs(token) {
    const result = await fetch(`${props.playlist.tracks.href}?limit=50&offset=0`,{
        method: "GET", headers:{ 'Authorization': `Bearer ${token}`}
    });
    const songListJson = await result.json();
    setSongList(songListJson.items)
  }

  async function fetchSongData(token){
    const result = await fetch(`https://api.spotify.com/v1/audio-features?ids=${songIDs}`,{
      method: "GET", headers:{'Authorization': `Bearer ${token}`}
    });
    const songDataJson = await result.json();
    setSongData(songDataJson.audio_features)
  }

  const songIDs = (() => {
    const id = songList.map((song) => {
      return song.track.id;
    });
    return id.join(",");
  })();

  const songElements = songList.map((song, index) =>{
    const artists = song.track.artists.map((artist, artIndex) =>{
      if(artIndex === song.track.artists.length - 1){
        return <span key={artIndex}>{artist.name}</span>
      }
      else{
        return <span key={artIndex}>{artist.name}, </span>
      }

    })
    return(
        <div className={styles.overlaySong} key={index}>
          <p className={styles.overlaySongName}>{song.track.name}</p>
          <p className={styles.overlaySongArtist}>{artists}</p>
        </div>
    )
  })
  
  // const configuration = new Configuration({
  //   apiKey: process.env.OPENAI_API_KEY
  // })

  // delete configuration.baseOptions.headers['User-Agent'];
  
  // const openai = new OpenAIApi(configuration)

  const [art, setArt] = useState("");

  async function generatePrompt(data, openai, playlistSummary){
    const url = "https://loquacious-panda-8919fa.netlify.app/.netlify/functions/fetchAI"

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'text/plain',
      },
      body: `Give a description of an image which could be used to represent a playlist of songs based on the average audio features of the songs and a sentence of what the playlist means to the user. These audio features will include danceability, energy, speechiness, and valence. If the danceability or energy is below 0.33, the colors in the picture should be described as dull and more neutral/cool. If the danceability or energy is betweenThe description should be rich in visual detail. Make sure to include that no words or letters should be present in the image.
      ###
      sentence: This playlist is for when I want to get hype and excited during a pregame before a night out.
      average danceability: 0.52732
      average energy: 0.71932
      average speechiness: 0.061708
      average valence: 0.33684
      image-description: In the vibrant swirl of electric neon lights, an image comes to life that perfectly encapsulates the essence of your playlist. Due to the medium danceability, a pulsating cityscape stretches across the horizon, a mesmerizing fusion of skyscrapers and billboards ablaze with dynamic colors. Due to the higher energy, the foreground is alive with kinetic energy. Due to the low speechiness, this image is very fluid and many of shapes and colors are blended together. Due to the lower valence, amidst the dazzling spectacle, a lunar crescent of subdued warmth hovers above. No words or letters should be in the image.
      ###
      sentence: For when I want to feel calm and relaxed.
      average danceability: 0.1632
      average energy: 0.2783
      average speechiness: 0.142
      average valence: 0.7893
      image-description: A serene meadow stretches out beneath an expansive cerulean sky, adorned with fluffy, cotton-like clouds that drift lazily across the horizon giving a very calm and relaxed feeling. Due to the lower danceability and energy, the colors in this picture are slightly more neutral and dull and gives very earthy and woody tones. Slightly higher speechiness of 0.142 is reflected in the distinct shapes and contrast in the picture. Above it all, the sun hangs like a radiant lantern in the sky and its rays infuse the meadow with a sense of serenity and well-being, mirroring the playlist's valence, marked by an average score of 0.7893 which gives a very positive and happy vibe to the image. No words or letters should be in the image.
      ###
      sentence: ${playlistSummary}
      average danceability: ${data.danceability}
      average energy: ${data.energy}
      average speechiness: ${data.speechines}
      average valence: ${data.valence}`
    })

    const data = await response.json()
    console.log(data)

    // const response = await openai.createCompletion({
    //   model: 'text-davinci-003',
    //   prompt: `Give a description of an image which could be used to represent a playlist of songs based on the average audio features of the songs and a sentence of what the playlist means to the user. These audio features will include danceability, energy, speechiness, and valence. If the danceability or energy is below 0.33, the colors in the picture should be described as dull and more neutral/cool. If the danceability or energy is betweenThe description should be rich in visual detail. Make sure to include that no words or letters should be present in the image.
    //   ###
    //   sentence: This playlist is for when I want to get hype and excited during a pregame before a night out.
    //   average danceability: 0.52732
    //   average energy: 0.71932
    //   average speechiness: 0.061708
    //   average valence: 0.33684
    //   image-description: In the vibrant swirl of electric neon lights, an image comes to life that perfectly encapsulates the essence of your playlist. Due to the medium danceability, a pulsating cityscape stretches across the horizon, a mesmerizing fusion of skyscrapers and billboards ablaze with dynamic colors. Due to the higher energy, the foreground is alive with kinetic energy. Due to the low speechiness, this image is very fluid and many of shapes and colors are blended together. Due to the lower valence, amidst the dazzling spectacle, a lunar crescent of subdued warmth hovers above. No words or letters should be in the image.
    //   ###
    //   sentence: For when I want to feel calm and relaxed.
    //   average danceability: 0.1632
    //   average energy: 0.2783
    //   average speechiness: 0.142
    //   average valence: 0.7893
    //   image-description: A serene meadow stretches out beneath an expansive cerulean sky, adorned with fluffy, cotton-like clouds that drift lazily across the horizon giving a very calm and relaxed feeling. Due to the lower danceability and energy, the colors in this picture are slightly more neutral and dull and gives very earthy and woody tones. Slightly higher speechiness of 0.142 is reflected in the distinct shapes and contrast in the picture. Above it all, the sun hangs like a radiant lantern in the sky and its rays infuse the meadow with a sense of serenity and well-being, mirroring the playlist's valence, marked by an average score of 0.7893 which gives a very positive and happy vibe to the image. No words or letters should be in the image.
    //   ###
    //   sentence: ${playlistSummary}
    //   average danceability: ${data.danceability}
    //   average energy: ${data.energy}
    //   average speechiness: ${data.speechines}
    //   average valence: ${data.valence}`,
    //   temperature: 0.8,
    //   max_tokens: 150})
    //   let prompt = await response.data.choices[0].text.trim();
      setImagePrompt(data)
  }
  
  async function fetchImage(prompt){
    //256, 512, 1024
    const response = await openai.createImage({
      prompt: prompt,
      n: 1,
      size: '256x256',
      response_format: 'url'
    })
    //if b64_json, .b64_json instead of .url
    // and src = "data:image/png;base64, ${response.data.data[0].b64_json}"
    const imgSrc = await response.data.data[0].url
    setArt(imgSrc)
  }

  function handleGenerateAI(){
      setButtonClick(true);
      if(avgData){
        generatePrompt(avgData, openai, playlistSummary)
      }
  }

  useEffect(()=>{
    if(imagePrompt){
      setLoadingAI(true);
      setAIGenerated(true);
      fetchImage(imagePrompt).finally(() => {
        setLoadingAI(false);
      })
    }
  }, [imagePrompt])
  

  function handleChange(event){
    setPlaylistSummary(event.target.value)
    console.log("Playlist summary is: ", playlistSummary)
    console.log(songIDs)
  }

  function backButton(){
    setButtonClick(false);
    setAIGenerated(false);
    setImagePrompt("");
  }
  // {`data:image/png;base64,${art}`}

  function handleDownload(url){
    const imageUrl = url; // Replace with your image URL

    // Create an anchor element
    const anchor = document.createElement('a');
    anchor.href = imageUrl;
    anchor.download = 'image.jpg'; // Set the desired file name here
    anchor.target = '_blank'; // Open the link in a new tab for better download experience
    anchor.rel = 'noopener noreferrer';

    // Programmatically click the anchor element to trigger the download
    anchor.click();
  }

  function explainBlurb(){
    setShowBlurb(!showBlurb)
  }

  return (
    <div className={styles.overlay}>

      <div className={styles.overlayContent}>

        <span onClick={props.onClose} className={styles.closeButton}>
          &times;
        </span>
        {aiGenerated ? 
          <div>   
            <span onClick={backButton} className={styles.backButton}> &larr; </span>  
            {loadingAI ? 
              <p>AI is finalizing your cover art...</p> 
              :
              <div className={styles.generatedArt}>
              <div className={styles.AIArt}>
                <img src={`${art}`} width="256px" />
                <button className={styles.downloadButton} onClick={() => handleDownload(art)}>Hello</button>
                <div className={styles.showInfo} onClick={()=>setShowBlurb(!showBlurb)}><p className={styles.infoTitle}>How was this made?</p><img src={!showBlurb ? "/dropdown.png" : "/backup.png"} width="15px"></img></div>
              </div>
              {showBlurb && <div className={styles.infoBlurb}><p> We use the Spotify API to analyze your playlist in a unique way. We average 4 different audio features across the playlist: </p>
              <ol>
                <li>Danceability: Tells us how suitable a song is for dancing.</li>
                <li>Energy: Gauges how intense, fast, and loud each song is.</li>
                <li>Speechiness: Determines whether a song is more lyrical or more instrumental.</li>
                <li>Valence: A measure the positivity and happiness of a song.</li>
              </ol>
<p>Based on these features, we turn the playlist into a visual experience! </p>
<ul>
<li>Higher Danceability and Energy: When the playlist is more danceable and energetic, the result is a cover art with vibrant and lively colors.</li>
<li>Lower Speechiness: For playlists with fewer lyrics and more music, the cover art becomes more fluid and less focused on geometric shapes.</li>
<li>Higher Valence: When the playlist has a happier and more positive feel, the cover art captures that cheerful vibe.</li></ul>
<p>We take this analysis and put it into action using OpenAI's ChatGPT and DALL-E. These advanced technologies work together to create the perfect cover art for your playlist, making it as unique as your musical taste!</p></div>}</div>
            }
          </div>
          : 
          <div className={styles.overlayFirst}>
            <h2 className={styles.profileH2}>Step 2: Help the AI personalize</h2>
            <div className={styles.overlayPlaylistDetails}>
              <div className={styles.overlayCurrentCover}>
                <img src={props.playlist.images[0].url} alt={props.playlist.name} className={styles.overlayImage} />
                <h3 className={styles.cardName}>{props.playlist.name}</h3>
              </div>
              {songList.length > 0 ? 
                <div className={styles.overlaySongContainer}> {songElements} </div> 
              : 
                <div className={styles.overlaySongContainer}> <p className={styles.overlaySong}>Loading Songs...</p></div> 
              }
            </div>
            <p>In one sentence, how would you describe this playlist?</p>
            <input 
              type="text"
              placeholder="E.g. This playlist is for late night drives."
              className={styles.formInput}
              name="playlistSummary"
              value={playlistSummary}
              onChange={handleChange}
            />
{           (!buttonClick) ? <button 
            className={ 
            styles.generateButton} 
            onClick={handleGenerateAI}>
            Hello
            </button> : <p>AI is analyzing your playlist...</p>}
          </div>
        }
        {/* <p>Choose an art style.</p>
        <PropertySelect data={artStyles} limit={1} /> */}

      </div>

    </div>
  );
}