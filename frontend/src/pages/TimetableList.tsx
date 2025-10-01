import { Link } from 'react-router-dom'
import { Plus, Calendar, Eye } from 'lucide-react'

export default function TimetableList() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timetables</h1>
          <p className="mt-2 text-gray-600">
            Manage and generate academic timetables
          </p>
        </div>
        <Link to="/timetables/create" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create New Timetable
        </Link>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No timetables yet
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first timetable
          </p>
          <Link to="/timetables/create" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Timetable
          </Link>
        </div>
      </div>
    </div>
  )
}
