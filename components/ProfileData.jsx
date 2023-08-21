import { useEffect, useState } from "react";
import PlaylistData from "./PlaylistData";
import styles from '../styles/Home.module.css';



export default function ProfileData(){

  const [profile, setProfile] = useState({});

  const [playlistData, setPlaylistData] = useState([])

  const [offset, setOffset] = useState(0)

  const [totalNum, setTotalNum] = useState(0)

  let limit = 50

  const [nextButton, setNextButton] = useState(true)
  async function fetchProfile(token){
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { 'Authorization': `Bearer ${token}` }
    });
    const profileJson = await result.json();
    setProfile(profileJson)
  }

  async function fetchPlaylists(token, off) {
    const result = await fetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${off}`,{
        method: "GET", headers:{ Authorization: `Bearer ${token}`}
    });
    const playlistJson = await result.json();
    // setPlaylistData(playlistJson.items)
    setTotalNum(playlistJson.total)
    setPlaylistData([playlistJson.items])
  }

  const fetchProfileAndPlaylists = async (token) => {
    try {
      await Promise.all([fetchProfile(token), fetchPlaylists(token, offset)]);
    } catch (error) {
      // Handle errors here if needed
      console.error("Error fetching profile and playlists:", error);
    }
  };

  useEffect(() =>{
    const accessToken = localStorage.getItem('access_token')
    fetchProfileAndPlaylists(accessToken);
  }, [offset])

  function handleLogout() {
    setProfile({});
    setPlaylistData({});
    localStorage.removeItem("access_token");
    localStorage.removeItem("code_verifier");
  }

  async function generateMorePlaylists(){
    const accessToken = localStorage.getItem('access_token')
    try{
      const newOffset = offset + 50;
      if(newOffset + limit > totalNum){
        setNextButton(false)
      }
      setOffset(newOffset);
      await fetchPlaylists(accessToken, newOffset);
    }
    catch(error){
      console.error("error fetching playlists: ", error);
    }
  }
  async function generateLessPlaylists(){
    const accessToken = localStorage.getItem('access_token')
    try{
      setNextButton(true)
      const newOffset = offset - 50;
      setOffset(newOffset);
      await fetchPlaylists(accessToken, newOffset);
    }
    catch(error){
      console.error("error fetching playlists: ", error);
    }
  }

  return(
    <div>
      <h1 className={styles.profileH1}>Welcome <span className={styles.textGradient}>{profile.display_name}</span></h1>
      <h2 className={styles.profileH2}>Step 1: Choose a Playlist</h2>
      {playlistData && playlistData.length > 0 ?
          (<div>
            <PlaylistData listOfPlaylists={playlistData} profileData={profile}/>
            <div className={styles.buttonDiv}>
              {offset === 0 ? <button className={styles.disabledPrevButton}>Prev</button> : <button onClick={generateLessPlaylists} className={styles.prevButton}>Prev</button>}
              {offset <= 100 && nextButton ? <button onClick={generateMorePlaylists} className={styles.nextButton}>Next</button> : <button className={styles.disabledNextButton}>Next</button>}
            </div>
          </div>)
        : 
          (<h4>Fetching playlists...</h4>)
      }
    </div>

  )
}