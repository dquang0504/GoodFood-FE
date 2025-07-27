import React from "react";
import { useFacebookSDK } from "../hooks/useFacebookSDK";

type Props = {
  onLoginSuccess: (accessToken: string) => void;
};

const FacebookLoginButton: React.FC<Props> = ({ onLoginSuccess }) => {

  const sdkReady = useFacebookSDK();
  
  const handleLogin = () => {
    if (!window.FB) {
      console.error("FB SDK chưa load xong");
      return;
    }

    window.FB.login(
      function (response: any) {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          onLoginSuccess(accessToken);
        } else {
          console.error("User cancelled login or did not authorize.");
        }
      },
      { scope: "public_profile,email" }
    );
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center justify-between gap-2 px-4 py-2 w-full border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-100 transition-colors duration-200 disabled:opacity-60"
    >
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/600px-2023_Facebook_icon.svg.png?20231011122028" alt="Facebook" className="w-5 h-5" />
      <span className="text-[15px] text-gray-700">Sign in with Facebook</span>
      <span className="text-m text-gray-700 font-medium"></span>
    </button>
  );
};

export default FacebookLoginButton;
