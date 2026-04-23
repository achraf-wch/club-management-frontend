import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './Context/AuthContext';
import Home from './Pages/Home';
import Clubs from './Pages/Clubs';
import AllEvents from './Pages/AllEvents';

// Admin
import AdminLayout from './Layout/AdminLayout';
import Dashboard from './Pages/Admin/Dashboard';
import AddClub from './Pages/Admin/AddClub';
import ManageClubs from './Pages/Admin/DeleteClub';
import DeleteClub from './Pages/Admin/DeleteClub';
import AdminLogin from './Pages/Admin/Login';
import AddPresident from './Pages/Admin/AddPresident';

// Member
import MemberDashboard from './Pages/Member/Dashboard';

// Login & Account Setup
import Login from './Pages/Login/Login';
import AccountSetup from './Pages/Login/AccountSetup';

// Club shared area
import ClubLayout from './layouts/ClubLayout';
import ClubDashboard from './features/club/pages/ClubDashboard';
import AddMember from './features/club/pages/AddMember';
import CreateEvent from './features/club/pages/CreateEvent';
import ClubMemberList from './features/club/pages/MemberList';
import ManageEvent from './features/club/pages/ManageEvent';
import Demandes from './features/club/pages/Demandes';
import ScanTicket from './features/club/pages/ScanTicket';
import ManageClub from './features/club/pages/ManageClub';
import AssignTicket from './features/club/pages/AssignTicket';

// Event & Club Detail
import EventDetail from './Pages/EventDetail';
import ClubDetail from './Pages/Clubs';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/Login/login" replace />;
  }

  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  if (allowedRoles.includes('admin')) {
    if (user.role === 'admin') {
      return children;
    }
    return <Navigate to="/Login/login" replace />;
  }

  const userRole = user.role === 'user' ? user.club_role : user.role;
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/Login/login" replace />;
  }

  return children;
}

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/clubs/:id" element={<ClubDetail />} />
          <Route path="/events" element={<AllEvents />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/Login/login" element={<Login />} />

          <Route
            path="/Login/AccountSetup"
            element={
              <ProtectedRoute>
                <AccountSetup />
              </ProtectedRoute>
            }
          />

          <Route
            path="/club"
            element={
              <ProtectedRoute allowedRoles={['president', 'board']}>
                <ClubLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ClubDashboard />} />
            <Route path="members/add" element={<AddMember />} />
            <Route path="members" element={<ClubMemberList />} />
            <Route path="events/create" element={<CreateEvent />} />
            <Route path="events/scan" element={<ScanTicket />} />
            <Route path="manage" element={<ManageClub />} />
            <Route path="tickets/assign" element={<AssignTicket />} />
            <Route
              path="events/manage"
              element={
                <ProtectedRoute allowedRoles={['president']}>
                  <ManageEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="demandes"
              element={
                <ProtectedRoute allowedRoles={['president']}>
                  <Demandes />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/President/Dashboard" element={<Navigate to="/club/dashboard" replace />} />
          <Route path="/President/addMember" element={<Navigate to="/club/members/add" replace />} />
          <Route path="/President/MemberList" element={<Navigate to="/club/members" replace />} />
          <Route path="/President/CreateEvent" element={<Navigate to="/club/events/create" replace />} />
          <Route path="/President/ManageEvent" element={<Navigate to="/club/events/manage" replace />} />
          <Route path="/President/Demandes" element={<Navigate to="/club/demandes" replace />} />
          <Route path="/President/ScanTicket" element={<Navigate to="/club/events/scan" replace />} />
          <Route path="/President/ClubManagement" element={<Navigate to="/club/manage" replace />} />
          <Route path="/President/AssignTickets" element={<Navigate to="/club/tickets/assign" replace />} />
          <Route path="/Bureaux/Dashboard" element={<Navigate to="/club/dashboard" replace />} />
          <Route path="/Bureaux/addMember" element={<Navigate to="/club/members/add" replace />} />
          <Route path="/Bureaux/MemberList" element={<Navigate to="/club/members" replace />} />
          <Route path="/Bureaux/createEvent" element={<Navigate to="/club/events/create" replace />} />
          <Route path="/Bureaux/ScanTicket" element={<Navigate to="/club/events/scan" replace />} />
          <Route path="/Bureaux/ClubManagement" element={<Navigate to="/club/manage" replace />} />
          <Route path="/Bureaux/AssignTickets" element={<Navigate to="/club/tickets/assign" replace />} />

          <Route
            path="/Member/Dashboard"
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <MemberDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="addPresident" element={<AddPresident />} />
            <Route path="addClub" element={<AddClub />} />
            <Route path="manageClubs" element={<ManageClubs />} />
            <Route path="deleteClub" element={<DeleteClub />} />
          </Route>

          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Page non trouvée</p>
                  <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Retour à l'accueil
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
