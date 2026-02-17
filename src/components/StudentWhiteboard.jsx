// import { captureCurrentPage } from "./saveCurrentPage";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import RequestAccessIcon from "../assets/requeststudent.svg";
import SessionTimer from "./SessionTimer";
import "./whiteboard.css";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

function StudentWhiteboard({
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
}) {
  const excalidrawAPIRef = useRef(null);
  const pendingSceneRef = useRef(null);
  const socketRef = useRef(null);
  const isDrawingRef = useRef(false);

  const isRemoteUpdateRef = useRef(false);
  const [roomStatus, setRoomStatus] = useState("loading");
  const [joinErrorMsg, setJoinErrorMsg] = useState(null);
  const [tutorStatus, setTutorStatus] = useState("Offline");
  const [accessStatus, setAccessStatus] = useState("idle");
  const accessStatusRef = useRef("idle");
  const [showAccessRemovedMsg, setShowAccessRemovedMsg] = useState(false);

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

  useEffect(() => {
    if (!roomId || role !== "student") return;

    const init = async () => {
      try {
        setRoomStatus("valid");

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

        socket.on("join-error", (msg) => {
          console.error("Join error:", msg.message);
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
          const { permissions, ...excalidrawScene } = scene;

          // Update visual board
          excalidrawAPIRef.current?.updateScene(excalidrawScene);

          // Only update permission if it's explicitly included in the sync packet.
          // This prevents "flicker" when tutor emits updates that might lack permissions info.
          if (permissions && typeof permissions.write !== 'undefined') {
            const newStatus = permissions.write === true ? "approved" : "idle";
            if (accessStatusRef.current !== newStatus) {
              accessStatusRef.current = newStatus;
              setAccessStatus(newStatus);
            }
          }
        });

        socket.on("access-response", ({ status }) => {
          console.log("Student received access-response:", status);

          if (accessStatusRef.current === "approved" && status === "denied") {
            setShowAccessRemovedMsg(true);
            setTimeout(() => setShowAccessRemovedMsg(false), 3000);
          }

          accessStatusRef.current = status;
          setAccessStatus(status);
        });

        socket.on("tutor-status", (status) => {
          setTutorStatus(status.online ? "Online" : "Offline");
        });
      } catch (err) {
        console.error(err);
        setRoomStatus("invalid");
      }
    };

    init();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [roomId, role]); // Removed accessStatus dependency to prevent flicker/reconnection

  if (roomStatus === "loading") return null;
  if (roomStatus === "invalid") return null;

  const handleReady = (api) => {
    excalidrawAPIRef.current = api;
    if (pendingSceneRef.current) {
      api.updateScene({
        elements: pendingSceneRef.current.elements,
        appState: pendingSceneRef.current.appState,
      });
      pendingSceneRef.current = null;
    }
  };

  const requestAccess = () => {
    if (!socketRef.current) return;
    console.log("Student requesting access...");
    socketRef.current.emit("request-access", {
      studentId,
      studentName,
    });
    accessStatusRef.current = "waiting";
    setAccessStatus("waiting");
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

        <div className="tw-title">Student Board</div>

        <div className="tw-status-timer-container" style={{ position: "absolute", left: "20%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(255,255,255,0.9)",
            padding: "6px 16px",
            borderRadius: "100px",
            border: "1px solid rgba(0,0,0,0.05)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            height: "34px",
            boxSizing: "border-box"
          }}>
            <span
              className={`tutor-status-dot ${tutorStatus === "Online" ? "online" : "offline"}`}
              style={{ width: "16px", height: "16px", borderRadius: "50%", background: tutorStatus === "Online" ? "#22c55e" : "#ef4444" }}
            />
          </div>
          <SessionTimer startTime={startTime} endTime={endTime} dateOfSession={dateOfSession} />
        </div>

        <div className="tw-actions">
          {accessStatus !== "approved" && (
            <button
              className="tw-clear-btn"
              onClick={requestAccess}
              disabled={accessStatus === "waiting" || showAccessRemovedMsg}
              style={{
                background: showAccessRemovedMsg ? "#BABABA" : undefined
              }}
            >
              <img src={RequestAccessIcon} alt="request access" />
              {showAccessRemovedMsg
                ? "Access Removed"
                : accessStatus === "waiting"
                  ? "Waiting..."
                  : "Request Access"}
            </button>
          )}
          {accessStatus === "approved" && (
            <div style={{ background: "rgba(34, 197, 94, 0.25)", color: "#16a34a", padding: "8px 20px", borderRadius: "100px", fontSize: "14px", fontWeight: 800, border: "1px solid rgba(34, 197, 94, 0.3)" }}>
              Access Approved
            </div>
          )}
        </div>
      </header >

      <main
        id="excalidraw-container"
        style={{ height: "calc(100vh - 105px)", width: "100vw", position: "relative" }}
      >
        {joinErrorMsg && (
          <div style={{ color: "red", padding: "20px", textAlign: "center", position: "absolute", width: "100%", zIndex: 100 }}>{joinErrorMsg}</div>
        )}
        <Excalidraw
          excalidrawAPI={handleReady}
          viewModeEnabled={accessStatus !== "approved"}
          onPointerDown={() => {
            if (accessStatus === "approved") {
              isDrawingRef.current = true;
            }
          }}
          onPointerUp={() => {
            if (accessStatus !== "approved") return;
            isDrawingRef.current = false;
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
      </main>
    </>
  );
}

export default StudentWhiteboard;