import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Programs from './pages/Programs'
import Courses from './pages/Courses'
import Faculty from './pages/Faculty'
import Rooms from './pages/Rooms'
import Students from './pages/Students'
import TimetableList from './pages/TimetableList'
import TimetableView from './pages/TimetableView'
import TimetableCreate from './pages/TimetableCreate'

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="programs" element={<Programs />} />
          <Route path="courses" element={<Courses />} />
          <Route path="faculty" element={<Faculty />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="students" element={<Students />} />
          <Route path="timetables" element={<TimetableList />} />
          <Route path="timetables/create" element={<TimetableCreate />} />
          <Route path="timetables/:id" element={<TimetableView />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
