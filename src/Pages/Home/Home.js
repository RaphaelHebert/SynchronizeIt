// import PropTypes from "prop-types";

import { useState, useEffect } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import InputIcon from "@mui/icons-material/Input";

import { Connection } from "../../Components";

// TODO: put the axios call in a separate folder/file
// TODO: handle errors from useGoogleLogin call and the axios call

function Home() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  console.log({ user });

  const login = useGoogleLogin({
    onSuccess: (response) => setUser(response),
    onError: (error) => console.log("Login Failed:", error),
  });

  // log out function to log the user out of google and set the profile object to null
  const logOut = () => {
    googleLogout();
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    // TO INVESTIGATE access token in url and header?
    if (user) {
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          console.log({ res });
          setProfile(res.data);
        })
        .catch((err) => console.log(err));
    }
  }, [user]);

  return (
    <div>
      <header>
        <h1>Gmail connect</h1>
      </header>
      {profile && (
        <div>
          <Connection token={user?.access_token} id={profile.id} />
          <InputIcon />
          <h3>User {profile.name} is Logged in !!</h3>
          {profile?.picture && (
            <img src={profile.picture} alt={`${profile.name}'s picture`} />
          )}
          <p>Name: {profile.name}</p>
          <p>Email Address: {profile.email}</p>
        </div>
      )}

      {user ? (
        <button onClick={logOut}>Log out</button>
      ) : (
        <button onClick={login}>Sign in with Google 🚀 </button>
      )}
    </div>
  );
}

Home.propTypes = {};

export default Home;
