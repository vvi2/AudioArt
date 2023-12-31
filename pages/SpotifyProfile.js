
import ProfileData from "../components/ProfileData";
import styles from '../styles/Home.module.css';
import Link from "next/link";

export default function SpotifyProfile() {
  return (
      <div className={styles.spotifyPage}>
        <div className={styles.profileNav}>
          <h2 className={styles.homeDescription}>AudioArt</h2>
          {/* Links back to home page */}
          <Link href="/">
            <h3 className={styles.profileH3}>Logout</h3>
          </Link>
        </div>
        {/* Profile Data component */}
        <ProfileData />
        <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
          background-color: #000;
          color: #FFF;
          
          
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
      </div>
  )
}