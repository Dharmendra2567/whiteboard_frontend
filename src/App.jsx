import { useLocation } from "react-router-dom";
import RoomRouter from "../RoomRouter";
import MyRoutes from "./routes/MyRoutes";
import Header from "./components/Header";

function App() {
  const location = useLocation();
  const isRoomPage = location.pathname.startsWith("/room/");

  return (
    <div>
      {!isRoomPage && <Header />}
      <MyRoutes />
    </div>
  );
}

export default App;
