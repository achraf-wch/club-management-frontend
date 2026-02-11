import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './Context/AuthContext';
import Home from './Pages/Home';
import Clubs from './Pages/Clubs';

// Admin
import AdminLayout from './Layout/AdminLayout';
import Dashboard from './Pages/Admin/Dashboard';
import AddClub from './Pages/Admin/AddClub';
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
import AddMember from './Pages/President/AddMember';
import CreateEvent from './Pages/President/CreateEvent';
import PresidentMemberList from './Pages/President/MemberList';
import ManageEvent from './Pages/President/ManageEvent';
import Demandes from './Pages/President/Demandes';
import ScanTicket from './Pages/President/ScanTicket';

// Bureaux
import BureauxAddMember from './Pages/Bureaux/AddMember';
import BureauxCreateEvent from './Pages/Bureaux/CreateEvent';
import BureauxMemberList from './Pages/Bureaux/MemberList';

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
  return (
    <Router>
      <Routes>
        {/* ========== PUBLIC ROUTES ========== */}
        <Route path="/" element={<Home />} />
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/clubs/:id" element={<ClubDetail />} />
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
        
        {/* ========== PRESIDENT ROUTES (PROTECTED) ========== */}
        <Route 
          path="/President/Dashboard" 
          element={
            <ProtectedRoute allowedRoles={['president']}>
              <PresidentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/President/addMember" 
          element={
            <ProtectedRoute allowedRoles={['president']}>
              <AddMember />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/President/ManageEvent" 
          element={
            <ProtectedRoute allowedRoles={['president']}>
              <ManageEvent/>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/President/CreateEvent" 
          element={
            <ProtectedRoute allowedRoles={['president']}>
              <CreateEvent />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/President/MemberList" 
          element={
            <ProtectedRoute allowedRoles={['president']}>
              <PresidentMemberList/>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/President/Demandes" 
          element={
            <ProtectedRoute allowedRoles={['president']}>
              <Demandes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/President/ScanTicket" 
          element={
            <ProtectedRoute allowedRoles={['president', 'board']}>
              <ScanTicket />
            </ProtectedRoute>
          } 
        />

        {/* ========== MEMBER ROUTES (PROTECTED) ========== */}
        <Route 
          path="/Member/Dashboard" 
          element={
            <ProtectedRoute allowedRoles={['member']}>
              <MemberDashboard />
            </ProtectedRoute>
          } 
        />

        {/* ========== BUREAUX ROUTES (PROTECTED) ========== */}
        <Route 
          path="/Bureaux/Dashboard" 
          element={
            <ProtectedRoute allowedRoles={['board']}>
              <BoardDashboard/>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/Bureaux/addMember" 
          element={
            <ProtectedRoute allowedRoles={['board']}>
              <BureauxAddMember />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/Bureaux/MemberList" 
          element={
            <ProtectedRoute allowedRoles={['board']}>
              <BureauxMemberList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/Bureaux/createEvent" 
          element={
            <ProtectedRoute allowedRoles={['board']}>
              <BureauxCreateEvent />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/Bureaux/ScanTicket" 
          element={
            <ProtectedRoute allowedRoles={['board']}>
              <ScanTicket />
            </ProtectedRoute>
          } 
        />

        
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
  );
}

export default App;