import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import GroupList from './components/Groups/GroupList';
import GroupForm from './components/Groups/GroupForm';
import TeacherList from './components/Teachers/TeacherList';
import TeacherUpload from './components/Teachers/TeacherUpload';
import TeacherForm from './components/Teachers/TeacherForm';
import ScheduleEditor from './components/Schedule/ScheduleEditor';
import SuccessPage from './components/Schedule/SuccessPage';
import GroupSchedule from './components/Schedule/GroupSchedule';
import TeacherSchedule from './components/Schedule/TeacherSchedule';
import Home from './components/Home';
import Sidebar from './components/Sidebar';
import Login from './components/Auth/Login';
import Logout from './components/Auth/Logout';
import PrivateRoute from './context/PrivateRoute';
import EducationalPlanList from './components/EducationalPlans/EducationalPlanList';
import EducationalPlanForm from './components/EducationalPlans/EducationalPlanForm';
import GroupEducationalPlanList from './components/GroupEducationalPlans/GroupEducationalPlanList';
import GroupEducationalPlanForm from './components/GroupEducationalPlans/GroupEducationalPlanForm';
import BrigadeAssignmentList from './components/BrigadeAssignments/BrigadeAssignmentList';
import BrigadeAssignmentForm from './components/BrigadeAssignments/BrigadeAssignmentForm';
import SubjectList from './components/Subjects/SubjectList';
import SubjectForm from './components/Subjects/SubjectForm';
import TeacherSubjectAssignmentList from './components/TeacherSubjectAssignment/TeacherSubjectAssignmentList';
import TeacherSubjectAssignmentForm from './components/TeacherSubjectAssignment/TeacherSubjectAssignmentForm';
import UserSettings from './components/User/UserSettings';
import UserProfile from "./components/User/UserProfile";
import TeacherUnavailableDatesList from "./components/TeacherUnavailableDates/TeacherUnavailableDatesList";
import TeacherUnavailableDatesForm from "./components/TeacherUnavailableDates/TeacherUnavailableDatesForm";
import GroupAvailableDatesList from "./components/GroupAvailableDates/GroupAvailableDatesList";
import GroupAvailableDatesForm from "./components/GroupAvailableDates/GroupAvailableDatesForm";
import GroupCalendar from "./components/GroupCalendar/GroupCalendar";
import GroupCalendarList from "./components/GroupCalendar/GroupCalendarList";
import NotFound from "./components/NotFound";



function App() {
    return (<Router>
        <Sidebar/>
        <div className="content">
            <Routes>
                <Route path="/login" element={<Login/>}/>
                <Route
                    path="*"
                    element={<PrivateRoute>
                        <MainApp/>
                    </PrivateRoute>}
                />
            </Routes>
        </div>
    </Router>);
}


function MainApp() {
    return (<Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/groups" element={<GroupList/>}/>
        <Route path="/groups/add" element={<GroupForm/>}/>
        <Route path="/groups/:id/edit" element={<GroupForm/>}/>
        <Route path="/teachers" element={<TeacherList/>}/>
        <Route path="/teachers/add" element={<TeacherForm/>}/>
        <Route path="/teachers/:id/edit" element={<TeacherForm/>}/>
        <Route path="/teachers/upload" element={<TeacherUpload/>}/>
        <Route path="/schedule/create" element={<ScheduleEditor/>}/>
        <Route path="/schedule/success" element={<SuccessPage/>}/>
        <Route path="/schedule/group" element={<GroupSchedule/>}/>
        <Route path="/schedule/teacher" element={<TeacherSchedule/>}/>
        <Route path="/logout" element={<Logout/>}/>

        <Route path="/educational_plans" element={<EducationalPlanList/>}/>
        <Route path="/educational_plans/add" element={<EducationalPlanForm/>}/>
        <Route path="/educational_plans/:id/edit" element={<EducationalPlanForm/>}/>
        <Route path="/group_educational_plans" element={<GroupEducationalPlanList/>}/>
        <Route path="/group_educational_plans/add" element={<GroupEducationalPlanForm/>}/>
        <Route path="/group_educational_plans/:id/edit" element={<GroupEducationalPlanForm/>}/>
        <Route path="/brigade_assignments" element={<BrigadeAssignmentList/>}/>
        <Route path="/brigade_assignments/add" element={<BrigadeAssignmentForm/>}/>
        <Route path="/brigade_assignments/:id/edit" element={<BrigadeAssignmentForm/>}/>
        <Route path="/subjects" element={<SubjectList/>}/>
        <Route path="/subjects/add" element={<SubjectForm/>}/>
        <Route path="/subjects/:id/edit" element={<SubjectForm/>}/>

        <Route path="/teacher_unavailable_dates" element={<TeacherUnavailableDatesList/>}/>
        <Route path="/teacher_unavailable_dates/:id/edit" element={<TeacherUnavailableDatesForm/>}/>
        <Route path="/group_available_dates" element={<GroupAvailableDatesList/>}/>
        <Route path="/group_available_dates/:id/edit" element={<GroupAvailableDatesForm/>}/>

        <Route path="/group_calendar/" element={<GroupCalendarList/>}/>
        <Route path="/group_calendar/:id" element={<GroupCalendar />} />

        <Route path="/teacher_subject_assignments" element={<TeacherSubjectAssignmentList/>}/>
        <Route path="/teacher_subject_assignments/add" element={<TeacherSubjectAssignmentForm/>}/>

        <Route path="/profile" element={<UserProfile/>}/>
        <Route path="/settings" element={<UserSettings/>}/>

        <Route path="*" element={<NotFound />} />
    </Routes>);
}

export default App;