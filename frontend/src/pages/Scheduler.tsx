import { useState } from 'react'
import { Plus, Trash2, Calendar, PlayCircle, Download, BookOpen, Edit2 } from 'lucide-react'
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

interface YearBranchConfig {
  id: string
  year: string // "1st Year", "2nd Year", etc.
  branches: BranchConfig[]
}

interface BranchConfig {
  id: string
  name: string // "CSE", "ECE", etc.
  studentStrength: number
  subjects: Subject[]
}

interface Subject {
  id: string
  name: string
  code: string
  credits: number
  type: 'theory' | 'lab' | 'practical'
}

interface ClassAssignment {
  id: string
  subjectId: string
  classroomId: string
  yearId: string
  branchId: string
}

interface ScheduledSlot {
  subjectId: string
  subjectName: string
  subjectCode: string
  classroomId: string
  classroomName: string
  day: string
  startHour: number
  endHour: number
  type: 'theory' | 'lab' | 'practical'
}

interface BranchTimetable {
  yearId: string
  year: string
  branchId: string
  branchName: string
  studentStrength: number
  timetable: {
    [day: string]: {
      [hour: number]: ScheduledSlot | null
    }
  }
}

function Scheduler() {
  const [step, setStep] = useState<'facility' | 'academic' | 'generate'>('facility')
  const [facilityConfig, setFacilityConfig] = useState<FacilityConfig | null>(null)
  const [yearBranchConfigs, setYearBranchConfigs] = useState<YearBranchConfig[]>([])
  const [classAssignments, setClassAssignments] = useState<ClassAssignment[]>([])
  const [branchTimetables, setBranchTimetables] = useState<BranchTimetable[]>([])

  // Form states
  const [showAddYear, setShowAddYear] = useState(false)
  const [showAddBranch, setShowAddBranch] = useState(false)
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [selectedYearId, setSelectedYearId] = useState<string>('')
  const [selectedBranchId, setSelectedBranchId] = useState<string>('')

  const [newFacility, setNewFacility] = useState({
    numClassrooms: 6,
    classroomCapacity: 60,
    numLabs: 6,
    labCapacity: 30
  })

  const [newYear, setNewYear] = useState({ year: '' })
  const [newBranch, setNewBranch] = useState({ name: '', studentStrength: 60 })
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    credits: 3,
    type: 'theory' as 'theory' | 'lab' | 'practical'
  })

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
    setStep('academic')
    toast.success(`Facility configured: ${config.numClassrooms} Classrooms, ${config.numLabs} Labs`)
  }

  const handleAddYear = () => {
    if (!newYear.year.trim()) {
      toast.error('Please enter year (e.g., 1st Year, 2nd Year)')
      return
    }

    const yearConfig: YearBranchConfig = {
      id: Date.now().toString(),
      year: newYear.year,
      branches: []
    }

    setYearBranchConfigs([...yearBranchConfigs, yearConfig])
    setNewYear({ year: '' })
    setShowAddYear(false)
    toast.success(`Year added: ${yearConfig.year}`)
  }

  const handleDeleteYear = (id: string) => {
    setYearBranchConfigs(yearBranchConfigs.filter(y => y.id !== id))
    setClassAssignments(classAssignments.filter(ca => ca.yearId !== id))
    toast.success('Year deleted')
  }

  const handleShowAddBranch = (yearId: string) => {
    setSelectedYearId(yearId)
    setShowAddBranch(true)
  }

  const handleAddBranch = () => {
    if (!newBranch.name.trim()) {
      toast.error('Please enter branch name (e.g., CSE, ECE)')
      return
    }

    if (newBranch.studentStrength <= 0) {
      toast.error('Student strength must be greater than 0')
      return
    }

    const branchConfig: BranchConfig = {
      id: Date.now().toString(),
      name: newBranch.name,
      studentStrength: newBranch.studentStrength,
      subjects: []
    }

    const updatedYears = yearBranchConfigs.map(year => {
      if (year.id === selectedYearId) {
        return { ...year, branches: [...year.branches, branchConfig] }
      }
      return year
    })

    setYearBranchConfigs(updatedYears)
    setNewBranch({ name: '', studentStrength: 60 })
    setShowAddBranch(false)
    setSelectedYearId('')
    toast.success(`Branch added: ${branchConfig.name}`)
  }

  const handleDeleteBranch = (yearId: string, branchId: string) => {
    const updatedYears = yearBranchConfigs.map(year => {
      if (year.id === yearId) {
        return { ...year, branches: year.branches.filter(b => b.id !== branchId) }
      }
      return year
    })

    setYearBranchConfigs(updatedYears)
    setClassAssignments(classAssignments.filter(ca => !(ca.yearId === yearId && ca.branchId === branchId)))
    toast.success('Branch deleted')
  }

  const handleShowAddSubject = (yearId: string, branchId: string) => {
    setSelectedYearId(yearId)
    setSelectedBranchId(branchId)
    setShowAddSubject(true)
  }

  const handleAddSubject = () => {
    if (!newSubject.name.trim()) {
      toast.error('Please enter subject name')
      return
    }

    if (!newSubject.code.trim()) {
      toast.error('Please enter subject code')
      return
    }

    if (newSubject.credits < 1 || newSubject.credits > 6) {
      toast.error('Credits must be between 1 and 6')
      return
    }

    const subject: Subject = {
      id: Date.now().toString(),
      name: newSubject.name,
      code: newSubject.code,
      credits: newSubject.credits,
      type: newSubject.type
    }

    const updatedYears = yearBranchConfigs.map(year => {
      if (year.id === selectedYearId) {
        return {
          ...year,
          branches: year.branches.map(branch => {
            if (branch.id === selectedBranchId) {
              return { ...branch, subjects: [...branch.subjects, subject] }
            }
            return branch
          })
        }
      }
      return year
    })

    setYearBranchConfigs(updatedYears)
    setNewSubject({ name: '', code: '', credits: 3, type: 'theory' })
    setShowAddSubject(false)
    setSelectedYearId('')
    setSelectedBranchId('')
    toast.success(`Subject "${subject.name}" (${subject.code}) added`)
  }

  const handleDeleteSubject = (yearId: string, branchId: string, subjectId: string) => {
    const updatedYears = yearBranchConfigs.map(year => {
      if (year.id === yearId) {
        return {
          ...year,
          branches: year.branches.map(branch => {
            if (branch.id === branchId) {
              return { ...branch, subjects: branch.subjects.filter(s => s.id !== subjectId) }
            }
            return branch
          })
        }
      }
      return year
    })

    setYearBranchConfigs(updatedYears)
    setClassAssignments(classAssignments.filter(ca => ca.subjectId !== subjectId))
    toast.success('Subject deleted')
  }

  const autoAssignAllClassrooms = () => {
    if (!facilityConfig) {
      toast.error('Please configure facility first')
      return
    }

    const newAssignments: ClassAssignment[] = []
    const classrooms = facilityConfig.classrooms
    const labs = classrooms.filter(c => c.type === 'lab')
    const regularClassrooms = classrooms.filter(c => c.type === 'classroom')

    let labIndex = 0
    let classroomIndex = 0

    yearBranchConfigs.forEach(year => {
      year.branches.forEach(branch => {
        branch.subjects.forEach(subject => {
          let assignedClassroom: Classroom | undefined

          if (subject.type === 'lab' || subject.type === 'practical') {
            assignedClassroom = labs[labIndex % labs.length] || classrooms[labIndex % classrooms.length]
            labIndex++
          } else {
            assignedClassroom = regularClassrooms[classroomIndex % regularClassrooms.length] || classrooms[classroomIndex % classrooms.length]
            classroomIndex++
          }

          if (assignedClassroom) {
            newAssignments.push({
              id: `${year.id}-${branch.id}-${subject.id}-${assignedClassroom.id}`,
              subjectId: subject.id,
              classroomId: assignedClassroom.id,
              yearId: year.id,
              branchId: branch.id
            })
          }
        })
      })
    })

    setClassAssignments(newAssignments)
    toast.success('All classrooms auto-assigned!')
  }

  const generateAllTimetables = () => {
    if (yearBranchConfigs.length === 0) {
      toast.error('Please add at least one year with branches and subjects')
      return
    }

    if (!facilityConfig) {
      toast.error('Please configure facility first')
      return
    }

    // Create fresh classroom assignments
    const newAssignments: ClassAssignment[] = []
    const allClassrooms = facilityConfig.classrooms
    const labs = allClassrooms.filter(c => c.type === 'lab')
    const regularClassrooms = allClassrooms.filter(c => c.type === 'classroom')

    let labIndex = 0
    let classroomIndex = 0

    // Assign classrooms to all subjects
    yearBranchConfigs.forEach(year => {
      year.branches.forEach(branch => {
        branch.subjects.forEach(subject => {
          let assignedClassroom: Classroom | undefined

          if (subject.type === 'lab' || subject.type === 'practical') {
            assignedClassroom = labs[labIndex % labs.length] || allClassrooms[labIndex % allClassrooms.length]
            labIndex++
          } else {
            assignedClassroom = regularClassrooms[classroomIndex % regularClassrooms.length] || allClassrooms[classroomIndex % allClassrooms.length]
            classroomIndex++
          }

          if (assignedClassroom) {
            newAssignments.push({
              id: `${year.id}-${branch.id}-${subject.id}-${assignedClassroom.id}`,
              subjectId: subject.id,
              classroomId: assignedClassroom.id,
              yearId: year.id,
              branchId: branch.id
            })
          }
        })
      })
    })

    const generatedTimetables: BranchTimetable[] = []
    const totalHoursPerDay = workingHours.end - workingHours.start

    // Global classroom usage tracking across ALL branches to prevent collisions
    const globalClassroomSlots: { [classroomId: string]: { [day: string]: boolean[] } } = {}
    allClassrooms.forEach(classroom => {
      globalClassroomSlots[classroom.id] = {}
      days.forEach(day => {
        globalClassroomSlots[classroom.id][day] = new Array(totalHoursPerDay).fill(false)
      })
    })

    // Generate timetable for each year-branch combination
    yearBranchConfigs.forEach(year => {
      year.branches.forEach(branch => {
        if (branch.subjects.length === 0) {
          return
        }

        // Initialize timetable for this branch
        const branchTimetable: { [day: string]: { [hour: number]: ScheduledSlot | null } } = {}
        days.forEach(day => {
          branchTimetable[day] = {}
          for (let hour = workingHours.start; hour < workingHours.end; hour++) {
            branchTimetable[day][hour] = null
          }
        })

        // Track used hours for THIS branch to prevent student overlap
        const branchHourSlots: { [day: string]: boolean[] } = {}
        days.forEach(day => {
          branchHourSlots[day] = new Array(totalHoursPerDay).fill(false)
        })

        // Sort subjects by credits (descending) for better distribution
        const sortedSubjects = [...branch.subjects].sort((a, b) => b.credits - a.credits)

        // Schedule each subject with better distribution
        sortedSubjects.forEach(subject => {
          const assignment = newAssignments.find(
            ca => ca.subjectId === subject.id && ca.yearId === year.id && ca.branchId === branch.id
          )

          if (!assignment) {
            console.log(`No assignment found for subject: ${subject.name}`)
            return
          }

          const classroom = allClassrooms.find(c => c.id === assignment.classroomId)
          if (!classroom) {
            console.log(`No classroom found for assignment: ${assignment.classroomId}`)
            return
          }

          const hoursNeeded = subject.credits
          let hoursScheduled = 0

          // Calculate ideal distribution: spread evenly across all 5 days
          // For example: 4 credits = 1 hour on 4 different days, 6 credits = 1-2 hours across 5 days
          const idealHoursPerDay = hoursNeeded / days.length  // Could be decimal like 1.2
          const daysNeeded = Math.min(days.length, hoursNeeded)

          // Track how many hours scheduled per day for this subject
          const dailySchedule: { [day: string]: number } = {}
          days.forEach(d => dailySchedule[d] = 0)

          // Round-robin scheduling: cycle through days, one hour at a time
          let currentDayIndex = 0
          let attempts = 0
          const maxAttempts = days.length * totalHoursPerDay * 2 // Prevent infinite loops

          while (hoursScheduled < hoursNeeded && attempts < maxAttempts) {
            attempts++
            const day = days[currentDayIndex]

            // Move to next day if current day has enough hours for this subject
            const maxForThisDay = Math.ceil(idealHoursPerDay * 1.5) // Allow slight overage
            if (dailySchedule[day] >= maxForThisDay) {
              currentDayIndex = (currentDayIndex + 1) % days.length
              continue
            }

            // Try to find an available slot on this day
            let scheduledThisDay = false
            for (let hour = workingHours.start; hour < workingHours.end; hour++) {
              const hourIndex = hour - workingHours.start

              // Check: classroom is free AND branch has no class at this time
              if (!globalClassroomSlots[assignment.classroomId][day][hourIndex] &&
                  !branchHourSlots[day][hourIndex]) {

                const slot: ScheduledSlot = {
                  subjectId: subject.id,
                  subjectName: subject.name,
                  subjectCode: subject.code,
                  classroomId: assignment.classroomId,
                  classroomName: classroom.name,
                  day,
                  startHour: hour,
                  endHour: hour + 1,
                  type: subject.type
                }

                branchTimetable[day][hour] = slot
                globalClassroomSlots[assignment.classroomId][day][hourIndex] = true
                branchHourSlots[day][hourIndex] = true
                hoursScheduled++
                dailySchedule[day]++
                scheduledThisDay = true
                break // Move to next day after scheduling one hour
              }
            }

            // Move to next day
            currentDayIndex = (currentDayIndex + 1) % days.length
          }

          if (hoursScheduled < hoursNeeded) {
            console.log(`Warning: Only scheduled ${hoursScheduled}/${hoursNeeded} hours for ${subject.name} in ${branch.name}`)
          }
        })

        generatedTimetables.push({
          yearId: year.id,
          year: year.year,
          branchId: branch.id,
          branchName: branch.name,
          studentStrength: branch.studentStrength,
          timetable: branchTimetable
        })
      })
    })

    setClassAssignments(newAssignments)
    setBranchTimetables(generatedTimetables)
    setStep('generate')
    toast.success(`Generated ${generatedTimetables.length} timetables with optimized distribution!`)
  }

  const formatHour = (hour: number) => {
    if (hour === 12) return '12:00 PM'
    if (hour > 12) return `${hour - 12}:00 PM`
    return `${hour}:00 AM`
  }

  const downloadAllTimetablesAsPDF = () => {
    const printWindow = window.open('', '', 'height=800,width=1200')
    if (!printWindow) return

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Complete College Timetable - All Years</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1e40af; text-align: center; margin-bottom: 20px; }
          h2 { color: #059669; margin-top: 40px; page-break-before: always; font-size: 24px; }
          h2:first-of-type { page-break-before: auto; }
          h3 { color: #7c3aed; margin-top: 20px; font-size: 18px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 30px; }
          th, td { border: 2px solid #333; padding: 10px; text-align: center; font-size: 12px; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .theory-slot { background-color: #dbeafe; border: 1px solid #3b82f6; padding: 6px; border-radius: 4px; }
          .lab-slot { background-color: #e9d5ff; border: 1px solid #9333ea; padding: 6px; border-radius: 4px; }
          .subject-name { font-weight: bold; font-size: 11px; }
          .subject-code { font-size: 9px; color: #555; }
          .room-name { font-size: 9px; color: #666; margin-top: 2px; }
          .year-header { background: linear-gradient(to right, #10b981, #059669); color: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; }
          .branch-info { background: #f0fdf4; padding: 10px; border-left: 4px solid #10b981; margin-bottom: 15px; }
          @media print {
            body { padding: 10px; }
            h2 { page-break-before: always; }
            h2:first-of-type { page-break-before: auto; }
          }
        </style>
      </head>
      <body>
        <h1>🎓 Complete College Timetable - All Years & Branches</h1>
    `

    // Group by year
    const yearGroups: { [year: string]: BranchTimetable[] } = {}
    branchTimetables.forEach(bt => {
      if (!yearGroups[bt.year]) {
        yearGroups[bt.year] = []
      }
      yearGroups[bt.year].push(bt)
    })

    Object.keys(yearGroups).sort().forEach(year => {
      htmlContent += `<h2 class="year-header">📚 ${year}</h2>`

      yearGroups[year].forEach(branchTimetable => {
        htmlContent += `
          <h3>Branch: ${branchTimetable.branchName} (${branchTimetable.studentStrength} Students)</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 100px;">Time</th>
                ${days.map(day => `<th>${day}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
        `

        for (let hour = workingHours.start; hour < workingHours.end; hour++) {
          htmlContent += `<tr><td><strong>${formatHour(hour)}<br/>to<br/>${formatHour(hour + 1)}</strong></td>`

          days.forEach(day => {
            const slot = branchTimetable.timetable[day][hour]
            if (slot) {
              const slotClass = slot.type === 'lab' || slot.type === 'practical' ? 'lab-slot' : 'theory-slot'
              htmlContent += `
                <td>
                  <div class="${slotClass}">
                    <div class="subject-name">${slot.subjectName}</div>
                    <div class="subject-code">[${slot.subjectCode}]</div>
                    <div class="room-name">📍 ${slot.classroomName}</div>
                  </div>
                </td>
              `
            } else {
              htmlContent += '<td style="background:#f9fafb;">-</td>'
            }
          })

          htmlContent += '</tr>'
        }

        htmlContent += `
            </tbody>
          </table>
        `
      })
    })

    htmlContent += `
        <div style="margin-top: 50px; text-align: center; color: #666; font-size: 12px;">
          Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </div>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()

    setTimeout(() => {
      printWindow.print()
      toast.success('Print dialog opened! Save as PDF to download.')
    }, 250)
  }

  const getTotalStats = () => {
    let totalBranches = 0
    let totalSubjects = 0
    let totalStudents = 0

    yearBranchConfigs.forEach(year => {
      totalBranches += year.branches.length
      year.branches.forEach(branch => {
        totalSubjects += branch.subjects.length
        totalStudents += branch.studentStrength
      })
    })

    return { totalBranches, totalSubjects, totalStudents }
  }

  const stats = getTotalStats()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎓 Complete College Timetable Scheduler</h1>
          <p className="text-gray-600">Add all academic data first, then generate timetables for all years & branches at once</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step === 'facility' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            <span className="font-bold">1</span>
            <span>Facility Setup</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step === 'academic' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            <span className="font-bold">2</span>
            <span>Academic Data</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step === 'generate' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            <span className="font-bold">3</span>
            <span>Generate & Download</span>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{facilityConfig?.numClassrooms || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Classrooms</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
            <div className="text-3xl font-bold text-purple-600">{facilityConfig?.numLabs || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Labs</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
            <div className="text-3xl font-bold text-green-600">{yearBranchConfigs.length}</div>
            <div className="text-sm text-gray-600 mt-1">Years</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
            <div className="text-3xl font-bold text-orange-600">{stats.totalBranches}</div>
            <div className="text-sm text-gray-600 mt-1">Branches</div>
          </div>
          <div className="bg-pink-50 rounded-lg p-4 border-2 border-pink-200">
            <div className="text-3xl font-bold text-pink-600">{stats.totalSubjects}</div>
            <div className="text-sm text-gray-600 mt-1">Subjects</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200">
            <div className="text-3xl font-bold text-indigo-600">{stats.totalStudents}</div>
            <div className="text-sm text-gray-600 mt-1">Students</div>
          </div>
        </div>

        {/* Step 1: Facility Configuration */}
        {step === 'facility' && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Step 1: Configure College Facilities</h2>
              <p className="text-sm text-gray-500 mt-1">Enter total classrooms and labs available in your college</p>
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
                  Continue to Academic Data →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Academic Data Entry */}
        {step === 'academic' && facilityConfig && (
          <>
            {/* Facility Summary */}
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">Facilities Configured</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {facilityConfig.numClassrooms} Classrooms ({facilityConfig.classroomCapacity} capacity) • {facilityConfig.numLabs} Labs ({facilityConfig.labCapacity} capacity)
                  </p>
                </div>
                <button
                  onClick={() => setStep('facility')}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Years and Branches */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Step 2: Add All Academic Data</h2>
                    <p className="text-sm text-gray-500 mt-1">Add all years, branches, and subjects for your entire college</p>
                  </div>
                  <button
                    onClick={() => setShowAddYear(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Year
                  </button>
                </div>
              </div>

              {/* Add Year Form */}
              {showAddYear && (
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Year (e.g., 1st Year, 2nd Year, 3rd Year, 4th Year)"
                      value={newYear.year}
                      onChange={(e) => setNewYear({ year: e.target.value })}
                      className="input flex-1"
                    />
                    <button onClick={handleAddYear} className="btn-primary">Add</button>
                    <button onClick={() => setShowAddYear(false)} className="btn-secondary">Cancel</button>
                  </div>
                </div>
              )}

              {/* Years List */}
              <div className="p-6">
                {yearBranchConfigs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="mb-2">No years added yet</p>
                    <p className="text-sm">Click "Add Year" to start (e.g., 1st Year, 2nd Year, etc.)</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {yearBranchConfigs.map((year) => {
                      const totalSubjectsInYear = year.branches.reduce((sum, b) => sum + b.subjects.length, 0)
                      const totalStudentsInYear = year.branches.reduce((sum, b) => sum + b.studentStrength, 0)

                      return (
                        <div key={year.id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                          {/* Year Header */}
                          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-xl font-bold">📚 {year.year}</h3>
                                <p className="text-sm text-green-100 mt-1">
                                  Branches: {year.branches.length} • Total Subjects: {totalSubjectsInYear} • Total Students: {totalStudentsInYear}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleShowAddBranch(year.id)}
                                  className="px-3 py-1.5 rounded bg-white/20 hover:bg-white/30 transition text-sm"
                                >
                                  + Add Branch
                                </button>
                                <button
                                  onClick={() => handleDeleteYear(year.id)}
                                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Branches List */}
                          <div className="p-4 bg-gray-50">
                            {year.branches.length === 0 ? (
                              <div className="text-center py-8 text-gray-500 text-sm">
                                No branches added yet. Click "+ Add Branch" to add branches like CSE, ECE, etc.
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {year.branches.map((branch) => (
                                  <div key={branch.id} className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
                                    {/* Branch Header */}
                                    <div className="bg-blue-50 p-3 border-b border-gray-200">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <h4 className="font-bold text-blue-900">{branch.name}</h4>
                                          <p className="text-xs text-blue-700 mt-1">
                                            Students: {branch.studentStrength} • Subjects: {branch.subjects.length}
                                          </p>
                                        </div>
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => handleShowAddSubject(year.id, branch.id)}
                                            className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                          >
                                            <BookOpen className="w-3 h-3" />
                                            Add Subject
                                          </button>
                                          <button
                                            onClick={() => handleDeleteBranch(year.id, branch.id)}
                                            className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Subjects List */}
                                    <div className="p-3">
                                      {branch.subjects.length === 0 ? (
                                        <div className="text-center py-4 text-gray-500 text-xs">
                                          No subjects added. Click "Add Subject" to add courses.
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                          {branch.subjects.map((subject) => (
                                            <div
                                              key={subject.id}
                                              className={`rounded border p-2 ${
                                                subject.type === 'lab' || subject.type === 'practical'
                                                  ? 'bg-purple-50 border-purple-300'
                                                  : 'bg-blue-50 border-blue-300'
                                              }`}
                                            >
                                              <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                  <div className={`text-xs font-bold ${
                                                    subject.type === 'lab' || subject.type === 'practical'
                                                      ? 'text-purple-700'
                                                      : 'text-blue-700'
                                                  }`}>
                                                    {subject.name}
                                                  </div>
                                                  <div className="text-xs text-gray-600 mt-0.5">
                                                    [{subject.code}] • {subject.credits}h • {subject.type}
                                                  </div>
                                                </div>
                                                <button
                                                  onClick={() => handleDeleteSubject(year.id, branch.id, subject.id)}
                                                  className="text-red-500 hover:text-red-700"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Generate Button */}
              {yearBranchConfigs.length > 0 && stats.totalSubjects > 0 && (
                <div className="p-6 border-t border-gray-200 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-green-900">Ready to Generate Timetables!</h3>
                      <p className="text-sm text-green-700 mt-1">
                        {yearBranchConfigs.length} Years • {stats.totalBranches} Branches • {stats.totalSubjects} Total Subjects
                      </p>
                    </div>
                    <button
                      onClick={generateAllTimetables}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition shadow-lg text-lg font-semibold"
                    >
                      <PlayCircle className="w-6 h-6" />
                      Generate All Timetables
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Add Branch Modal */}
        {showAddBranch && (() => {
          const selectedYear = yearBranchConfigs.find(y => y.id === selectedYearId)
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6 border-b">
                  <h3 className="text-xl font-semibold">Add Branch</h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedYear?.year}</p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                    <input
                      type="text"
                      placeholder="e.g., CSE, ECE, Mechanical, Civil"
                      value={newBranch.name}
                      onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                      className="input w-full"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student Strength</label>
                    <input
                      type="number"
                      placeholder="Total students in this branch"
                      value={newBranch.studentStrength}
                      onChange={(e) => setNewBranch({ ...newBranch, studentStrength: parseInt(e.target.value) || 0 })}
                      className="input w-full"
                      min="1"
                    />
                  </div>
                </div>
                <div className="p-6 border-t flex gap-3">
                  <button onClick={handleAddBranch} className="btn-primary flex-1">Add Branch</button>
                  <button
                    onClick={() => {
                      setShowAddBranch(false)
                      setSelectedYearId('')
                      setNewBranch({ name: '', studentStrength: 60 })
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

        {/* Add Subject Modal */}
        {showAddSubject && (() => {
          const selectedYear = yearBranchConfigs.find(y => y.id === selectedYearId)
          const selectedBranch = selectedYear?.branches.find(b => b.id === selectedBranchId)

          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6 border-b">
                  <h3 className="text-xl font-semibold">Add Subject</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedYear?.year} - {selectedBranch?.name}
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Data Structures, Physics"
                      value={newSubject.name}
                      onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                      className="input w-full"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Code</label>
                    <input
                      type="text"
                      placeholder="e.g., CS201, PHY101"
                      value={newSubject.code}
                      onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value.toUpperCase() })}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Credits (Hours/Week)</label>
                    <input
                      type="number"
                      placeholder="1-6 credits"
                      value={newSubject.credits}
                      onChange={(e) => setNewSubject({ ...newSubject, credits: parseInt(e.target.value) || 3 })}
                      className="input w-full"
                      min="1"
                      max="6"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={newSubject.type}
                      onChange={(e) => setNewSubject({ ...newSubject, type: e.target.value as 'theory' | 'lab' | 'practical' })}
                      className="input w-full"
                    >
                      <option value="theory">Theory</option>
                      <option value="lab">Lab</option>
                      <option value="practical">Practical</option>
                    </select>
                  </div>
                </div>
                <div className="p-6 border-t flex gap-3">
                  <button onClick={handleAddSubject} className="btn-primary flex-1">Add Subject</button>
                  <button
                    onClick={() => {
                      setShowAddSubject(false)
                      setSelectedYearId('')
                      setSelectedBranchId('')
                      setNewSubject({ name: '', code: '', credits: 3, type: 'theory' })
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

        {/* Step 3: Generated Timetables */}
        {step === 'generate' && branchTimetables.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200 bg-green-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-green-900">✅ All Timetables Generated!</h2>
                  <p className="text-sm text-green-700 mt-1">
                    {branchTimetables.length} timetables across {yearBranchConfigs.length} years
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('academic')}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-green-700 border-2 border-green-600 rounded-lg hover:bg-green-50 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Data
                  </button>
                  <button
                    onClick={downloadAllTimetablesAsPDF}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-lg font-semibold"
                  >
                    <Download className="w-5 h-5" />
                    Download Complete PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Timetables Preview */}
            <div className="p-6">
              <div className="space-y-8">
                {yearBranchConfigs.map(year => {
                  const yearTimetables = branchTimetables.filter(bt => bt.yearId === year.id)
                  if (yearTimetables.length === 0) return null

                  return (
                    <div key={year.id} className="border-2 border-green-200 rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
                        <h3 className="text-xl font-bold">📚 {year.year}</h3>
                      </div>
                      <div className="p-4 space-y-6">
                        {yearTimetables.map(branchTimetable => (
                          <div key={branchTimetable.branchId} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-blue-50 p-3 border-b border-gray-200">
                              <h4 className="font-bold text-blue-900">
                                {branchTimetable.branchName} ({branchTimetable.studentStrength} Students)
                              </h4>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="border p-2 text-left font-bold w-20">Time</th>
                                    {days.map(day => (
                                      <th key={day} className="border p-2 text-center font-bold">{day}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {Array.from({ length: workingHours.end - workingHours.start }).map((_, index) => {
                                    const hour = workingHours.start + index
                                    return (
                                      <tr key={hour} className="hover:bg-gray-50">
                                        <td className="border p-2 font-semibold bg-gray-50 text-xs">
                                          {formatHour(hour)}<br/>-<br/>{formatHour(hour + 1)}
                                        </td>
                                        {days.map(day => {
                                          const slot = branchTimetable.timetable[day][hour]
                                          return (
                                            <td key={`${day}-${hour}`} className="border p-1">
                                              {slot ? (
                                                <div className={`rounded p-2 text-xs ${
                                                  slot.type === 'lab' || slot.type === 'practical'
                                                    ? 'bg-purple-100 border border-purple-300'
                                                    : 'bg-blue-100 border border-blue-300'
                                                }`}>
                                                  <div className={`font-bold ${
                                                    slot.type === 'lab' || slot.type === 'practical'
                                                      ? 'text-purple-900'
                                                      : 'text-blue-900'
                                                  }`}>
                                                    {slot.subjectName}
                                                  </div>
                                                  <div className="text-xs text-gray-600 mt-0.5">
                                                    [{slot.subjectCode}]
                                                  </div>
                                                  <div className="text-xs text-gray-600">
                                                    📍 {slot.classroomName}
                                                  </div>
                                                </div>
                                              ) : (
                                                <div className="text-center text-gray-400 py-2 text-xs">-</div>
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
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Scheduler
