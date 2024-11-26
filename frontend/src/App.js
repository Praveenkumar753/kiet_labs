import React from 'react';
import { BrowserRouter as Router, Route, Routes ,Link} from 'react-router-dom';
import UploadFile from './components/upload';
// import Students from './components/students';
import AddStudent from './components/addstudent';
import StudentRegistrationForm from './components/form';
import LabAvailability from './components/stats';
import Login from './components/login';
import Admin from "./components/admin";
import FormResponses from './components/res';
import ShowStudents from './components/data';
import ProtectedRoute from './components/protected';
const App = () => {
    return (
        <Router>
            <div>
                
                <Routes>
                
                    <Route path="/" element={<LabAvailability />} />
                    {/* <Route path="/upload" element={<UploadFile />} /> */}
                    {/* <Route path="/students" element={<Students />} /> */}
                    {/* <Route path="/addstudent" element={<AddStudent />} /> */}
                    <Route path="/register" element={<StudentRegistrationForm />} />
                    <Route path="/login" element={<Login />} />
                    {/* <Route path="/admin" element={<Admin />} /> */}
                    {/* <Route path="/responses" element={<FormResponses  />} /> */}
                    {/* <Route path="/show" element={<ShowStudents  />} /> */}
                    {/* <Route path="/waste" element={<Waste  />} /> */}

                    <Route path="/show" element={<ProtectedRoute><ShowStudents /></ProtectedRoute>} />
                    {/* <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} /> */}
                    <Route path="/responses" element={<ProtectedRoute><FormResponses /></ProtectedRoute>} />
                    <Route path="/addstudent" element={<ProtectedRoute><AddStudent /></ProtectedRoute>} />
                    <Route path="/upload" element={<ProtectedRoute><UploadFile /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />




                </Routes>
            </div>
        </Router>
    );
};

export default App;