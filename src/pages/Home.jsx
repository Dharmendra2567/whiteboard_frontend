import React, { useState } from "react";
import { generateRoomLink } from "../api/userAPI";
import { DUMMY_SESSION_PAYLOAD } from "../../dummySession";

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    ...DUMMY_SESSION_PAYLOAD,
    // Add specific fields for the new UI
    rawDate: "2026-02-17", // Default to match dummy year/month
    startHour: "01",
    startPeriod: "AM",
    endHour: "11",
    endPeriod: "PM",
  });
  const [links, setLinks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    // Restrict IDs to integers only
    if (name === "tutorId" || name === "studentId") {
      value = value.replace(/\D/g, ""); // Remove any non-digit character
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "refresh" ? value === "true" : value,
    }));
  };

  const openGenerator = () => {
    setIsModalOpen(true);
  };

  const openRecreator = () => {
    setFormData((prev) => ({ ...prev, refresh: true }));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      // Format date: YYYY-MM-DD -> DD-MM-YYYY
      const [y, m, d] = formData.rawDate.split("-");
      const formattedDate = `${d}-${m}-${y}`;

      const payload = {
        ...formData,
        date_of_session: formattedDate,
        start_time: `${formData.startHour}:00${formData.startPeriod}`,
        end_time: `${formData.endHour}:00${formData.endPeriod}`,
        role: "tutor",
      };

      const response = await generateRoomLink(payload);
      const roomData = response?.data;

      if (!roomData?.tutor_url && !roomData?.student_url) {
        throw new Error("Room URLs not found in API response");
      }

      setLinks({
        tutor: roomData.tutor_url,
        student: roomData.student_url,
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate room link");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback("Copied!");
      setTimeout(() => setCopyFeedback(""), 2000);
    });
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));

  return (
    <div style={{ padding: "40px", textAlign: "center", fontFamily: "'Manrope', sans-serif", minHeight: "100vh", background: "#f9fafb" }}>
      <h1 style={{ fontSize: "64px", fontWeight: "800", marginBottom: "40px", color: "#1f2937" }}>
        Whiteboard
      </h1>

      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "40px" }}>
        {!links && (
          <button
            onClick={openGenerator}
            style={primaryButtonStyle}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            Generate Room Links
          </button>
        )}

        {links && (
          <button
            onClick={openRecreator}
            style={secondaryButtonStyle}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            Recreate Room
          </button>
        )}
      </div>

      {error && (
        <p style={{ color: "#ef4444", fontWeight: "600", marginBottom: "20px" }}>
          {error}
        </p>
      )}

      {links && (
        <div style={linksContainerStyle}>
          <div style={linkBoxStyle}>
            <h3 style={linkTitleStyle}>Tutor Access</h3>
            <button
              onClick={() => window.open(links.tutor, "_blank", "noopener,noreferrer")}
              style={joinButtonStyle}
            >
              Join Room as Tutor
            </button>
          </div>

          <div style={linkBoxStyle}>
            <h3 style={linkTitleStyle}>Student Sharing</h3>
            {Array.isArray(links.student) ? (
              links.student.map((s, idx) => (
                <div key={idx} style={copyRowStyle}>
                  <span style={studentNameStyle}>{s.student_name}:</span>
                  <div style={inputGroupStyle} onClick={() => copyToClipboard(s.url)}>
                    <input readOnly value={s.url} style={readOnlyInputStyle} />
                    <button style={copyButtonStyle}>
                      <CopyIcon />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={inputGroupStyle} onClick={() => copyToClipboard(links.student)}>
                <input readOnly value={links.student} style={readOnlyInputStyle} />
                <button style={copyButtonStyle}>
                  <CopyIcon />
                </button>
              </div>
            )}
            {copyFeedback && <span style={feedbackStyle}>{copyFeedback}</span>}
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={{ marginBottom: "24px", color: "#111827" }}>Session Configuration</h2>
            <form onSubmit={handleSubmit} style={formStyle}>
              <div style={formGridStyle}>
                <div style={inputWrapperStyle}>
                  <label style={labelStyle}>Tutor Name</label>
                  <input name="tutorName" value={formData.tutorName} onChange={handleInputChange} style={inputStyle} required />
                </div>
                <div style={inputWrapperStyle}>
                  <label style={labelStyle}>Tutor ID</label>
                  <input name="tutorId" value={formData.tutorId} onChange={handleInputChange} style={inputStyle} required />
                </div>
                <div style={inputWrapperStyle}>
                  <label style={labelStyle}>Student Name</label>
                  <input name="studentName" value={formData.studentName} onChange={handleInputChange} style={inputStyle} required />
                </div>
                <div style={inputWrapperStyle}>
                  <label style={labelStyle}>Student ID</label>
                  <input name="studentId" value={formData.studentId} onChange={handleInputChange} style={inputStyle} required />
                </div>
                <div style={inputWrapperStyle}>
                  <label style={labelStyle}>Session ID</label>
                  <input name="sessionId" value={formData.sessionId} onChange={handleInputChange} style={inputStyle} required />
                </div>
                <div style={inputWrapperStyle}>
                  <label style={labelStyle}>Session Date</label>
                  <input type="date" name="rawDate" value={formData.rawDate} onChange={handleInputChange} style={inputStyle} required />
                </div>

                <div style={inputWrapperStyle}>
                  <label style={labelStyle}>Start Time</label>
                  <div style={{ display: "flex", gap: "4px", width: "100%" }}>
                    <select name="startHour" value={formData.startHour} onChange={handleInputChange} style={{ ...inputStyle, flex: 2 }}>
                      {hours.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select name="startPeriod" value={formData.startPeriod} onChange={handleInputChange} style={{ ...inputStyle, flex: 1 }}>
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                <div style={inputWrapperStyle}>
                  <label style={labelStyle}>End Time</label>
                  <div style={{ display: "flex", gap: "4px", width: "100%" }}>
                    <select name="endHour" value={formData.endHour} onChange={handleInputChange} style={{ ...inputStyle, flex: 2 }}>
                      {hours.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select name="endPeriod" value={formData.endPeriod} onChange={handleInputChange} style={{ ...inputStyle, flex: 1 }}>
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                <div style={inputWrapperStyle}>
                  <label style={labelStyle}>
                    Refresh
                    <span
                      title="If true, it creates a new link with the same session details. If false, it returns the earlier created link."
                      style={infoIconStyle}
                    >?</span>
                  </label>
                  <select name="refresh" value={formData.refresh.toString()} onChange={handleInputChange} style={inputStyle}>
                    <option value="false">False</option>
                    <option value="true">True</option>
                  </select>
                </div>
              </div>

              <div style={modalActionsStyle}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={cancelButtonStyle}>Cancel</button>
                <button type="submit" disabled={loading} style={submitButtonStyle}>
                  {loading ? "Processing..." : "Confirm & Generate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Styles ---

const primaryButtonStyle = {
  padding: "16px 32px",
  fontSize: "18px",
  fontWeight: "600",
  cursor: "pointer",
  background: "linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.4)",
  transition: "all 0.2s ease",
};

const secondaryButtonStyle = {
  padding: "16px 32px",
  fontSize: "18px",
  fontWeight: "600",
  cursor: "pointer",
  background: "white",
  color: "#4f46e5",
  border: "2px solid #4f46e5",
  borderRadius: "12px",
  transition: "all 0.2s ease",
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  background: "white",
  padding: "32px",
  borderRadius: "20px",
  width: "90%",
  maxWidth: "600px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
};

const inputWrapperStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "4px",
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#4b5563",
  display: "flex",
  alignItems: "center",
  gap: "6px"
};

const infoIconStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "16px",
  height: "16px",
  background: "#e5e7eb",
  borderRadius: "50%",
  fontSize: "11px",
  cursor: "help",
  color: "#6b7280"
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  outline: "none",
};

const modalActionsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  marginTop: "10px",
};

const cancelButtonStyle = {
  padding: "10px 20px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  background: "white",
  cursor: "pointer",
  fontWeight: "600",
};

const submitButtonStyle = {
  padding: "10px 20px",
  borderRadius: "8px",
  border: "none",
  background: "#4f46e5",
  color: "white",
  cursor: "pointer",
  fontWeight: "600",
};

const linksContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "24px",
  maxWidth: "800px",
  margin: "0 auto",
};

const linkBoxStyle = {
  background: "white",
  padding: "24px",
  borderRadius: "16px",
  width: "100%",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
  border: "1px solid #e5e7eb",
};

const linkTitleStyle = {
  fontSize: "18px",
  fontWeight: "700",
  marginBottom: "16px",
  color: "#374151",
  textAlign: "left",
};

const joinButtonStyle = {
  width: "100%",
  padding: "12px",
  background: "#4f46e5",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "600",
  cursor: "pointer",
};

const copyRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "12px",
};

const studentNameStyle = {
  fontWeight: "600",
  color: "#4b5563",
  minWidth: "100px",
  textAlign: "left",
};

const inputGroupStyle = {
  flex: 1,
  display: "flex",
  alignItems: "stretch",
  background: "#f3f4f6",
  borderRadius: "8px",
  overflow: "hidden",
  cursor: "pointer",
  border: "1px solid #e5e7eb",
};

const readOnlyInputStyle = {
  flex: 1,
  background: "transparent",
  border: "none",
  padding: "10px 12px",
  fontSize: "13px",
  color: "#1f2937",
  cursor: "pointer",
};

const copyButtonStyle = {
  background: "#fff",
  border: "none",
  borderLeft: "1px solid #e5e7eb",
  padding: "0 12px",
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
};

const feedbackStyle = {
  fontSize: "12px",
  color: "#10b981",
  fontWeight: "600",
};

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

export default Home;
