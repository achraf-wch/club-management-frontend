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

// Dashboards
import BoardDashboard from './Pages/Bureaux/Dashboard';
import MemberDashboard from './Pages/Member/Dashboard';
import PresidentDashboard from './Pages/President/Dashboard';

// Login & Account Setup
import Login from './Pages/Login/Login';
import AccountSetup from './Pages/Login/AccountSetup';

// President
import PresidentLayout from './Layout/PresidentLayout';
import AddMember from './Pages/President/AddMember';
import CreateEvent from './Pages/President/CreateEvent';
import PresidentMemberList from './Pages/President/MemberList';
import ManageEvent from './Pages/President/ManageEvent';
import Demandes from './Pages/President/Demandes';
import ScanTicket from './Pages/President/ScanTicket';
import ClubManagement from './Pages/President/ClubManagement';

// Bureaux
import BureauxLayout from './Layout/BureauxLayout';
import BureauxAddMember from './Pages/Bureaux/AddMember';
import BureauxCreateEvent from './Pages/Bureaux/CreateEvent';
import BureauxMemberList from './Pages/Bureaux/MemberList';
import BureauxClubManagement from './Pages/Bureaux/ClubManagement';

// Event & Club Detail
import EventDetail from './Pages/EventDetail';
import ClubDetail from './Pages/Clubs';

// Protected Route Component
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
  
  // If no specific roles required, allow any authenticated user
  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }
  
  // Check for admin role (stored in user.role)
  if (allowedRoles.includes('admin')) {
    if (user.role === 'admin') {
      return children;
    }
    console.warn('Access denied. User role:', user.role, 'Required: admin');
    return <Navigate to="/Login/login" replace />;
  }
  
  // Check for club roles (president, board, member) - stored in user.club_role
  const userRole = user.role === 'user' ? user.club_role : user.role;
  
  if (!allowedRoles.includes(userRole)) {
    console.warn('Access denied. User role:', userRole, 'Allowed roles:', allowedRoles);
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

          {/* ========== PUBLIC ROUTES ========== */}
          <Route path="/" element={<Home />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/clubs/:id" element={<ClubDetail />} />
          <Route path="/events" element={<AllEvents />} /> 
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/Login/login" element={<Login />} />

        {/* ========== ACCOUNT SETUP (PROTECTED - ANY LOGGED IN USER) ========== */}
        <Route 
          path="/Login/AccountSetup" 
          element={
            <ProtectedRoute>
              <AccountSetup />
            </ProtectedRoute>
          } 
        />
        
       {/* ========== PRESIDENT ROUTES (PROTECTED WITH LAYOUT) ========== */}
<Route
  path="/President"
  element={
    <ProtectedRoute allowedRoles={['president']}>
      <PresidentLayout />
    </ProtectedRoute>
  }
>
  <Route path="Dashboard" element={<PresidentDashboard />} />
  <Route path="addMember" element={<AddMember />} />
  <Route path="ManageEvent" element={<ManageEvent />} />
  <Route path="CreateEvent" element={<CreateEvent />} />
  <Route path="MemberList" element={<PresidentMemberList />} />
  <Route path="Demandes" element={<Demandes />} />
  <Route path="ScanTicket" element={<ScanTicket />} />
  <Route path="ClubManagement" element={<ClubManagement />} />
</Route>

        {/* ========== MEMBER ROUTES (PROTECTED) ========== */}
        <Route 
          path="/Member/Dashboard" 
          element={
            <ProtectedRoute allowedRoles={['member']}>
              <MemberDashboard />
            </ProtectedRoute>
          } 
        />
{/* ========== BUREAUX ROUTES (avec sidebar BureauxLayout) ========== */}
        <Route
          path="/Bureaux"
          element={
            <ProtectedRoute allowedRoles={['board']}>
              <BureauxLayout />
            </ProtectedRoute>
          }
        >
          <Route path="Dashboard" element={<BoardDashboard />} />
          <Route path="addMember" element={<BureauxAddMember />} />
          <Route path="MemberList" element={<BureauxMemberList />} />
          <Route path="createEvent" element={<BureauxCreateEvent />} />
          <Route path="ScanTicket" element={<ScanTicket />} />
          <Route path="ClubManagement" element={<BureauxClubManagement />} />
        </Route>

        
        {/* ========== ADMIN ROUTES (PROTECTED WITH LAYOUT) ========== */}
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
          <Route path="manageClubs" element={<ManageClubs/>} />
          <Route path="deleteClub" element={<DeleteClub />} />
        </Route>

        {/* ========== 404 FALLBACK ========== */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Page non trouvée</p>
                <a 
                  href="/" 
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
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