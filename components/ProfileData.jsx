import { useEffect, useState } from "react";
import PlaylistData from "./PlaylistData";
import styles from '../styles/Home.module.css';



export default function ProfileData(){
  //Profile dictionary state
  const [profile, setProfile] = useState({});
  //Playlist data dictionary state
  const [playlistData, setPlaylistData] = useState([])

  const [offset, setOffset] = useState(0)

  const [totalNum, setTotalNum] = useState(0)

  let limit = 50
  //Next button clickable state
  const [nextButton, setNextButton] = useState(false)

  //GET request to Spotify API with access token to get user's profile information
  async function fetchProfile(token){
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { 'Authorization': `Bearer ${token}` }
    });
    const profileJson = await result.json();
    setProfile(profileJson)
  }
  //GET request to Spotify API with access token and to get limit number of playlists (50) with offset (0) from user's Spotify
  async function fetchPlaylists(token, off) {
    const result = await fetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${off}`,{
        method: "GET", headers:{ Authorization: `Bearer ${token}`}
    });
    const playlistJson = await result.json();

    //set total num to total number of user's playlists
    setTotalNum(playlistJson.total);
    //set next button to be clickable if there are more than 20 playlists (only 20 displayed in one screen)
    setNextButton(playlistJson.total > 20);
    setPlaylistData([playlistJson.items])
  }

  //Once token has been fetched, fetch profile info and playlist info in this order
  const fetchProfileAndPlaylists = async (token) => {
    try {
      await Promise.all([fetchProfile(token), fetchPlaylists(token, offset)]);
    } catch (error) {
      // Handle errors here if needed
      console.error("Error fetching profile and playlists:", error);
    }
  };
  //Once this component mounts, retrieve access token from storage
  useEffect(() =>{
    const accessToken = localStorage.getItem('access_token')
    fetchProfileAndPlaylists(accessToken);
  }, [offset])

  //If user clicks logout, reset states and clear local storage
  function handleLogout() {
    setProfile({});
    setPlaylistData({});
    localStorage.removeItem("access_token");
    localStorage.removeItem("code_verifier");
  }

  //When next button is clicked, edit offset and get corresponding playlists
  async function generateMorePlaylists(){
    const accessToken = localStorage.getItem('access_token')
    try{
      //if calling the endpoint again doesn't generate more playlists, set next button to be unclickable
      if(offset + 50 + limit >= totalNum){
        setNextButton(false);
      }
      setOffset(offset + 50);
      await fetchPlaylists(accessToken, offset + 50);
    }
    catch(error){
      console.error("error fetching playlists: ", error);
    }
  }
  //When back button is clicked, edit offset and get corresponding playlists
  async function generateLessPlaylists(){
    const accessToken = localStorage.getItem('access_token')
    try{
      setNextButton(true)
      setOffset(offset - 50);
      await fetchPlaylists(accessToken, offset - 50);
    }
    catch(error){
      console.error("error fetching playlists: ", error);
    }
  }

  return(
    <div>
      <h1 className={styles.profileH1}>Welcome <span className={styles.textGradient}>{profile.display_name}</span></h1>
      <h2 className={styles.profileH2}>Step 1: Choose a Playlist</h2>
      {/* Based on if playlistData has been loaded, display information */}
      {playlistData && playlistData.length > 0 && totalNum > 0 ?
          (<div>
            {/* pass fetched data to this component props */}
            <PlaylistData listOfPlaylists={playlistData} profileData={profile}/>
            <div className={styles.buttonDiv}>
              {offset === 0 ? <button className={styles.disabledPrevButton}>Prev</button> : <button onClick={generateLessPlaylists} className={styles.prevButton}>Prev</button>}
              {/* if offset can't be increased more and next button is set to false, disable next button */}
              {offset+limit <= 100 && (nextButton) ? <button onClick={generateMorePlaylists} className={styles.nextButton}>Next</button> : <button className={styles.disabledNextButton}>Next</button>}
            </div>
          </div>)
        : 
          (<h4>Fetching playlists...</h4>)
      }
    </div>

  )
}