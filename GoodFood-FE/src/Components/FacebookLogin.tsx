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
      disabled={!sdkReady}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Đăng nhập bằng Facebook
    </button>
  );
};

export default FacebookLoginButton;
