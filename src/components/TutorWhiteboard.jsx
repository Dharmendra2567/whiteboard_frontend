import eraserIcon from "../assets/eraser.svg";
import deleteIcon from "../assets/request-access.svg";
import accessRequestImg from "../assets/access-request.svg";
import "./whiteboard.css";

import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import SessionTimer from "./SessionTimer";

const TutorWhiteboard = ({
  roomId,
  role,
  userId,
  tutorId,
  tutorName,
  studentId,
  studentName,
  sessionId,
  dateOfSession,
  startTime,
  endTime,
  tutor_url,
  student_url,
  roomData,
}) => {
  const excalidrawAPIRef = useRef(null);
  const socketRef = useRef(null);
  const isRemoteUpdateRef = useRef(false);

  const [pendingStudent, setPendingStudent] = useState(null);
  const [approvedStudent, setApprovedStudent] = useState(null);
  const [accessStatus, setAccessStatus] = useState("idle");
  const [roomStatus, setRoomStatus] = useState("loading");
  const [joinErrorMsg, setJoinErrorMsg] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8085";

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      query: {
        roomId,
        role,
        tutorId,
        tutorName,
        studentId,
        studentName,
        sessionId,
        date_of_session: dateOfSession,
        start_time: startTime,
        end_time: endTime,
      },
      transports: ["websocket"],
    });

    socketRef.current = socket;
    setRoomStatus("valid");

    socket.on("join-error", (msg) => {
      setJoinErrorMsg(msg.message);
    });

    socket.on("whiteboard-clear", () => {
      excalidrawAPIRef.current?.updateScene({
        elements: [],
        appState: {},
        files: {},
      });
    });

    socket.on("whiteboard-sync", (scene) => {
      isRemoteUpdateRef.current = true;
      excalidrawAPIRef.current?.updateScene(scene);

      if (scene.allPermissions) {
        const approved = scene.allPermissions.find(
          (p) => p.role === "student" && p.write === true
        );

        if (approved) {
          let name = approved.name;
          if (scene.students) {
            const sInfo = scene.students.find(s => s.student_id === approved.user_id);
            if (sInfo) name = sInfo.student_name;
          }

          setApprovedStudent({
            studentId: approved.user_id || approved.student_id,
            studentName: name,
          });
          setAccessStatus("approved");
        } else {
          setApprovedStudent(null);
          setAccessStatus("idle");
        }
      }

      setTimeout(() => {
        isRemoteUpdateRef.current = false;
      }, 0);
    });

    socket.on("request-access", ({ studentId, studentName }) => {
      console.log("Received request-access from:", studentId);
      setPendingStudent({ studentId, studentName });
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, role]);

  if (roomStatus === "loading") return null;
  if (roomStatus === "invalid") return null;

  const handleReady = (api) => {
    excalidrawAPIRef.current = api;
  };

  const allowStudent = () => {
    if (!pendingStudent) return;

    console.log("Allowing student:", pendingStudent.studentId);
    socketRef.current.emit("access-response", {
      studentId: pendingStudent.studentId,
      status: "approved",
    });

    setApprovedStudent(pendingStudent);
    setAccessStatus("approved");
    setPendingStudent(null);
  };

  const denyStudent = () => {
    if (!pendingStudent) return;

    console.log("Denying student:", pendingStudent.studentId);
    socketRef.current.emit("access-response", {
      studentId: pendingStudent.studentId,
      status: "denied",
    });

    setPendingStudent(null);
  };

  const autoMovePage = (api) => {
    const appState = api.getAppState();
    const elements = api.getSceneElements();
    if (!elements.length) return;

    const last = elements[elements.length - 1];
    const buffer = 40;
    const maxY = last.y + last.height;
    const minY = last.y;

    const pageIndex = Math.floor(Math.abs(appState.scrollY) / 700);
    const pageTop = pageIndex * 700;
    const pageBottom = (pageIndex + 1) * 700;

    if (maxY > pageBottom - buffer) {
      api.updateScene({
        appState: { ...appState, scrollY: -(pageIndex + 1) * 700 },
      });
    }

    if (minY < pageTop + buffer && pageIndex > 0) {
      api.updateScene({
        appState: { ...appState, scrollY: -(pageIndex - 1) * 700 },
      });
    }
  };

  const handleClearBoard = () => {
    socketRef.current.emit("whiteboard-clear");
  };

  const removeAccess = () => {
    const targetId = approvedStudent?.studentId || studentId;
    console.log("Removing access for:", targetId);

    if (socketRef.current && targetId) {
      socketRef.current.emit("access-response", {
        studentId: targetId,
        status: "denied",
      });
    }

    setApprovedStudent(null);
    setAccessStatus("idle");
  };

  return (
    <>
      <header className="tw-header">
        <span style={{
          fontSize: "20px",
          fontWeight: "800",
          color: "white",
          fontFamily: "'Manrope', sans-serif",
          marginRight: "20px"
        }}>
          Whiteboard
        </span>

        <div className="tw-title">Tutor Board</div>

        <div className="tw-status-timer-container" style={{ position: "absolute", left: "20%", transform: "translateX(-50%)", display: "flex", alignItems: "center" }}>
          <SessionTimer startTime={startTime} endTime={endTime} dateOfSession={dateOfSession} />
        </div>

        <div className="tw-actions">
          <button
            className="share-btn"
            onClick={() => setIsShareOpen(true)}
            style={{
              marginRight: "10px",
              padding: "8px 16px",
              background: "#ffffff",
              color: "#5ab9db",
              border: "1px solid #5ab9db",
              borderRadius: "100px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            Share
          </button>

          <button className="tw-clear-btn" onClick={handleClearBoard}>
            <img src={eraserIcon} alt="Clear board" />
            Clear
          </button>

          <button
            className="tw-icon-btn"
            onClick={removeAccess}
            disabled={accessStatus !== "approved"}
            data-tooltip="Remove Access"
            style={{
              opacity: accessStatus === "approved" ? 1 : 0.5
            }}
          >
            <img
              src={deleteIcon}
              alt="Remove access"
              style={{
                filter: accessStatus === "approved" ? "none" : "brightness(0) invert(1)"
              }}
            />
          </button>
        </div>
      </header>

      <main
        id="excalidraw-container"
        style={{ height: "calc(100vh - 105px)", width: "100vw", position: "relative" }}
      >
        {joinErrorMsg && (
          <div style={{ color: "red", padding: "20px", textAlign: "center" }}>{joinErrorMsg}</div>
        )}

        {!joinErrorMsg && (
          <Excalidraw
            excalidrawAPI={handleReady}
            onPointerUp={() => {
              const api = excalidrawAPIRef.current;
              if (!api) return;

              autoMovePage(api);

              const scene = api.getSceneElements();
              const appState = api.getAppState();

              socketRef.current.emit("whiteboard-update", {
                elements: scene,
                appState: {
                  scrollX: appState.scrollX,
                  scrollY: appState.scrollY,
                  zoom: appState.zoom,
                  viewBackgroundColor: appState.viewBackgroundColor,
                },
              });
            }}
          />
        )}

        {isShareOpen && (
          <div className="popup-overlay" onClick={() => setIsShareOpen(false)}>
            <div className="popup-card" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginBottom: "16px", color: "#333" }}>Share Student Link</h3>
              <div style={{ background: "#f5f5f5", padding: "12px", borderRadius: "8px", marginBottom: "20px", wordBreak: "break-all", fontSize: "13px", color: "#555", textAlign: "left", border: "1px solid #ddd" }}>
                {student_url || "No link available"}
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  className="deny-btn"
                  onClick={() => setIsShareOpen(false)}
                  style={{ flex: 1 }}
                >
                  Close
                </button>
                <button
                  className="approve-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(student_url);
                    alert("Link copied!");
                  }}
                  style={{ flex: 1 }}
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        )}

        {pendingStudent && (
          <div className="popup-overlay">
            <div className="popup-card">
              <img src={accessRequestImg} alt="Access request" />
              <div className="popup-title">
                {pendingStudent.studentName || "Student"} is requesting access
              </div>
              <div className="popup-actions">
                <button className="deny-btn" onClick={denyStudent}>Deny</button>
                <button className="approve-btn" onClick={allowStudent}>Approve</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default TutorWhiteboard;