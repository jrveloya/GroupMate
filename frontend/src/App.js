import "./App.css";
import Home from "./components/Home";
import TaskBoard from "./components/TaskBoard";
import Navbar from "./components/Navbar";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import CompletedTasks from "./components/CompletedTasks";
import Settings from "./components/Settings";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router";

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<TaskBoard />} />
          <Route path="/completed-tasks" element={<CompletedTasks />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
