import { useState, useEffect } from "react";

const API_KEY = process.env.REACT_APP_GMAIL_API_KEY;
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
];

function Connection({ access_token, id }) {
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [gapi, setGapi] = useState(null);
  const [messages, setMessages] = useState(null);

  useEffect(() => {
    if (messages) {
      console.log({ messages });
    }
  }, [messages]);

  useEffect(() => {
    if (gapiLoaded) {
      /* global gapi */
      const gapiLoaded = window.gapi;
      console.log({ gapiLoaded });
      setGapi(gapiLoaded);
    } else {
      console.log("gapi not not loaded");
    }
  }, [gapiLoaded]);

  useEffect(() => {
    if (gapi) {
      gapi.load("client:auth2");
    }
    if (gapi && gapi.client) {
      gapi.client.setToken(access_token);
      gapi.client
        .init({
          apiKey: API_KEY,
          discoveryDocs: DISCOVERY_DOCS,
          //accessToken: access_token,
        })
        .then(function () {
          // Executes an API request, and returns a Promise.
          // The method name `language.translations.list` comes from the API discovery.
          if (gapi.client.gmail?.users?.messages) {
            gapi.client.gmail.users.messages
              .list({
                userId: id,
              })
              .then((messages) => setMessages(messages));
          }

          const users = gapi.client.gmail.users.getProfile({
            userId: id,
          });
        });
    }
  });

  return (
    <>
      <button id="authorize" onClick={() => console.log("first")}>
        Authorize
      </button>
      <button id="signout" onClick={() => console.log("singout")}>
        Sign Out
      </button>
    </>
  );
}

export default Connection;
