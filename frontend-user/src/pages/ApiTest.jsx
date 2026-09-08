import { useEffect, useState } from "react";
import api from "../services/api";

function ApiTest() {
  const [message, setMessage] = useState("Testing backend connection...");

  useEffect(() => {
    const testBackend = async () => {
      try {
        const response = await api.get("/accounts/profile/");

        console.log("SUCCESS:", response);
        console.log("DATA:", response.data);

        setMessage("Backend connected successfully!");
      } catch (error) {
        console.log("FULL AXIOS ERROR:", error);
        console.log("ERROR MESSAGE:", error.message);
        console.log("ERROR CODE:", error.code);
        console.log("ERROR RESPONSE:", error.response);
        console.log("ERROR REQUEST:", error.request);

        if (error.response) {
          if (error.response.status === 401) {
            setMessage("Backend connected! Login required.");
          } else {
            setMessage(
              `Backend responded with HTTP ${error.response.status}`
            );
          }
        } else if (error.request) {
          setMessage("Request sent, but Django did not respond.");
        } else {
          setMessage("Request configuration error.");
        }
      }
    };

    testBackend();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      <h1>Zivora</h1>
      <h2>{message}</h2>
    </div>
  );
}

export default ApiTest;