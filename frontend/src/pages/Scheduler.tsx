import { useState } from 'react'
import { Plus, Trash2, Calendar, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface Classroom {
  id: string
  name: string
  type: 'classroom' | 'lab'
  capacity: number
}

interface TimeSlot {
  day: string
  startTime: string
  endTime: string
}

interface ClassSchedule {
  id: string
  name: string
  credits: number
  classroomId: string
  timeSlots: TimeSlot[]
}

function Scheduler() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [schedules, setSchedules] = useState<ClassSchedule[]>([])

  // Form states
  const [showAddClassroom, setShowAddClassroom] = useState(false)
  const [showAddClass, setShowAddClass] = useState(false)
  const [newClassroom, setNewClassroom] = useState({ name: '', type: 'classroom' as 'classroom' | 'lab', capacity: 30 })
  const [newClass, setNewClass] = useState({ name: '', credits: 3 })

  // Working hours
  const workingHours = { start: 9, end: 17 } // 9 AM to 5 PM

  const handleAddClassroom = () => {
    if (!newClassroom.name.trim()) {
      toast.error('Please enter classroom name')
      return
    }

    const classroom: Classroom = {
      id: Date.now().toString(),
      name: newClassroom.name,
      type: newClassroom.type,
      capacity: newClassroom.capacity
    }

    setClassrooms([...classrooms, classroom])
    setNewClassroom({ name: '', type: 'classroom', capacity: 30 })
    setShowAddClassroom(false)
    toast.success(`${classroom.type === 'lab' ? 'Lab' : 'Classroom'} added successfully`)
  }

  const handleDeleteClassroom = (id: string) => {
    // Check if classroom is being used
    const isUsed = schedules.some(schedule => schedule.classroomId === id)
    if (isUsed) {
      toast.error('Cannot delete classroom that is assigned to classes')
      return
    }

    setClassrooms(classrooms.filter(c => c.id !== id))
    toast.success('Classroom deleted')
  }

  const handleAddClass = () => {
    if (!newClass.name.trim()) {
      toast.error('Please enter class name')
      return
    }

    if (newClass.credits < 1 || newClass.credits > 6) {
      toast.error('Credits must be between 1 and 6')
      return
    }

    if (classrooms.length === 0) {
      toast.error('Please add at least one classroom first')
      return
    }

    // Calculate hours needed based on credits (1 credit = 1 hour per week)
    const hoursNeeded = newClass.credits

    // Auto-assign to first available classroom (you can make this smarter)
    const assignedClassroom = classrooms[0]

    const classSchedule: ClassSchedule = {
      id: Date.now().toString(),
      name: newClass.name,
      credits: newClass.credits,
      classroomId: assignedClassroom.id,
      timeSlots: [] // Will be filled by auto-scheduling
    }

    setSchedules([...schedules, classSchedule])
    setNewClass({ name: '', credits: 3 })
    setShowAddClass(false)
    toast.success(`Class added (${hoursNeeded} hours/week needed)`)
  }

  const handleDeleteClass = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id))
    toast.success('Class deleted')
  }

  const getTotalHoursScheduled = () => {
    return schedules.reduce((total, schedule) => total + schedule.credits, 0)
  }

  const getAvailableHoursPerWeek = () => {
    const hoursPerDay = workingHours.end - workingHours.start
    const daysPerWeek = 5 // Mon-Fri
    return hoursPerDay * daysPerWeek * classrooms.length
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Timetable Scheduler</h1>
          <p className="text-gray-600">Configure classrooms, add classes, and visualize your schedule</p>
        </div>

        {/* Configuration Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Working Hours Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Working Hours</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Start Time:</span>
                <span className="font-semibold">{workingHours.start}:00 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">End Time:</span>
                <span className="font-semibold">{workingHours.end}:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hours per Day:</span>
                <span className="font-semibold">{workingHours.end - workingHours.start} hours</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-600">Available Hours/Week:</span>
                <span className="font-semibold text-blue-600">{getAvailableHoursPerWeek()} hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Scheduled Hours/Week:</span>
                <span className="font-semibold text-green-600">{getTotalHoursScheduled()} hours</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold">Statistics</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{classrooms.filter(c => c.type === 'classroom').length}</div>
                <div className="text-sm text-gray-600">Classrooms</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">{classrooms.filter(c => c.type === 'lab').length}</div>
                <div className="text-sm text-gray-600">Labs</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{schedules.length}</div>
                <div className="text-sm text-gray-600">Classes</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">{getTotalHoursScheduled()}</div>
                <div className="text-sm text-gray-600">Total Credits</div>
              </div>
            </div>
          </div>
        </div>

        {/* Classrooms Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Classrooms & Labs</h2>
              <button
                onClick={() => setShowAddClassroom(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Classroom/Lab
              </button>
            </div>
          </div>

          {/* Add Classroom Form */}
          {showAddClassroom && (
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Name (e.g., Room 101)"
                  value={newClassroom.name}
                  onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
                  className="input"
                />
                <select
                  value={newClassroom.type}
                  onChange={(e) => setNewClassroom({ ...newClassroom, type: e.target.value as 'classroom' | 'lab' })}
                  className="input"
                >
                  <option value="classroom">Classroom</option>
                  <option value="lab">Lab</option>
                </select>
                <input
                  type="number"
                  placeholder="Capacity"
                  value={newClassroom.capacity}
                  onChange={(e) => setNewClassroom({ ...newClassroom, capacity: parseInt(e.target.value) || 30 })}
                  className="input"
                  min="1"
                />
                <div className="flex gap-2">
                  <button onClick={handleAddClassroom} className="btn-primary flex-1">Add</button>
                  <button onClick={() => setShowAddClassroom(false)} className="btn-secondary flex-1">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Classroom Grid */}
          <div className="p-6">
            {classrooms.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-2">No classrooms added yet</p>
                <p className="text-sm">Click "Add Classroom/Lab" to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {classrooms.map((classroom) => (
                  <div
                    key={classroom.id}
                    className={`relative p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                      classroom.type === 'lab'
                        ? 'bg-purple-50 border-purple-300 hover:border-purple-400'
                        : 'bg-blue-50 border-blue-300 hover:border-blue-400'
                    }`}
                  >
                    <button
                      onClick={() => handleDeleteClassroom(classroom.id)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-white hover:bg-red-50 text-red-600 hover:text-red-700 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 mb-1">{classroom.name}</div>
                      <div className={`text-xs ${classroom.type === 'lab' ? 'text-purple-600' : 'text-blue-600'}`}>
                        {classroom.type === 'lab' ? 'Lab' : 'Classroom'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Cap: {classroom.capacity}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Classes Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Classes</h2>
              <button
                onClick={() => setShowAddClass(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Class
              </button>
            </div>
          </div>

          {/* Add Class Form */}
          {showAddClass && (
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Class Name"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  className="input"
                />
                <input
                  type="number"
                  placeholder="Credits (1-6)"
                  value={newClass.credits}
                  onChange={(e) => setNewClass({ ...newClass, credits: parseInt(e.target.value) || 3 })}
                  className="input"
                  min="1"
                  max="6"
                />
                <div className="flex gap-2">
                  <button onClick={handleAddClass} className="btn-primary flex-1">Add</button>
                  <button onClick={() => setShowAddClass(false)} className="btn-secondary flex-1">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Classes List */}
          <div className="p-6">
            {schedules.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-2">No classes added yet</p>
                <p className="text-sm">Click "Add Class" to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule) => {
                  const classroom = classrooms.find(c => c.id === schedule.classroomId)
                  return (
                    <div key={schedule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{schedule.name}</div>
                        <div className="text-sm text-gray-600">
                          {schedule.credits} credits ({schedule.credits} hours/week) • {classroom?.name || 'Unassigned'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteClass(schedule.id)}
                        className="p-2 rounded-full hover:bg-red-50 text-red-600 hover:text-red-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Scheduler
