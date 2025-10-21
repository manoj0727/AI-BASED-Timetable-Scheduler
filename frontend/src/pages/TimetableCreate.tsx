import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Plus, AlertTriangle, Sparkles, Save, Calendar } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8000/api/v1'

interface AcademicYear {
  id: string
  year: string
  start_date: string
  end_date: string
  is_active: boolean
}

interface Semester {
  id: string
  name: string
  academic_year_id: string
  start_date: string
  end_date: string
}

interface Program {
  id: string
  name: string
  code: string
  department_id: string
}

interface Course {
  id: string
  code: string
  name: string
  credits: number
  theory_hours: number
  lab_hours: number
  is_lab: boolean
}

interface Faculty {
  id: string
  first_name: string
  last_name: string
  employee_id: string
}

interface Room {
  id: string
  room_number: string
  building: string
  capacity: number
  is_lab: boolean
  features: string[]
}

interface ScheduledClass {
  id?: string
  course_id: string
  faculty_id: string
  room_id: string
  time_slot_id: string
  day_of_week: number
  start_time: string
  end_time: string
  course?: Course
  faculty?: Faculty
  room?: Room
}

interface Conflict {
  type: string
  description: string
  severity: string
  conflicting_class_id?: string
}

export default function TimetableCreate() {
  const navigate = useNavigate()

  // Form state
  const [name, setName] = useState('')
  const [academicYearId, setAcademicYearId] = useState('')
  const [semesterId, setSemesterId] = useState('')
  const [programId, setProgramId] = useState('')

  // Data lists
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [rooms, setRooms] = useState<Room[]>([])

  // Timetable state
  const [timetableId, setTimetableId] = useState<string | null>(null)
  const [scheduledClasses, setScheduledClasses] = useState<ScheduledClass[]>([])
  const [conflicts, setConflicts] = useState<Conflict[]>([])

  // UI state
  const [showAddClass, setShowAddClass] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; start: string; end: string } | null>(null)
  const [loading, setLoading] = useState(false)

  // Form for adding class
  const [newClass, setNewClass] = useState({
    course_id: '',
    faculty_id: '',
    room_id: '',
  })

  // Fetch initial data
  useEffect(() => {
    fetchAcademicYears()
    fetchPrograms()
    fetchCourses()
    fetchFaculty()
    fetchRooms()
  }, [])

  useEffect(() => {
    if (academicYearId) {
      fetchSemesters(academicYearId)
    }
  }, [academicYearId])

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/academic/years`)
      setAcademicYears(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch academic years')
    }
  }

  const fetchSemesters = async (yearId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/academic/semesters?academic_year_id=${yearId}`)
      setSemesters(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch semesters')
    }
  }

  const fetchPrograms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/academic/programs`)
      setPrograms(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch programs')
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses`)
      setCourses(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch courses')
    }
  }

  const fetchFaculty = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/faculty`)
      setFaculty(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch faculty')
    }
  }

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rooms`)
      setRooms(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch rooms')
    }
  }

  const handleCreateTimetable = async () => {
    if (!name || !academicYearId || !semesterId || !programId) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/timetables`, {
        name,
        academic_year_id: academicYearId,
        semester_id: semesterId,
        program_id: programId,
        is_published: false,
      })

      setTimetableId(response.data.data.id)
      toast.success('Timetable created! Now add classes manually or generate automatically.')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create timetable')
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = (selectInfo: any) => {
    const dayOfWeek = selectInfo.start.getDay()
    const startTime = selectInfo.start.toTimeString().slice(0, 5)
    const endTime = selectInfo.end.toTimeString().slice(0, 5)

    setSelectedSlot({ day: dayOfWeek, start: startTime, end: endTime })
    setShowAddClass(true)
  }

  const handleAddClass = async () => {
    if (!timetableId || !selectedSlot || !newClass.course_id || !newClass.faculty_id || !newClass.room_id) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      // First check for conflicts
      const conflictCheckResponse = await axios.post(`${API_BASE_URL}/timetables/check-conflicts`, {
        timetable_id: timetableId,
        course_id: newClass.course_id,
        faculty_id: newClass.faculty_id,
        room_id: newClass.room_id,
        day_of_week: selectedSlot.day,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        semester_id: semesterId,
      })

      const detectedConflicts = conflictCheckResponse.data.conflicts || []

      if (detectedConflicts.length > 0) {
        setConflicts(detectedConflicts)

        const hasHardConflict = detectedConflicts.some((c: Conflict) => c.severity === 'hard')

        if (hasHardConflict) {
          toast.error('Cannot add class: Hard conflicts detected!')
          return
        } else {
          const proceed = window.confirm(
            `Soft conflicts detected:\n${detectedConflicts.map((c: Conflict) => c.description).join('\n')}\n\nDo you want to proceed?`
          )
          if (!proceed) return
        }
      }

      // Add the class
      const response = await axios.post(`${API_BASE_URL}/timetables/${timetableId}/classes`, {
        course_id: newClass.course_id,
        faculty_id: newClass.faculty_id,
        room_id: newClass.room_id,
        day_of_week: selectedSlot.day,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        semester_id: semesterId,
      })

      setScheduledClasses([...scheduledClasses, response.data.data])
      toast.success('Class added successfully!')

      // Reset form
      setShowAddClass(false)
      setNewClass({ course_id: '', faculty_id: '', room_id: '' })
      setSelectedSlot(null)

    } catch (error: any) {
      const errorConflicts = error.response?.data?.conflicts || []
      if (errorConflicts.length > 0) {
        setConflicts(errorConflicts)
        toast.error('Scheduling conflicts detected!')
      } else {
        toast.error(error.response?.data?.error || 'Failed to add class')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateTimetable = async () => {
    if (!timetableId) {
      toast.error('Please create a timetable first')
      return
    }

    setLoading(true)
    const loadingToast = toast.loading('Generating timetable using AI optimization...')

    try {
      const response = await axios.post(`${API_BASE_URL}/timetables/${timetableId}/generate`)

      setScheduledClasses(response.data.data.scheduled_classes || [])
      toast.success('Timetable generated successfully!', { id: loadingToast })
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate timetable', { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  const handlePublishTimetable = async () => {
    if (!timetableId) return

    setLoading(true)
    try {
      await axios.post(`${API_BASE_URL}/timetables/${timetableId}/publish`)
      toast.success('Timetable published successfully!')
      navigate(`/timetables/${timetableId}`)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to publish timetable')
    } finally {
      setLoading(false)
    }
  }

  // Convert scheduled classes to FullCalendar events
  const calendarEvents = scheduledClasses.map((sc) => {
    const course = courses.find(c => c.id === sc.course_id)
    const facultyMember = faculty.find(f => f.id === sc.faculty_id)
    const room = rooms.find(r => r.id === sc.room_id)

    // Map day_of_week to date (0=Sunday, 1=Monday, etc.)
    const baseDate = new Date(2024, 0, 1) // Start from Jan 1, 2024 (Monday)
    const dayOffset = sc.day_of_week === 0 ? 6 : sc.day_of_week - 1 // Adjust for calendar
    const eventDate = new Date(baseDate)
    eventDate.setDate(baseDate.getDate() + dayOffset)

    const [startHour, startMin] = sc.start_time.split(':')
    const [endHour, endMin] = sc.end_time.split(':')

    const startDateTime = new Date(eventDate)
    startDateTime.setHours(parseInt(startHour), parseInt(startMin))

    const endDateTime = new Date(eventDate)
    endDateTime.setHours(parseInt(endHour), parseInt(endMin))

    return {
      id: sc.id,
      title: `${course?.code || 'Course'}\n${room?.room_number || 'Room'}`,
      start: startDateTime,
      end: endDateTime,
      backgroundColor: course?.is_lab ? '#10b981' : '#3b82f6',
      borderColor: course?.is_lab ? '#059669' : '#2563eb',
      extendedProps: {
        course: course?.name,
        faculty: `${facultyMember?.first_name} ${facultyMember?.last_name}`,
        room: `${room?.building} ${room?.room_number}`,
      },
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Create Timetable</h1>
        {timetableId && (
          <button
            onClick={handlePublishTimetable}
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="h-5 w-5" />
            <span>Publish Timetable</span>
          </button>
        )}
      </div>

      {/* Initial Form */}
      {!timetableId && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Timetable Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timetable Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="e.g., Fall 2024 - Computer Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year *
              </label>
              <select
                value={academicYearId}
                onChange={(e) => setAcademicYearId(e.target.value)}
                className="input"
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester *
              </label>
              <select
                value={semesterId}
                onChange={(e) => setSemesterId(e.target.value)}
                className="input"
                disabled={!academicYearId}
              >
                <option value="">Select Semester</option>
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.id}>
                    {sem.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program *
              </label>
              <select
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                className="input"
              >
                <option value="">Select Program</option>
                {programs.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.name} ({prog.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleCreateTimetable}
            disabled={loading}
            className="btn-primary mt-4 flex items-center space-x-2"
          >
            <Calendar className="h-5 w-5" />
            <span>Create Timetable</span>
          </button>
        </div>
      )}

      {/* Visual Timetable Builder */}
      {timetableId && (
        <>
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleGenerateTimetable}
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              <Sparkles className="h-5 w-5" />
              <span>Generate with AI</span>
            </button>
            <button
              onClick={() => setShowAddClass(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Class Manually</span>
            </button>
          </div>

          {/* Conflicts Alert */}
          {conflicts.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-red-800 font-semibold">Conflicts Detected</h3>
                  <ul className="mt-2 space-y-1">
                    {conflicts.map((conflict, idx) => (
                      <li key={idx} className="text-red-700 text-sm">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mr-2 ${
                          conflict.severity === 'hard' ? 'bg-red-200' : 'bg-yellow-200'
                        }`}>
                          {conflict.severity}
                        </span>
                        {conflict.description}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Calendar View */}
          <div className="card">
            <FullCalendar
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'title',
                center: '',
                right: 'today prev,next'
              }}
              allDaySlot={false}
              slotMinTime="08:00:00"
              slotMaxTime="18:00:00"
              slotDuration="01:00:00"
              height="auto"
              selectable={true}
              select={handleDateSelect}
              events={calendarEvents}
              eventClick={(info) => {
                const props = info.event.extendedProps
                alert(
                  `Course: ${props.course}\nFaculty: ${props.faculty}\nRoom: ${props.room}`
                )
              }}
              eventContent={(eventInfo) => (
                <div className="p-1 text-xs overflow-hidden">
                  <div className="font-semibold">{eventInfo.event.title.split('\n')[0]}</div>
                  <div className="text-xs opacity-90">{eventInfo.event.title.split('\n')[1]}</div>
                </div>
              )}
            />
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-blue-50">
              <h3 className="text-sm font-medium text-blue-800">Total Classes</h3>
              <p className="text-3xl font-bold text-blue-900 mt-2">{scheduledClasses.length}</p>
            </div>
            <div className="card bg-green-50">
              <h3 className="text-sm font-medium text-green-800">Theory Classes</h3>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {scheduledClasses.filter(sc => {
                  const course = courses.find(c => c.id === sc.course_id)
                  return course && !course.is_lab
                }).length}
              </p>
            </div>
            <div className="card bg-purple-50">
              <h3 className="text-sm font-medium text-purple-800">Lab Classes</h3>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {scheduledClasses.filter(sc => {
                  const course = courses.find(c => c.id === sc.course_id)
                  return course && course.is_lab
                }).length}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Add Class Modal */}
      {showAddClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Add Class</h2>

            {selectedSlot && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">
                  Day: {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedSlot.day]}
                </p>
                <p className="text-sm text-gray-600">
                  Time: {selectedSlot.start} - {selectedSlot.end}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course *
                </label>
                <select
                  value={newClass.course_id}
                  onChange={(e) => setNewClass({ ...newClass, course_id: e.target.value })}
                  className="input"
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faculty *
                </label>
                <select
                  value={newClass.faculty_id}
                  onChange={(e) => setNewClass({ ...newClass, faculty_id: e.target.value })}
                  className="input"
                >
                  <option value="">Select Faculty</option>
                  {faculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.first_name} {f.last_name} ({f.employee_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room *
                </label>
                <select
                  value={newClass.room_id}
                  onChange={(e) => setNewClass({ ...newClass, room_id: e.target.value })}
                  className="input"
                >
                  <option value="">Select Room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.building} {room.room_number} (Capacity: {room.capacity})
                      {room.is_lab ? ' - Lab' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddClass}
                disabled={loading}
                className="btn-primary flex-1"
              >
                Add Class
              </button>
              <button
                onClick={() => {
                  setShowAddClass(false)
                  setNewClass({ course_id: '', faculty_id: '', room_id: '' })
                  setSelectedSlot(null)
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
