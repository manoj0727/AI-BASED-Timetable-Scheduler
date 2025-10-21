import { useState } from 'react'
import { Plus, Trash2, Calendar, PlayCircle, Download, FileDown } from 'lucide-react'
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
  branchId: string
  branchName: string
}

interface BranchTimetable {
  branchId: string
  branchName: string
  year: string
  timetable: {
    [day: string]: {
      [hour: number]: ScheduledSlot | null
    }
  }
}

function Scheduler() {
  const [facilityConfig, setFacilityConfig] = useState<FacilityConfig | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [classes, setClasses] = useState<ClassDefinition[]>([])
  const [branchTimetables, setBranchTimetables] = useState<BranchTimetable[]>([])
  const [selectedBranchForView, setSelectedBranchForView] = useState<string>('')

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
    setBranchTimetables(branchTimetables.filter(bt => bt.branchId !== id))
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
    setBranchTimetables([])
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

    if (branches.length === 0) {
      toast.error('Please add at least one branch before generating timetable')
      return
    }

    const allClassrooms = facilityConfig.classrooms
    const generatedTimetables: BranchTimetable[] = []
    const totalHoursPerDay = workingHours.end - workingHours.start

    // Generate timetable for each branch separately
    for (const branch of branches) {
      const branchClasses = classes.filter(cls => cls.branchId === branch.id)

      if (branchClasses.length === 0) {
        continue
      }

      // Initialize timetable for this branch
      const branchTimetable: { [day: string]: { [hour: number]: ScheduledSlot | null } } = {}
      days.forEach(day => {
        branchTimetable[day] = {}
        for (let hour = workingHours.start; hour < workingHours.end; hour++) {
          branchTimetable[day][hour] = null
        }
      })

      // Track used slots per classroom for this branch
      const classroomSlots: { [classroomId: string]: { [day: string]: boolean[] } } = {}
      allClassrooms.forEach(classroom => {
        classroomSlots[classroom.id] = {}
        days.forEach(day => {
          classroomSlots[classroom.id][day] = new Array(totalHoursPerDay).fill(false)
        })
      })

      // Sort classes by credits (descending) for better distribution
      const sortedClasses = [...branchClasses].sort((a, b) => b.credits - a.credits)

      let allScheduled = true

      // Schedule each class with improved distribution algorithm
      for (const cls of sortedClasses) {
        const classroom = allClassrooms.find(c => c.id === cls.classroomId)
        if (!classroom) continue

        const hoursNeeded = cls.credits
        let hoursScheduled = 0

        // Try to distribute classes evenly across the week
        const maxHoursPerDay = Math.ceil(hoursNeeded / days.length)

        for (const day of days) {
          if (hoursScheduled >= hoursNeeded) break

          let dailyHoursScheduled = 0

          // Prefer morning slots, then afternoon
          const hourPreference = [
            workingHours.start,     // 9 AM
            workingHours.start + 1, // 10 AM
            workingHours.start + 2, // 11 AM
            workingHours.start + 3, // 12 PM
            workingHours.start + 4, // 1 PM
            workingHours.start + 5, // 2 PM
            workingHours.start + 6, // 3 PM
            workingHours.start + 7  // 4 PM
          ]

          for (const hour of hourPreference) {
            if (hour >= workingHours.end) continue
            if (hoursScheduled >= hoursNeeded) break
            if (dailyHoursScheduled >= maxHoursPerDay) break

            const hourIndex = hour - workingHours.start

            // Check if this slot is available for this classroom
            if (!classroomSlots[cls.classroomId][day][hourIndex]) {
              // Schedule this slot
              const slot: ScheduledSlot = {
                classId: cls.id,
                className: cls.name,
                classroomId: cls.classroomId,
                classroomName: classroom.name,
                day,
                startHour: hour,
                endHour: hour + 1,
                branchId: branch.id,
                branchName: `${branch.name} - ${branch.year}`
              }

              branchTimetable[day][hour] = slot
              classroomSlots[cls.classroomId][day][hourIndex] = true
              hoursScheduled++
              dailyHoursScheduled++
            }
          }
        }

        if (hoursScheduled < hoursNeeded) {
          toast.error(`Could not schedule all hours for "${cls.name}" in ${branch.name} - ${branch.year}. Scheduled ${hoursScheduled}/${hoursNeeded} hours.`)
          allScheduled = false
        }
      }

      generatedTimetables.push({
        branchId: branch.id,
        branchName: branch.name,
        year: branch.year,
        timetable: branchTimetable
      })
    }

    setBranchTimetables(generatedTimetables)

    if (generatedTimetables.length > 0) {
      setSelectedBranchForView(generatedTimetables[0].branchId)
    }

    if (generatedTimetables.length > 0) {
      toast.success(`Generated timetables for ${generatedTimetables.length} branch(es)!`)
    } else {
      toast.error('No timetables could be generated. Please add classes to branches.')
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

  const downloadTimetableAsCSV = (branchId: string) => {
    const branchTimetable = branchTimetables.find(bt => bt.branchId === branchId)
    if (!branchTimetable) return

    const branch = branches.find(b => b.id === branchId)
    if (!branch) return

    // Create CSV content
    let csvContent = `Timetable for ${branchTimetable.branchName} - ${branchTimetable.year}\n\n`
    csvContent += 'Time,' + days.join(',') + '\n'

    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      const timeSlot = `${formatHour(hour)} - ${formatHour(hour + 1)}`
      const row = [timeSlot]

      days.forEach(day => {
        const slot = branchTimetable.timetable[day][hour]
        if (slot) {
          row.push(`${slot.className} (${slot.classroomName})`)
        } else {
          row.push('-')
        }
      })

      csvContent += row.join(',') + '\n'
    }

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `timetable_${branchTimetable.branchName}_${branchTimetable.year}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Timetable downloaded!')
  }

  const downloadAllTimetablesAsPDF = () => {
    // Create a printable HTML version
    const printWindow = window.open('', '', 'height=800,width=1200')
    if (!printWindow) return

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>All Timetables</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1e40af; text-align: center; margin-bottom: 10px; }
          h2 { color: #059669; margin-top: 30px; page-break-before: always; }
          h2:first-of-type { page-break-before: auto; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: center; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .class-slot { background-color: #dbeafe; border: 1px solid #3b82f6; padding: 8px; border-radius: 4px; }
          .class-name { font-weight: bold; color: #1e40af; }
          .room-name { font-size: 0.85em; color: #1e3a8a; margin-top: 4px; }
          @media print {
            body { padding: 10px; }
            h2 { page-break-before: always; }
            h2:first-of-type { page-break-before: auto; }
          }
        </style>
      </head>
      <body>
        <h1>Complete Timetable Schedule</h1>
    `

    branchTimetables.forEach(branchTimetable => {
      htmlContent += `
        <h2>${branchTimetable.branchName} - ${branchTimetable.year}</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 120px;">Time</th>
              ${days.map(day => `<th>${day}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
      `

      for (let hour = workingHours.start; hour < workingHours.end; hour++) {
        htmlContent += `<tr><td><strong>${formatHour(hour)} - ${formatHour(hour + 1)}</strong></td>`

        days.forEach(day => {
          const slot = branchTimetable.timetable[day][hour]
          if (slot) {
            htmlContent += `
              <td>
                <div class="class-slot">
                  <div class="class-name">${slot.className}</div>
                  <div class="room-name">${slot.classroomName}</div>
                </div>
              </td>
            `
          } else {
            htmlContent += '<td>-</td>'
          }
        })

        htmlContent += '</tr>'
      }

      htmlContent += `
          </tbody>
        </table>
      `
    })

    htmlContent += `
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()

    setTimeout(() => {
      printWindow.print()
      toast.success('Print dialog opened!')
    }, 250)
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

        {/* Step 1: Facility Configuration */}
        {!facilityConfig ? (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Step 1: Configure Available Facilities</h2>
              <p className="text-sm text-gray-500 mt-1">Enter the total number of classrooms and labs available</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Classrooms</label>
                    <input
                      type="number"
                      value={newFacility.numClassrooms}
                      onChange={(e) => setNewFacility({ ...newFacility, numClassrooms: parseInt(e.target.value) || 0 })}
                      className="input w-full"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Classroom Capacity</label>
                    <input
                      type="number"
                      value={newFacility.classroomCapacity}
                      onChange={(e) => setNewFacility({ ...newFacility, classroomCapacity: parseInt(e.target.value) || 30 })}
                      className="input w-full"
                      min="1"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Labs</label>
                    <input
                      type="number"
                      value={newFacility.numLabs}
                      onChange={(e) => setNewFacility({ ...newFacility, numLabs: parseInt(e.target.value) || 0 })}
                      className="input w-full"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lab Capacity</label>
                    <input
                      type="number"
                      value={newFacility.labCapacity}
                      onChange={(e) => setNewFacility({ ...newFacility, labCapacity: parseInt(e.target.value) || 25 })}
                      className="input w-full"
                      min="1"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button onClick={handleSaveFacility} className="btn-primary px-8 py-3 text-lg">
                  Save & Continue
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Facility Summary */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="p-6 border-b border-gray-200 bg-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-blue-900">Facilities Configured</h2>
                    <p className="text-sm text-blue-700 mt-1">
                      {facilityConfig.numClassrooms} Classrooms (Capacity: {facilityConfig.classroomCapacity}) • {facilityConfig.numLabs} Labs (Capacity: {facilityConfig.labCapacity})
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (branches.length > 0 || classes.length > 0) {
                        if (confirm('Changing facilities will reset all branches and classes. Continue?')) {
                          setFacilityConfig(null)
                          setBranches([])
                          setClasses([])
                          setTimetable(null)
                          setShowFacilityForm(true)
                        }
                      } else {
                        setFacilityConfig(null)
                        setShowFacilityForm(true)
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    Reconfigure
                  </button>
                </div>
              </div>

              {/* Classrooms Grid Preview */}
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Available Rooms:</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-10 gap-2">
                  {facilityConfig.classrooms.map((room) => (
                    <div
                      key={room.id}
                      className={`text-center p-2 rounded text-xs font-medium ${
                        room.type === 'lab'
                          ? 'bg-purple-100 text-purple-700 border border-purple-300'
                          : 'bg-blue-100 text-blue-700 border border-blue-300'
                      }`}
                    >
                      {room.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Branches */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Step 2: Add Branches</h2>
                    <p className="text-sm text-gray-500 mt-1">Configure branches with year and student strength</p>
                  </div>
                  <button
                    onClick={() => setShowAddBranch(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Branch
                  </button>
                </div>
              </div>

              {/* Add Branch Form */}
              {showAddBranch && (
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="text"
                      placeholder="Branch (e.g., Computer Science)"
                      value={newBranch.name}
                      onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                      className="input"
                    />
                    <input
                      type="text"
                      placeholder="Year (e.g., 1st Year)"
                      value={newBranch.year}
                      onChange={(e) => setNewBranch({ ...newBranch, year: e.target.value })}
                      className="input"
                    />
                    <input
                      type="number"
                      placeholder="Student Strength"
                      value={newBranch.studentStrength}
                      onChange={(e) => setNewBranch({ ...newBranch, studentStrength: parseInt(e.target.value) || 0 })}
                      className="input"
                      min="1"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleAddBranch} className="btn-primary flex-1">Add</button>
                      <button onClick={() => setShowAddBranch(false)} className="btn-secondary flex-1">Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Branches List */}
              <div className="p-6">
                {branches.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="mb-2">No branches added yet</p>
                    <p className="text-sm">Click "Add Branch" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {branches.map((branch) => {
                      const branchClasses = getClassesForBranch(branch.id)
                      return (
                        <div key={branch.id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                          {/* Branch Header */}
                          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-bold">{branch.name} - {branch.year}</h3>
                                <p className="text-sm text-green-100 mt-1">
                                  Student Strength: {branch.studentStrength} • Classes: {branchClasses.length}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDeleteBranch(branch.id)}
                                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Classrooms Grid for this Branch */}
                          <div className="p-4 bg-gray-50">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Assign Classes to Rooms:</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                              {facilityConfig.classrooms.map((classroom) => {
                                const roomClasses = getClassesForClassroomAndBranch(classroom.id, branch.id)
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
                                        {roomClasses.length} classes
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleShowAddClass(classroom.id, branch.id)}
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
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Add Class Modal */}
        {showAddClass && facilityConfig && (() => {
          const selectedClassroom = facilityConfig.classrooms.find(c => c.id === selectedClassroomForClass)
          const selectedBranch = branches.find(b => b.id === selectedBranchForClass)

          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6 border-b">
                  <h3 className="text-xl font-semibold">Add Class</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedBranch && selectedClassroom && `${selectedBranch.name} - ${selectedBranch.year} • ${selectedClassroom.name}`}
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
                    setSelectedBranchForClass('')
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
            {branchTimetables.length > 0 && (
              <div className="p-6">
                {/* Download All Button */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-600 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Generated Timetables ({branchTimetables.length} Branch{branchTimetables.length > 1 ? 'es' : ''})
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Week schedule: Monday to Friday, 9:00 AM to 5:00 PM</p>
                  </div>
                  <button
                    onClick={downloadAllTimetablesAsPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow"
                  >
                    <FileDown className="w-4 h-4" />
                    Print All Timetables
                  </button>
                </div>

                {/* Branch Selector Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {branchTimetables.map(bt => (
                    <button
                      key={bt.branchId}
                      onClick={() => setSelectedBranchForView(bt.branchId)}
                      className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                        selectedBranchForView === bt.branchId
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {bt.branchName} - {bt.year}
                    </button>
                  ))}
                </div>

                {/* Selected Branch Timetable */}
                {branchTimetables.map(branchTimetable => {
                  if (branchTimetable.branchId !== selectedBranchForView) return null

                  return (
                    <div key={branchTimetable.branchId} className="space-y-4">
                      {/* Branch Info Header */}
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">
                              {branchTimetable.branchName} - {branchTimetable.year}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {getClassesForBranch(branchTimetable.branchId).length} classes scheduled
                            </p>
                          </div>
                          <button
                            onClick={() => downloadTimetableAsCSV(branchTimetable.branchId)}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-green-700 border-2 border-green-600 rounded-lg hover:bg-green-50 transition shadow"
                          >
                            <Download className="w-4 h-4" />
                            Download CSV
                          </button>
                        </div>
                      </div>

                      {/* Timetable Table */}
                      <div className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-lg">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                                <th className="border-2 border-gray-300 p-4 text-left font-bold text-gray-700 w-32">Time</th>
                                {days.map(day => (
                                  <th key={day} className="border-2 border-gray-300 p-4 text-center font-bold text-gray-700">{day}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {Array.from({ length: workingHours.end - workingHours.start }).map((_, index) => {
                                const hour = workingHours.start + index
                                return (
                                  <tr key={hour} className="hover:bg-gray-50 transition">
                                    <td className="border-2 border-gray-300 p-3 font-semibold bg-gray-50 text-gray-700 whitespace-nowrap">
                                      {formatHour(hour)}
                                      <div className="text-xs text-gray-500 font-normal">to</div>
                                      {formatHour(hour + 1)}
                                    </td>
                                    {days.map(day => {
                                      const slot = branchTimetable.timetable[day][hour]
                                      return (
                                        <td key={`${day}-${hour}`} className="border-2 border-gray-300 p-2">
                                          {slot ? (
                                            <div className="bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-400 rounded-lg p-3 hover:shadow-md transition">
                                              <div className="font-bold text-blue-900 text-sm">{slot.className}</div>
                                              <div className="text-xs text-blue-700 mt-1 flex items-center gap-1">
                                                <span>📍</span>
                                                {slot.classroomName}
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="text-center text-gray-400 py-3">
                                              <div className="text-xs">Free</div>
                                            </div>
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

                      {/* Class Summary */}
                      <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
                        <h5 className="font-semibold text-gray-700 mb-3">Classes Summary:</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {getClassesForBranch(branchTimetable.branchId).map(cls => {
                            const classroom = facilityConfig?.classrooms.find(c => c.id === cls.classroomId)
                            return (
                              <div key={cls.id} className="bg-blue-50 border border-blue-300 rounded p-2">
                                <div className="font-medium text-blue-900 text-sm">{cls.name}</div>
                                <div className="text-xs text-blue-600 mt-1">
                                  {cls.credits}h/week • {classroom?.name}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Scheduler
