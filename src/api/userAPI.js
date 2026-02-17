
//const BASE_URL = "http://10.140.56.126:5000/api/room";

const BASE_URL = `${import.meta.env.VITE_SOCKET_URL}/api/room`;

const commonHeaders = {
  "Content-Type": "application/json",
};

/* =======================
   Student API (FIXED)
======================= */
export const generateStudentLink = async ({ tutorId, roomId }) => {
  const body = {
    tutorId,
    roomId,
  };

  const response = await fetch(`${BASE_URL}/generate-student-link`, {
    method: "POST",
    headers: commonHeaders,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to generate student link");
  }

  return await response.json();
};








export const generateRoomLink = async (payload) => {
  const response = await fetch(
    `${BASE_URL}/generate-link`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || "Failed to generate room link");
  }

  return response.json();
};



export const validateRoom = async (token) => {
  if (!token) {
    throw new Error("Validation token missing");
  }


  const response = await fetch(
    `${BASE_URL}/validate/${token}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Room validation failed");
  }

  return response.json();
};