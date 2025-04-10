import "./App.css";
import Home from "./components/Home";
import Page1 from "./components/Page1";
import Navbar from "./components/Navbar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/page" element={<Page1 />} />
      </Routes>
    </Router>
  );
}

export default App;
