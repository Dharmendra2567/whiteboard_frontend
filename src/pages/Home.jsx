import React, { useState } from "react";
import { generateRoomLink } from "../api/userAPI";
import { DUMMY_SESSION_PAYLOAD } from "../../dummySession";

const Home = () => {
  const [links, setLinks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    try {
      setLoading(true);
      setError("");

      const payload = {
        ...DUMMY_SESSION_PAYLOAD,
        role: "tutor",
      };

      const response = await generateRoomLink(payload);
      console.log("API Response:", response);

      const roomData = response?.data;

      if (!roomData?.tutor_url && !roomData?.student_url) {
        throw new Error("Room URLs not found in API response");
      }

      setLinks({
        tutor: roomData.tutor_url,
        student: roomData.student_url
      });

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate room link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", textAlign: "center", fontFamily: "'Manrope', sans-serif" }}>
      <h1 style={{ fontSize: "64px", fontWeight: "800", marginBottom: "40px", color: "#333" }}>
        Whiteboard
      </h1>

      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          padding: "16px 32px",
          fontSize: "18px",
          fontWeight: "600",
          cursor: "pointer",
          background: "linear-gradient(90deg, #5ab9db 0%, #c900d0 100%)",
          color: "white",
          border: "none",
          borderRadius: "100px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          marginBottom: "30px",
          transition: "transform 0.2s ease"
        }}
        onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
        onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
      >
        {loading ? "Generating..." : "Generate Room Links"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>
          {error}
        </p>
      )}

      {links && (
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "20px" }}>
          <button
            onClick={() => window.open(links.tutor, "_blank", "noopener,noreferrer")}
            style={{
              padding: "12px 24px",
              background: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "100px",
              cursor: "pointer",
              fontWeight: "600",
              boxShadow: "0 4px 10px rgba(79, 70, 229, 0.3)"
            }}
          >
            Join as Tutor
          </button>
          <button
            onClick={() => window.open(links.student, "_blank", "noopener,noreferrer")}
            style={{
              padding: "12px 24px",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "100px",
              cursor: "pointer",
              fontWeight: "600",
              boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)"
            }}
          >
            Join as Student
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;


// import React from "react";

// const Home = () => {
//   return (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         height: "100vh",
//       }}
//     >
//       <h1
//         style={{
//           fontFamily: "Poppins, sans-serif",
//           fontSize: "36px",
//           fontWeight: "600",
//           color: "#950202ff",
//           letterSpacing: "1px",
//         }}
//       >
//         Whiteboard
//       </h1>
//     </div>
//   );
// };

// export default Home;
