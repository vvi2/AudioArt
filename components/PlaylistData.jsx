import { useEffect, useState } from "react";
import PlaylistCard from "./PlaylistCard";
import styles from '../styles/Home.module.css';
import PlaylistOverlay from "./PlaylistOverlay";

export default function PlaylistData(props){

  //Retrieve data fetched from Spotify API when loading ProfileData component through props
  let playlists = props.listOfPlaylists[0]
  let profile = props.profileData

  const [userPlaylists, setUserPlaylists] = useState([]);

  const [selectedPlaylist, setSelectedPlaylist] = useState({});

  const [showOverlay, setShowOverlay] = useState(false);
  //Once playlists data has been fetched, filter the playlist data by playlists that user owns
  useEffect(() =>{
    if(playlists && playlists.length > 0){
      let playlistsByUser = playlists.filter((item) => {
        return item.owner.id === profile.id
      })
      setUserPlaylists(playlistsByUser)
    }
  },[playlists])

  const handlePlaylistSelect = (playlist) => {
    // Handle the selected playlist here (e.g., store it in state, call a function, etc.)
    setSelectedPlaylist(playlist);
    setShowOverlay(true);
  };
  const handleCloseOverlay = () => {
    setShowOverlay(false);
    setSelectedPlaylist({});
  };

  //Style playlist elements using PlaylistCard component, passing in corresponding props
  const playlistElements = userPlaylists.map((playlist, index) => {
    return(
      <PlaylistCard
          key={index}
          name={playlist.name}
          imgSrc={playlist.images[0].url}
          onClick={() => handlePlaylistSelect(playlist)}
          isSelected={selectedPlaylist === playlist}
      />
    )
  })
  

  
  return(
    <div>
    <div className={styles.cardContainer}>
      {playlistElements}
    </div>
    {/* Depending on if showOverlay is true or not (if playlist element has been selected), render PlaylistOverlay component with selected playlist */}
    {showOverlay && (
        <PlaylistOverlay
          playlist={selectedPlaylist}
          onClose={handleCloseOverlay}
        />
      )}
    </div>
  )
}