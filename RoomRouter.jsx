

// import React, { Suspense, lazy } from "react";
// import { useParams, useSearchParams } from "react-router-dom";

// const TutorWhiteboard = lazy(() => import("./src/components/TutorWhiteboard"));
// const StudentWhiteboard = lazy(() => import("./src/components/StudentWhiteboard"));

// function RoomRouter() {
//   const { roomId } = useParams();
//   const [params] = useSearchParams();
//   const role = params.get("role");

//   if (role === "tutor")
//     return (
//       <Suspense fallback={<div>Loading tutor whiteboard…</div>}>
//         <TutorWhiteboard />
//       </Suspense>
//     );

//   return (
//     <Suspense fallback={<div>Loading student whiteboard…</div>}>
//       <StudentWhiteboard />
//     </Suspense>
//   );
// }

// export default RoomRouter;




/*
import React, { useEffect, useState, Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import { validateRoom } from "./src/api/userAPI";

const TutorWhiteboard = lazy(() => import("./src/components/TutorWhiteboard"));
const StudentWhiteboard = lazy(() => import("./src/components/StudentWhiteboard"));

function RoomRouter() {
  // 🔑 token comes from URL param (named roomId in route)
  const { roomId: token } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState(null);
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    const validateAndResolveRole = async () => {
      try {
        setLoading(true);

        if (!token) {
          throw new Error("Validation token missing");
        }

        const validateResponse = await validateRoom(token);
        console.log("Validation response:", validateResponse);

        const {
          roomId: apiRoomId,
          role: apiRole,
          tutorId,
          tutorName,
          studentId,
          studentName,
          sessionId,
          date_of_session,
          start_time,
          end_time
        } = validateResponse;

        if (!apiRoomId || !apiRole) {
          throw new Error("Invalid validation response");
        }

        setRole(apiRole);
        setValidatedRoomId(apiRoomId);
        setRoomData({
          tutorId,
          tutorName,
          studentId,
          studentName,
          sessionId,
          dateOfSession: date_of_session,
          startTime: start_time,
          endTime: end_time
        });

      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to validate room");
      } finally {
        setLoading(false);
      }
    };

    validateAndResolveRole();
  }, [token]);

  if (loading) return <div>Validating room…</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  if (role === "tutor") {
    return (
      <Suspense fallback={<div>Loading tutor whiteboard…</div>}>
        <TutorWhiteboard
          roomId={validatedRoomId}
          role={role}
          token={token}
          {...roomData}
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div>Loading student whiteboard…</div>}>
      <StudentWhiteboard
        roomId={validatedRoomId}
        role={role}
        token={token}
        {...roomData}
      />
    </Suspense>
  );
}

export default RoomRouter;
*/


import React, { useEffect, useState, Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import { validateRoom } from "./src/api/userAPI";

const TutorWhiteboard = lazy(() => import("./src/components/TutorWhiteboard"));
const StudentWhiteboard = lazy(() => import("./src/components/StudentWhiteboard"));

function RoomRouter() {
  // 🔑 token comes from URL param (named roomId in route)
  const { roomId: token } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    console.log("Room Data in Room Router", roomData);
    const validateAndResolveRoom = async () => {
      try {
        setLoading(true);

        if (!token) {
          throw new Error("Validation token missing");
        }

        // 1️⃣ Validate room with the 12-digit token
        const validateResponse = await validateRoom(token);

        // 2️⃣ Store the response which contains roomId, userId, role, and permissions
        setRoomData(validateResponse);

        console.log("validate respones ", validateResponse);


      } catch (err) {
        console.error("Room validation error:", err);
        setError(err.message || "Unable to validate room");
      } finally {
        setLoading(false);
      }
    };

    validateAndResolveRoom();
  }, [token]);

  if (loading) return <div>Validating room…</div>;
  if (error) return <div style={{ color: "red", padding: "20px" }}>{error}</div>;

  // Robustly handle if API wraps in .data or returns direct object
  const data = roomData?.data || roomData;
  if (!data) return <div style={{ padding: "20px" }}>No room data available.</div>;

  const {
    roomId,
    userId,
    role,
    permissions,
    tutorName,
    tutorId,
    studentName,
    studentId,
    sessionId,
    startTime,
    endTime,
    dateOfSession,
    start_time,
    end_time,
    date_of_session,
    tutor_url,
    student_url,
  } = data;

  const commonProps = {
    roomId,
    userId,
    role,
    permissions,
    tutorName,
    tutorId,
    studentName,
    studentId,
    sessionId,
    startTime: startTime || start_time,
    endTime: endTime || end_time,
    dateOfSession: dateOfSession || date_of_session,
    tutor_url,
    student_url,
    roomData: data,
  };

  if (role === "tutor") {
    return (
      <Suspense fallback={<div>Loading tutor whiteboard…</div>}>
        <TutorWhiteboard {...commonProps} />
      </Suspense>
    );
  }

  if (role === "student") {
    return (
      <Suspense fallback={<div>Loading student whiteboard…</div>}>
        <StudentWhiteboard {...commonProps} />
      </Suspense>
    );
  }

  return <div style={{ padding: "20px" }}>Invalid role: {role}</div>;
}

export default RoomRouter;