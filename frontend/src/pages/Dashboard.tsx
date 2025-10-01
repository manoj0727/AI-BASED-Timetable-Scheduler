import { Calendar, BookOpen, Users, Building } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    { name: 'Active Timetables', value: '0', icon: Calendar, color: 'bg-blue-500' },
    { name: 'Total Courses', value: '0', icon: BookOpen, color: 'bg-green-500' },
    { name: 'Faculty Members', value: '0', icon: Users, color: 'bg-purple-500' },
    { name: 'Classrooms', value: '0', icon: Building, color: 'bg-orange-500' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to NEP 2020 Timetable Scheduler
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 card">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
              1
            </div>
            <div>
              <h3 className="font-medium">Set up Academic Structure</h3>
              <p className="text-sm text-gray-600">
                Add programs, departments, and course categories
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
              2
            </div>
            <div>
              <h3 className="font-medium">Add Resources</h3>
              <p className="text-sm text-gray-600">
                Add faculty members, rooms, and courses
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
              3
            </div>
            <div>
              <h3 className="font-medium">Configure Constraints</h3>
              <p className="text-sm text-gray-600">
                Set faculty availability and course preferences
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
              4
            </div>
            <div>
              <h3 className="font-medium">Generate Timetable</h3>
              <p className="text-sm text-gray-600">
                Create and optimize your academic timetable
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
