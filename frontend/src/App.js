import "./App.css";
import Auth from "./pages/AuthPage/Auth";
import TaskBoard from "./pages/TaskboardPage/TaskBoard";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/DashboardPage/Dashboard";
import CompletedTasks from "./pages/CompletedTaskPage/CompletedTasks";
import Settings from "./pages/SettingsPage/Settings";
import ManagementBoard from "./pages/ManagementBoardPage/ManagementBoard";
import ProjectDetailPage from "./pages/ProjectPage/ProjectDetailPage";
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
          <Route path="/settings" element={<Settings />} />
          <Route path="/management-board" element={<ManagementBoard />} />
          <Route path="/project/:projectId" element={<ProjectDetailPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
