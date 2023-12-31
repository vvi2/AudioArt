'use client'
import {useState, useEffect} from "react";
import Link from "next/link";
import styles from '../styles/Home.module.css';




export default function Home() {
  //Implicit Grant Authorization Flow
  //Registered App in Spotify API with these settings
  const CLIENT_ID = "3f3dceffc53241fea28db2404f844ffd"
  const REDIRECT_URI = "https://audio-art.netlify.app/"

  //Declares state variable with initial value of empty and an update function
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
  //Creates code challenge based on codeVerifier - this process is part of the Proof Key for Code Exchange mechanism used in the OAuth 2.0 authorization flow to enhance security. Code challenge is used for the authorization server to verify the authenticity of the request - PKCE helps prevent attacks such as intercepted authorization codes.
  async function generateCodeChallenge(codeVerifier) {
    function base64encode(string) {
      return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
  
    //New instance of TextEncoder to encode codeVerifier string into sequence of bytes
    const encoder = new TextEncoder();
    //Converts codeVerifier into a Uint8Array (represents binary data of the string)
    const data = encoder.encode(codeVerifier);
    //Calculates the SHA-256 hash of binary data using the Web Crypto API's method
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    //base64-encoded represenation of the SHA-256 hash to produce a code challenge
    return base64encode(digest);
  }

  //Directs user/initiates to the Spotify authorization with specified parameters
  function authorize(){

    //Serves as the code verifier in the OAuth 2.0 authorization flow
    let codeVerifier = generateRandomString(128);

    //Calls generateCodeChallenge and returns a promise that resolves to code challenge
    generateCodeChallenge(codeVerifier).then(codeChallenge => {
      //Create state parameter in authorization request
      let state = generateRandomString(16);

      //Scope of access requested from user's spotify account
      let scope = "playlist-read-private playlist-modify-private playlist-modify-public ugc-image-upload"

      //Store code verifier in browser's local storage. Will be needed later to exchange authorizaition code for an access token.
      localStorage.setItem('code_verifier', codeVerifier);

      //Construct query parameters for authorization URL
      let args = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI,
        state: state,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge
    });

    //Redirect user to Spotifify authorizaton endpoint with constructed query parameters
    window.location = 'https://accounts.spotify.com/authorize?' + args;
    });

  }

  //Handles the Spotify authorization process when component mounts -  when user is redirected back to app after logging in on Spotify website
  useEffect(() => {
    //Check if their is a query string in URL - only runs when their is a valid Spotify authorization callback and access token hasn't been retrieved yet
    if(window.location.search && !accessToken){
      const urlParams = new URLSearchParams(window.location.search);
      //Extract authorizatio code from query parameters
      let code = urlParams.get('code');
      //Retrieves code verifier previously stored during authorization request
      let codeVerifier = localStorage.getItem('code_verifier');
      //Constructs request body with necessary parameters for exchanging authorization code for an access token using OAuth 2.0 token endpoint
      let body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        code_verifier: codeVerifier
      });
      //Send POST request to Spotify token endpoint with the constructed body
      const response = fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
      })
      //Check if response from endpoint is successful and parses JSON
        .then(response => {
          if (!response.ok) {
            throw new Error('HTTP status ' + response.status);
          }
          return response.json();
        })
        //Store access token in local storage and update component's state
        .then(data => {
          localStorage.setItem('access_token', data.access_token);
          setAccessToken(data.access_token)
          
        })
        //Handle error
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }, [])

  //If user clicks logout, clear local storage/update state of old access token/code verifier
  function handleLogout(){
    setAccessToken("");
    // localStorage.clear()
    localStorage.removeItem("access_token")
    localStorage.removeItem("code_verifier")
  }

  return(
    <div className={styles.container}>
      <h1 className={styles.homeTitle}>AudioArt</h1>
      <h2 className={styles.homeDescription}>Use OpenAI to create unique cover art for your playlists.</h2>
    {/* Based on if access token has been set i.e. if user has logged in, display different components */}
    {
      !accessToken ? 
      <div className={styles.homeLogin}>
        <button className={styles.loginButton} onClick={authorize}>Login with Spotify</button>
        <h2>Please login with your Spotify account to let OpenAI run its magic!</h2>
        <a href="https://www.varsha.design/audioart">View demo</a>
      </div>
      : 
      <div className={styles.homeLogin}>
      {/* Button links to a different page */}
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