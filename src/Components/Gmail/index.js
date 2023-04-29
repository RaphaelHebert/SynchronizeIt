import React, { useRef, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { listMessages, listLabels, getMessage } from "../../API/gmail";

const CLIENT_ID = process.env.REACT_APP_GCP_USER_ID;
const API_KEY = process.env.REACT_APP_GMAIL_API_KEY;
// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest";
// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/gmail.readonly";

function Gmail() {
  const authRef = useRef();
  const signOutRef = useRef();
  const contentRef = useRef();
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [gapiInited, setGapiInited] = useState(false);
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const [gisInited, setGisInited] = useState(false);
  const [tokenClient, setTokenClient] = useState(null);
  const [messageId, setMessageId] = useState(null);
  const [messages, setMessages] = useState({});

  useEffect(() => {
    const script = document.createElement("script");
    const scriptTwo = document.createElement("script");
    scriptTwo.src = "https://accounts.google.com/gsi/client";
    script.src = "https://apis.google.com/js/api.js";
    const main = document.getElementById("root");
    main.appendChild(script);
    main.appendChild(scriptTwo);
    script.onload = () => setGapiLoaded(true);
    scriptTwo.onload = () => setGsiLoaded(true);
  }, []);

  useEffect(() => {
    console.log({ messages });
  }, [messages]);
  async function initializeGapiClient() {
    console.log(API_KEY);
    await window.gapi.client.init({
      apiKey: `${API_KEY}`,
      discoveryDocs: [DISCOVERY_DOC],
    });
    setGapiInited(true);
  }

  const { data: messagesData, isSuccess: messagesSuccess } = useQuery({
    queryFn: listMessages,
    enabled: gapiInited && gisInited && !!tokenClient,
    queryKey: [tokenClient, "getMessages"],
    onSuccess: (data) => {
      console.log({ data });
    },
    onError: (error) => {
      console.log({ error });
    },
  });

  useQuery({
    queryFn: () => getMessage(messageId),
    enabled: !!messageId,
    queryKey: [messageId],
    onSuccess: (data) => {
      console.log("message", { data });
      const { id } = data.result;
      if (id && !messages[id]) console.log("set messages");
      setMessages((prev) => ({ ...prev, [id]: data.result }));
    },
    onError: (error) => {
      console.log({ error });
    },
  });
  // init the API after it has loaded
  useEffect(() => {
    if (gapiLoaded) {
      try {
        window.gapi.load("client", initializeGapiClient);
        setGapiInited(true);
      } catch (error) {
        console.log({ error });
      }
    }
  }, [gapiLoaded]);

  // init the Google Security Services after it has loaded
  useEffect(() => {
    if (gsiLoaded) {
      setTokenClient(
        window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: "", // defined later
        })
      );
      setGisInited(true);
    }
  }, [gsiLoaded]);

  useEffect(() => {
    if (gapiInited && gisInited) {
      authRef.current.style.visibility = "visible";
    } else {
      authRef.current.style.visibility = "hidden";
      signOutRef.current.style.visibility = "hidden";
    }
  }, [gapiInited, gisInited]);

  /**
   *  Sign in the user upon button click.
   */
  function handleAuthClick() {
    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        throw resp;
      }
      signOutRef.current.style.visibility = "visible";
      authRef.current.innerText = "Refresh";
      await listLabels();
    };

    if (window.gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      tokenClient.requestAccessToken({ prompt: "" });
    }
  }

  /**
   *  Sign out the user upon button click.
   */
  function handleSignoutClick() {
    const token = window.gapi.client.getToken();
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken("");
      document.getElementById("content").innerText = "";
      authRef.current.innerText = "Authorize";
      signOutRef.current.style.visibility = "hidden";
    }
  }

  async function listLabels() {
    let response;
    try {
      response = await window.gapi.client.gmail.users.labels.list({
        userId: "me",
      });
    } catch (err) {
      contentRef.current.innerText = err.message;
      return;
    }
    const labels = response.result.labels;
    if (!labels || labels.length === 0) {
      contentRef.current.innerText = "No labels found.";
      return;
    }
    // Flatten to string to display
    const output = labels.reduce(
      (str, label) => `${str}${label.name}\n`,
      "Labels:\n"
    );
    contentRef.current.innerText = output;
  }

  return (
    <>
      {messagesSuccess && messagesData?.result?.messages && (
        <>
          <h2>Messages</h2>
          <ul>
            {messagesData.result.messages.map((message) => (
              <li key={message.id}>
                <button onClick={() => setMessageId(message.id)}>
                  {message.id}
                </button>
                <p>{messages[message.id] && messages[message.id].snippet}</p>
              </li>
            ))}
          </ul>
        </>
      )}
      <button ref={authRef} id="authorize_button" onClick={handleAuthClick}>
        Authorize
      </button>
      <button ref={signOutRef} id="signout_button" onClick={handleSignoutClick}>
        Sign Out
      </button>
      <pre
        ref={contentRef}
        id="content"
        style={{ whiteSpace: "pre-wrap" }}
      ></pre>
    </>
  );
}

export default Gmail;
