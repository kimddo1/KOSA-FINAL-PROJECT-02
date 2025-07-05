import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/home/Home.jsx";
import JobList from "./pages/job/JobList.jsx";
import Login from "./pages/user/Login.jsx";
import Signup from "./pages/user/Signup.jsx";
import RoleTest from './pages/test/RoleTest.jsx';
import MyPage from "./pages/user/MyPage.jsx";
import CorporateHome from "./pages/home/CorporateHome.jsx";
import ApplicantList from "./pages/applicant/ApplicantList.jsx";
import Email from "./pages/email/Email.jsx";
import PostRecruitment from "./pages/post/PostRecruitment.jsx";
import CommonViewPost from "./pages/post/CommonViewPost.jsx";
import PartnerList from "./pages/partner/PartnerList.jsx";
import PartnerDetail from './pages/partner/PartnerDetail.jsx';
import ViewPost from './pages/post/ViewPost.jsx';
import EditPost from './pages/post/EditPost.jsx';
import PassedApplicants from "./pages/applicant/PassedApplicants.jsx";
import RejectedApplicants from "./pages/applicant/RejectedApplicants.jsx";
import ManagerSchedule from './pages/schedule/ManagerSchedule.jsx';
import MemberSchedule from './pages/schedule/MemberSchedule.jsx';

// Context & Constants
import { ThemeProvider } from "./context/ThemeContext";
import { ROLES } from './constants/roles';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import TestConnection from './components/TestConnection';
import ScrollToTop from './components/ScrollToTop';
import Chatbot from './components/Chatbot';
import { ChakraProvider } from '@chakra-ui/react';

// Styles
import "react-calendar/dist/Calendar.css";
import "./App.css";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <h1 className="text-2xl font-bold text-red-500">Something went wrong.</h1>
          <pre className="mt-4 p-4 bg-gray-100 rounded">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

// App Routes Component
function AppRoutes() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <ScrollToTop />
      <ChakraProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-[#eef6ff] dark:bg-black">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/joblist" element={<JobList />} />
              <Route path="/common/company" element={<PartnerList />} />
              <Route path="/common/company/:id" element={<PartnerDetail />} />
              <Route path="/common/jobposts/:id" element={<CommonViewPost />} />
              <Route path="/role-test" element={<RoleTest />} />
              <Route path="/test-connection" element={<TestConnection />} />

              {/* Protected Routes */}
              <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
              <Route path="/corporatehome" element={<ProtectedRoute><CorporateHome /></ProtectedRoute>} />
              <Route path="/applicantlist" element={<ProtectedRoute><ApplicantList /></ProtectedRoute>} />
              <Route path="/email" element={<ProtectedRoute><Email /></ProtectedRoute>} />
              <Route path="/postrecruitment" element={<ProtectedRoute><PostRecruitment /></ProtectedRoute>} />
              <Route path="/company/jobposts/:id" element={<ProtectedRoute><CommonViewPost /></ProtectedRoute>} />
              <Route path="/viewpost/:jobPostId" element={<ProtectedRoute><ViewPost /></ProtectedRoute>} />
              <Route path="/passedapplicants/:jobPostId" element={<ProtectedRoute><PassedApplicants /></ProtectedRoute>} />
              <Route path="/editpost/:jobPostId" element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
              <Route path="/rejectedapplicants/:jobPostId" element={<ProtectedRoute><RejectedApplicants /></ProtectedRoute>} />
              <Route path="/managerschedule" element={<ProtectedRoute><ManagerSchedule /></ProtectedRoute>} />
              <Route path="/memberschedule" element={<ProtectedRoute><MemberSchedule /></ProtectedRoute>} />
              <Route path="/applicantlist/:jobPostId" element={<ProtectedRoute><ApplicantList /></ProtectedRoute>} />
            </Routes>
            {user && user.role !== 'guest' && <Chatbot />}
          </div>
        </ThemeProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
}

function App() {
  console.log('App component rendering');

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
