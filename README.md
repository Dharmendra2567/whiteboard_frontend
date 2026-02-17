# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# whiteboard-app

## API Documentation & Postman Testing

### Base URL
`https://whiteboard-backend-yraqx.ondigitalocean.app/api/room`

---

### 1. Validate Join Token
This endpoint validates the access token and returns room/user details.

- **Method:** `GET`
- **URL:** `{{base_url}}/validate/{{token}}`
- **Path Variable:**
  - `token`: A composite string consisting of `roomId` (first 6 characters) and `userId` (remaining characters).

#### Token Construction Logic:
- **Format:** `[RoomID(6 chars)][UserID]`
- **Example:** `ABC1232001`
  - `roomId`: `ABC123`
  - `userId`: `2001` (Tutor, as it starts with '2')
- **Role Identification (User ID prefix):**
  - Starts with `2`: **Tutor** (Gets write permissions)
  - Starts with `3`: **Student** (Gets read permissions)

#### Sample Response:
```json
{
  "roomId": "ABC123",
  "userId": "2001",
  "role": "tutor",
  "tutor": "...",
  "student": "...",
  "permissions": {
    "user_id": "2001",
    "role": "tutor",
    "read": true,
    "write": true
  },
  "allPermissions": [...] 
}
```

---

### 2. Generate Tutor Link (Prerequisite)
Use this to create a room and get a token if you don't have one.

- **Method:** `POST`
- **URL:** `{{base_url}}/generate-tutor-link`
- **Body (JSON):**
```json
{
  "tutorName": "John Tutor",
  "tutorId": "2001",
  "permissions": {
    "canDraw": true,
    "canChat": true
  }
}
```

---

### 3. Generate Student Link
Generate a link for a student to join an existing room.

- **Method:** `POST`
- **URL:** `{{base_url}}/generate-student-link`
- **Body (JSON):**
```json
{
  "tutorId": "2001",
  "roomId": "ABC123"
}
```

---

### Requirements for Testing:
1. **Valid Room ID:** The `roomId` part of the token must exist in the database.
2. **Session Validity:** If the room has a session assigned, ensure the `end_time` has not passed.
3. **Token Length:** Must be greater than 6 characters.
