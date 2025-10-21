import { useState } from 'react'
import { Plus, Trash2, Calendar, PlayCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface FacilityConfig {
  numClassrooms: number
  classroomCapacity: number
  numLabs: number
  labCapacity: number
  classrooms: Classroom[]
}

interface Classroom {
  id: string
  name: string
  type: 'classroom' | 'lab'
  capacity: number
}

interface Branch {
  id: string
  name: string
  year: string
  studentStrength: number
}

interface ClassDefinition {
  id: string
  name: string
  credits: number
  classroomId: string
  branchId: string
}

interface ScheduledSlot {
  classId: string
  className: string
  classroomId: string
  classroomName: string
  day: string
  startHour: number
  endHour: number
}

interface GeneratedTimetable {
  [day: string]: {
    [hour: number]: ScheduledSlot | null
  }
}

function Scheduler() {
  const [facilityConfig, setFacilityConfig] = useState<FacilityConfig | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [classes, setClasses] = useState<ClassDefinition[]>([])
  const [timetable, setTimetable] = useState<GeneratedTimetable | null>(null)

  // Form states
  const [showFacilityForm, setShowFacilityForm] = useState(!facilityConfig)
  const [showAddBranch, setShowAddBranch] = useState(false)
  const [showAddClass, setShowAddClass] = useState(false)
  const [selectedClassroomForClass, setSelectedClassroomForClass] = useState<string>('')
  const [selectedBranchForClass, setSelectedBranchForClass] = useState<string>('')

  const [newFacility, setNewFacility] = useState({
    numClassrooms: 5,
    classroomCapacity: 60,
    numLabs: 2,
    labCapacity: 30
  })

  const [newBranch, setNewBranch] = useState({
    name: '',
    year: '',
    studentStrength: 60
  })

  const [newClass, setNewClass] = useState({ name: '', credits: 3 })

  // Working hours
  const workingHours = { start: 9, end: 17 } // 9 AM to 5 PM
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  const handleSaveFacility = () => {
    if (newFacility.numClassrooms < 0 || newFacility.numLabs < 0) {
      toast.error('Number of classrooms and labs must be positive')
      return
    }

    if (newFacility.numClassrooms === 0 && newFacility.numLabs === 0) {
      toast.error('Please add at least one classroom or lab')
      return
    }

    const classrooms: Classroom[] = []

    // Generate classrooms
    for (let i = 1; i <= newFacility.numClassrooms; i++) {
      classrooms.push({
        id: `classroom-${i}`,
        name: `Classroom ${i}`,
        type: 'classroom',
        capacity: newFacility.classroomCapacity
      })
    }

    // Generate labs
    for (let i = 1; i <= newFacility.numLabs; i++) {
      classrooms.push({
        id: `lab-${i}`,
        name: `Lab ${i}`,
        type: 'lab',
        capacity: newFacility.labCapacity
      })
    }

    const config: FacilityConfig = {
      numClassrooms: newFacility.numClassrooms,
      classroomCapacity: newFacility.classroomCapacity,
      numLabs: newFacility.numLabs,
      labCapacity: newFacility.labCapacity,
      classrooms
    }

    setFacilityConfig(config)
    setShowFacilityForm(false)
    toast.success(`Facility configured: ${config.numClassrooms} Classrooms, ${config.numLabs} Labs`)
  }

  const handleAddBranch = () => {
    if (!newBranch.name.trim()) {
      toast.error('Please enter branch name (e.g., Computer Science)')
      return
    }

    if (!newBranch.year.trim()) {
      toast.error('Please enter year (e.g., 1st Year, 2nd Year)')
      return
    }

    if (newBranch.studentStrength <= 0) {
      toast.error('Student strength must be greater than 0')
      return
    }

    const branch: Branch = {
      id: Date.now().toString(),
      name: newBranch.name,
      year: newBranch.year,
      studentStrength: newBranch.studentStrength
    }

    setBranches([...branches, branch])
    setNewBranch({ name: '', year: '', studentStrength: 60 })
    setShowAddBranch(false)
    toast.success(`Branch added: ${branch.name} - ${branch.year} (${branch.studentStrength} students)`)
  }

  const handleDeleteBranch = (id: string) => {
    const isUsed = classes.some(cls => cls.branchId === id)
    if (isUsed) {
      toast.error('Cannot delete branch that has classes assigned')
      return
    }

    setBranches(branches.filter(b => b.id !== id))
    setTimetable(null)
    toast.success('Branch deleted')
  }

  const handleShowAddClass = (classroomId: string, branchId: string) => {
    setSelectedClassroomForClass(classroomId)
    setSelectedBranchForClass(branchId)
    setShowAddClass(true)
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

    if (!selectedClassroomForClass || !selectedBranchForClass) {
      toast.error('Please select classroom and branch')
      return
    }

    const classDefinition: ClassDefinition = {
      id: Date.now().toString(),
      name: newClass.name,
      credits: newClass.credits,
      classroomId: selectedClassroomForClass,
      branchId: selectedBranchForClass
    }

    setClasses([...classes, classDefinition])
    setNewClass({ name: '', credits: 3 })
    setShowAddClass(false)
    setSelectedClassroomForClass('')
    setSelectedBranchForClass('')
    setTimetable(null)
    toast.success(`Class "${classDefinition.name}" added (${classDefinition.credits} hours/week)`)
  }

  const generateTimetable = () => {
    if (classes.length === 0) {
      toast.error('Please add at least one class before generating timetable')
      return
    }

    if (!facilityConfig) {
      toast.error('Please configure facility first')
      return
    }

    // Get all classrooms from facility config
    const allClassrooms = facilityConfig.classrooms

    // Initialize timetable structure
    const newTimetable: GeneratedTimetable = {}
    days.forEach(day => {
      newTimetable[day] = {}
      for (let hour = workingHours.start; hour < workingHours.end; hour++) {
        newTimetable[day][hour] = null
      }
    })

    // Track used slots per classroom
    const classroomSlots: { [classroomId: string]: { [day: string]: Set<number> } } = {}
    allClassrooms.forEach(classroom => {
      classroomSlots[classroom.id] = {}
      days.forEach(day => {
        classroomSlots[classroom.id][day] = new Set()
      })
    })

    // Schedule each class
    let allScheduled = true
    for (const cls of classes) {
      const classroom = allClassrooms.find(c => c.id === cls.classroomId)
      if (!classroom) continue

      let hoursScheduled = 0
      const hoursNeeded = cls.credits

      // Try to schedule across the week
      outerLoop: for (const day of days) {
        for (let hour = workingHours.start; hour < workingHours.end && hoursScheduled < hoursNeeded; hour++) {
          // Check if this slot is available for this classroom
          if (!classroomSlots[cls.classroomId][day].has(hour)) {
            // Schedule this slot
            const slot: ScheduledSlot = {
              classId: cls.id,
              className: cls.name,
              classroomId: cls.classroomId,
              classroomName: classroom.name,
              day,
              startHour: hour,
              endHour: hour + 1
            }

            newTimetable[day][hour] = slot
            classroomSlots[cls.classroomId][day].add(hour)
            hoursScheduled++

            if (hoursScheduled >= hoursNeeded) {
              break outerLoop
            }
          }
        }
      }

      if (hoursScheduled < hoursNeeded) {
        toast.error(`Could not schedule all hours for "${cls.name}". Scheduled ${hoursScheduled}/${hoursNeeded} hours.`)
        allScheduled = false
      }
    }

    setTimetable(newTimetable)

    if (allScheduled) {
      toast.success('Timetable generated successfully!')
    } else {
      toast('Timetable generated with some conflicts. Try reducing total hours or adding more classrooms.', {
        icon: '⚠️',
        duration: 5000
      })
    }
  }

  const getTotalHoursScheduled = () => {
    return classes.reduce((total, cls) => total + cls.credits, 0)
  }

  const formatHour = (hour: number) => {
    if (hour === 12) return '12:00 PM'
    if (hour > 12) return `${hour - 12}:00 PM`
    return `${hour}:00 AM`
  }

  const getClassesForBranch = (branchId: string) => {
    return classes.filter(cls => cls.branchId === branchId)
  }

  const getClassesForClassroomAndBranch = (classroomId: string, branchId: string) => {
    return classes.filter(cls => cls.classroomId === classroomId && cls.branchId === branchId)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Timetable Scheduler</h1>
          <p className="text-gray-600">Step 1: Configure facilities → Step 2: Add branches → Step 3: Assign classes → Step 4: Generate timetable</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{facilityConfig?.numClassrooms || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Classrooms</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
            <div className="text-3xl font-bold text-purple-600">{facilityConfig?.numLabs || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Labs</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
            <div className="text-3xl font-bold text-green-600">{branches.length}</div>
            <div className="text-sm text-gray-600 mt-1">Branches</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
            <div className="text-3xl font-bold text-orange-600">{classes.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Classes</div>
          </div>
        </div>

        {/* Step 1: Year Groups Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Step 1: Configure Year Groups</h2>
                <p className="text-sm text-gray-500 mt-1">Add programs with year, field of study, and specify number of classrooms/labs</p>
              </div>
              <button
                onClick={() => setShowAddYearGroup(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Year Group
              </button>
            </div>
          </div>

          {/* Add Year Group Form */}
          {showAddYearGroup && (
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Program (e.g., B-tech)"
                  value={newYearGroup.program}
                  onChange={(e) => setNewYearGroup({ ...newYearGroup, program: e.target.value })}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Year (e.g., 1st Year)"
                  value={newYearGroup.year}
                  onChange={(e) => setNewYearGroup({ ...newYearGroup, year: e.target.value })}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Field of Study (e.g., CS)"
                  value={newYearGroup.fieldOfStudy}
                  onChange={(e) => setNewYearGroup({ ...newYearGroup, fieldOfStudy: e.target.value })}
                  className="input"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input
                  type="number"
                  placeholder="Number of Classrooms"
                  value={newYearGroup.numClassrooms}
                  onChange={(e) => setNewYearGroup({ ...newYearGroup, numClassrooms: parseInt(e.target.value) || 0 })}
                  className="input"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Classroom Capacity"
                  value={newYearGroup.classroomCapacity}
                  onChange={(e) => setNewYearGroup({ ...newYearGroup, classroomCapacity: parseInt(e.target.value) || 30 })}
                  className="input"
                  min="1"
                />
                <input
                  type="number"
                  placeholder="Number of Labs"
                  value={newYearGroup.numLabs}
                  onChange={(e) => setNewYearGroup({ ...newYearGroup, numLabs: parseInt(e.target.value) || 0 })}
                  className="input"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Lab Capacity"
                  value={newYearGroup.labCapacity}
                  onChange={(e) => setNewYearGroup({ ...newYearGroup, labCapacity: parseInt(e.target.value) || 25 })}
                  className="input"
                  min="1"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleAddYearGroup} className="btn-primary">Add Year Group</button>
                <button onClick={() => setShowAddYearGroup(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          {/* Year Groups Display */}
          <div className="p-6">
            {yearGroups.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-2">No year groups configured yet</p>
                <p className="text-sm">Click "Add Year Group" to get started</p>
              </div>
            ) : (
              <div className="space-y-6">
                {yearGroups.map((yearGroup) => (
                  <div key={yearGroup.id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    {/* Year Group Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold">{getYearGroupLabel(yearGroup)}</h3>
                          <p className="text-sm text-blue-100 mt-1">
                            {yearGroup.numClassrooms} Classrooms • {yearGroup.numLabs} Labs
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteYearGroup(yearGroup.id)}
                          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Classrooms and Labs Grid */}
                    <div className="p-4 bg-gray-50">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                        {yearGroup.classrooms.map((classroom) => {
                          const classroomClasses = getClassesForClassroom(classroom.id)
                          return (
                            <div
                              key={classroom.id}
                              className={`relative rounded-lg border-2 p-3 transition-all hover:shadow-md ${
                                classroom.type === 'lab'
                                  ? 'bg-purple-50 border-purple-300'
                                  : 'bg-blue-50 border-blue-300'
                              }`}
                            >
                              <div className="text-center mb-2">
                                <div className={`text-xs font-bold mb-1 ${
                                  classroom.type === 'lab' ? 'text-purple-600' : 'text-blue-600'
                                }`}>
                                  {classroom.name}
                                </div>
                                <div className="text-xs text-gray-600">👥 {classroom.capacity}</div>
                                <div className={`text-xs font-semibold mt-1 ${
                                  classroom.type === 'lab' ? 'text-purple-500' : 'text-blue-500'
                                }`}>
                                  {classroomClasses.length} classes
                                </div>
                              </div>
                              <button
                                onClick={() => handleShowAddClass(classroom.id)}
                                className="w-full py-1 px-2 text-xs rounded bg-white hover:bg-gray-100 transition flex items-center justify-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Add Class
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Class Modal */}
        {showAddClass && (() => {
          const allClassrooms = yearGroups.flatMap(yg => yg.classrooms)
          const selectedClassroom = allClassrooms.find(c => c.id === selectedClassroomForClass)
          const yearGroup = yearGroups.find(yg => yg.classrooms.some(c => c.id === selectedClassroomForClass))

          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6 border-b">
                  <h3 className="text-xl font-semibold">Add Class</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {yearGroup && `${getYearGroupLabel(yearGroup)} - ${selectedClassroom?.name}`}
                  </p>
                </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Mathematics, Physics Lab"
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    className="input w-full"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Credits (Hours per Week)</label>
                  <input
                    type="number"
                    placeholder="1-6 credits"
                    value={newClass.credits}
                    onChange={(e) => setNewClass({ ...newClass, credits: parseInt(e.target.value) || 3 })}
                    className="input w-full"
                    min="1"
                    max="6"
                  />
                  <p className="text-xs text-gray-500 mt-1">1 credit = 1 hour of class per week</p>
                </div>
              </div>
              <div className="p-6 border-t flex gap-3">
                <button onClick={handleAddClass} className="btn-primary flex-1">Add Class</button>
                <button
                  onClick={() => {
                    setShowAddClass(false)
                    setSelectedClassroomForClass('')
                    setNewClass({ name: '', credits: 3 })
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
          )
        })()}

        {/* Step 3: Generate Timetable */}
        {classes.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Step 3: Generate Timetable</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Automatically schedule all classes across the week (9 AM - 5 PM)
                  </p>
                </div>
                <button
                  onClick={generateTimetable}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition shadow-md"
                >
                  <PlayCircle className="w-5 h-5" />
                  Generate Timetable
                </button>
              </div>
            </div>

            {/* Timetable Display */}
            {timetable && (
              <div className="p-6 overflow-x-auto">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-green-600 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Generated Timetable
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Week schedule: Monday to Friday, 9:00 AM to 5:00 PM</p>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-3 text-left font-semibold">Time</th>
                        {days.map(day => (
                          <th key={day} className="border p-3 text-center font-semibold">{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: workingHours.end - workingHours.start }).map((_, index) => {
                        const hour = workingHours.start + index
                        return (
                          <tr key={hour} className="hover:bg-gray-50">
                            <td className="border p-3 font-medium bg-gray-50 whitespace-nowrap">
                              {formatHour(hour)} - {formatHour(hour + 1)}
                            </td>
                            {days.map(day => {
                              const slot = timetable[day][hour]
                              return (
                                <td key={`${day}-${hour}`} className="border p-2">
                                  {slot ? (
                                    <div className="bg-blue-100 border border-blue-300 rounded p-2 hover:bg-blue-200 transition">
                                      <div className="font-semibold text-blue-900">{slot.className}</div>
                                      <div className="text-xs text-blue-700 mt-1">{slot.classroomName}</div>
                                    </div>
                                  ) : (
                                    <div className="text-center text-gray-400 text-xs">-</div>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Scheduler
