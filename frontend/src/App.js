import "./App.css";
import Auth from "./components/Auth";
import TaskBoard from "./components/TaskBoard";
import Navbar from "./components/Navbar";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import CompletedTasks from "./components/CompletedTasks";
import Settings from "./components/Settings";
import ManagementBoard from "./components/ManagementBoard";
import ProjectDetailPage from "./components/ProjectDetailPage";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router";

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbar = location.pathname === "/" || location.pathname === "/auth";

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
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/tasks" element={<TaskBoard />} />
          <Route path="/completed-tasks" element={<CompletedTasks />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/management-board" element={<ManagementBoard />} />
          <Route path="/project/:projectId" element={<ProjectDetailPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
