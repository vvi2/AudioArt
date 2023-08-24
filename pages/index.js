'use client'
import {useState, useEffect} from "react";
import Link from "next/link";
import styles from '../styles/Home.module.css';




export default function Home() {
  const CLIENT_ID = "3f3dceffc53241fea28db2404f844ffd"
  const REDIRECT_URI = "https://loquacious-panda-8919fa.netlify.app/"
  const [accessToken, setAccessToken] = useState("");

  //Code Verifier
  function generateRandomString(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
  //Code Challenge
  async function generateCodeChallenge(codeVerifier) {
    function base64encode(string) {
      return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
  
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
  
    return base64encode(digest);
  }

  function authorize(){
    let codeVerifier = generateRandomString(128);

    generateCodeChallenge(codeVerifier).then(codeChallenge => {
      let state = generateRandomString(16);
      let scope = "playlist-read-private playlist-modify-private playlist-modify-public ugc-image-upload"

      localStorage.setItem('code_verifier', codeVerifier);

      let args = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI,
        state: state,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge
    });

    window.location = 'https://accounts.spotify.com/authorize?' + args;
    });

  }

  useEffect(() => {
    if(window.location.search && !accessToken){
      const urlParams = new URLSearchParams(window.location.search);
      let code = urlParams.get('code');
      let codeVerifier = localStorage.getItem('code_verifier');

      let body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        code_verifier: codeVerifier
      });

      const response = fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('HTTP status ' + response.status);
          }
          return response.json();
        })
        .then(data => {
          localStorage.setItem('access_token', data.access_token);
          setAccessToken(data.access_token)
          
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }, [])

  function handleLogout(){
    setAccessToken("");
    // localStorage.clear()
    localStorage.removeItem("access_token")
    localStorage.removeItem("code_verifier")
  }

  return(
    <div className={styles.container}>
      <h1 className={styles.homeTitle}>Audio Art</h1>
      <h2 className={styles.homeDescription}>Use AI to create unique cover art for your playlists.</h2>
    {
      !accessToken ? 
      <div className={styles.homeLogin}>
        <button className={styles.loginButton} onClick={authorize}>Login with Spotify</button>
        <h2>Please login with your Spotify account to let AI run its magic!</h2>
      </div>
      : 
      <div className={styles.homeLogin}>
        <Link href="/SpotifyProfile">
          <button className={styles.continueButton}>
            Continue to AI
          </button>
        </Link>
        <h2 onClick={handleLogout}>or <span className={styles.white}>Logout</span></h2>
      </div>
    }
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