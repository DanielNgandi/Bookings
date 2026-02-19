import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AddClient from "./pages/Addclient";
import Home from "./pages/Home";
import AddHotel from "./pages/AddHotel";
import CreateBooking from "./pages/createBooking";
import Register from "./components/Register";
import Login from "./components/Login";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/add-client" element={<AddClient />} />
        <Route path="/add-hotel" element={<AddHotel />} />
        <Route path="/create-booking" element={<CreateBooking />} />
      </Routes>
    </Router>
  );
}

export default App;
