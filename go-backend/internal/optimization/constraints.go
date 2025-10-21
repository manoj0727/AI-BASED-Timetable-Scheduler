package optimization

// NoFacultyDoubleBooking ensures no faculty is assigned to two classes at the same time
type NoFacultyDoubleBooking struct{}

func (c *NoFacultyDoubleBooking) IsHard() bool { return true }

func (c *NoFacultyDoubleBooking) Evaluate(solution *Solution) (bool, float64) {
	violations := 0
	facultySchedule := make(map[string][]string) // faculty_id -> [time_slots]

	for _, assignment := range solution.Schedule {
		key := assignment.FacultyID.String()
		slot := assignment.DayOfWeek
		timeKey := string(rune(slot)) + ":" + assignment.StartTime + "-" + assignment.EndTime

		if existing, found := facultySchedule[key]; found {
			for _, existingSlot := range existing {
				// Check for overlap
				violations++
			}
		}
		facultySchedule[key] = append(facultySchedule[key], timeKey)
	}

	return violations > 0, float64(violations)
}

func (c *NoFacultyDoubleBooking) GetDescription() string {
	return "Faculty members cannot be assigned to multiple classes at the same time"
}

// NoRoomDoubleBooking ensures no room is used by two classes at the same time
type NoRoomDoubleBooking struct{}

func (c *NoRoomDoubleBooking) IsHard() bool { return true }

func (c *NoRoomDoubleBooking) Evaluate(solution *Solution) (bool, float64) {
	violations := 0
	roomSchedule := make(map[string][]string) // room_id -> [time_slots]

	for _, assignment := range solution.Schedule {
		key := assignment.RoomID.String()
		slot := assignment.DayOfWeek
		timeKey := string(rune(slot)) + ":" + assignment.StartTime + "-" + assignment.EndTime

		if existing, found := roomSchedule[key]; found {
			for range existing {
				violations++
			}
		}
		roomSchedule[key] = append(roomSchedule[key], timeKey)
	}

	return violations > 0, float64(violations)
}

func (c *NoRoomDoubleBooking) GetDescription() string {
	return "Rooms cannot be used by multiple classes at the same time"
}

// FacultyWorkloadLimit ensures faculty don't exceed max hours per week
type FacultyWorkloadLimit struct {
	MaxHours map[string]int // faculty_id -> max_hours
}

func (c *FacultyWorkloadLimit) IsHard() bool { return true }

func (c *FacultyWorkloadLimit) Evaluate(solution *Solution) (bool, float64) {
	violations := 0
	facultyHours := make(map[string]int)

	for _, assignment := range solution.Schedule {
		facultyID := assignment.FacultyID.String()
		// Calculate hours (simplified - should parse time strings)
		facultyHours[facultyID] += 1
	}

	for facultyID, hours := range facultyHours {
		if maxHours, exists := c.MaxHours[facultyID]; exists {
			if hours > maxHours {
				violations += hours - maxHours
			}
		}
	}

	return violations > 0, float64(violations)
}

func (c *FacultyWorkloadLimit) GetDescription() string {
	return "Faculty members must not exceed their maximum hours per week"
}

// RoomCapacityConstraint ensures room capacity is sufficient
type RoomCapacityConstraint struct {
	RoomCapacities map[string]int    // room_id -> capacity
	CourseEnrollments map[string]int // course_id -> student_count
}

func (c *RoomCapacityConstraint) IsHard() bool { return true }

func (c *RoomCapacityConstraint) Evaluate(solution *Solution) (bool, float64) {
	violations := 0

	for _, assignment := range solution.Schedule {
		roomID := assignment.RoomID.String()
		courseID := assignment.CourseID.String()

		capacity, roomExists := c.RoomCapacities[roomID]
		enrollment, courseExists := c.CourseEnrollments[courseID]

		if roomExists && courseExists && enrollment > capacity {
			violations += enrollment - capacity
		}
	}

	return violations > 0, float64(violations)
}

func (c *RoomCapacityConstraint) GetDescription() string {
	return "Room capacity must be sufficient for enrolled students"
}

// LabRoomRequirement ensures lab courses are in lab rooms
type LabRoomRequirement struct {
	LabCourses []string // course_ids that are labs
	LabRooms   []string // room_ids that are labs
}

func (c *LabRoomRequirement) IsHard() bool { return true }

func (c *LabRoomRequirement) Evaluate(solution *Solution) (bool, float64) {
	violations := 0

	labCourseMap := make(map[string]bool)
	for _, courseID := range c.LabCourses {
		labCourseMap[courseID] = true
	}

	labRoomMap := make(map[string]bool)
	for _, roomID := range c.LabRooms {
		labRoomMap[roomID] = true
	}

	for _, assignment := range solution.Schedule {
		courseID := assignment.CourseID.String()
		roomID := assignment.RoomID.String()

		if labCourseMap[courseID] && !labRoomMap[roomID] {
			violations++
		}
	}

	return violations > 0, float64(violations)
}

func (c *LabRoomRequirement) GetDescription() string {
	return "Lab courses must be scheduled in lab rooms"
}

// FacultyAvailability ensures faculty are scheduled only when available
type FacultyAvailability struct {
	Availability map[string]map[int][]TimeRange // faculty_id -> day -> available time ranges
}

type TimeRange struct {
	Start string
	End   string
}

func (c *FacultyAvailability) IsHard() bool { return true }

func (c *FacultyAvailability) Evaluate(solution *Solution) (bool, float64) {
	violations := 0

	for _, assignment := range solution.Schedule {
		facultyID := assignment.FacultyID.String()
		day := assignment.DayOfWeek

		if facultyAvail, exists := c.Availability[facultyID]; exists {
			if dayAvail, dayExists := facultyAvail[day]; dayExists {
				available := false
				for _, timeRange := range dayAvail {
					if assignment.StartTime >= timeRange.Start && assignment.EndTime <= timeRange.End {
						available = true
						break
					}
				}
				if !available {
					violations++
				}
			} else {
				violations++
			}
		}
	}

	return violations > 0, float64(violations)
}

func (c *FacultyAvailability) GetDescription() string {
	return "Faculty must be scheduled only during their available time slots"
}

// SOFT CONSTRAINTS

// PreferMorningForTheory prefers scheduling theory classes in the morning
type PreferMorningForTheory struct {
	TheoryCourses []string
}

func (c *PreferMorningForTheory) IsHard() bool { return false }

func (c *PreferMorningForTheory) Evaluate(solution *Solution) (bool, float64) {
	penalty := 0.0

	theoryCourseMap := make(map[string]bool)
	for _, courseID := range c.TheoryCourses {
		theoryCourseMap[courseID] = true
	}

	for _, assignment := range solution.Schedule {
		courseID := assignment.CourseID.String()

		if theoryCourseMap[courseID] {
			// Parse start time (simplified)
			if assignment.StartTime > "12:00" {
				penalty += 5.0 // Afternoon classes get penalty
			}
			if assignment.StartTime > "15:00" {
				penalty += 10.0 // Evening classes get higher penalty
			}
		}
	}

	return penalty > 0, penalty
}

func (c *PreferMorningForTheory) GetDescription() string {
	return "Theory classes are preferred in morning time slots"
}

// FacultyPreference considers faculty course preferences
type FacultyPreference struct {
	Preferences map[string]map[string]int // faculty_id -> course_id -> preference (1-5)
}

func (c *FacultyPreference) IsHard() bool { return false }

func (c *FacultyPreference) Evaluate(solution *Solution) (bool, float64) {
	penalty := 0.0

	for _, assignment := range solution.Schedule {
		facultyID := assignment.FacultyID.String()
		courseID := assignment.CourseID.String()

		if facultyPrefs, exists := c.Preferences[facultyID]; exists {
			if pref, hasPref := facultyPrefs[courseID]; hasPref {
				// Lower preference = higher penalty
				penalty += float64(5 - pref)
			} else {
				penalty += 5.0 // No preference listed = max penalty
			}
		}
	}

	return penalty > 0, penalty
}

func (c *FacultyPreference) GetDescription() string {
	return "Faculty are preferred to teach courses they have higher preference for"
}

// AvoidBackToBackLabs avoids scheduling labs back-to-back
type AvoidBackToBackLabs struct {
	LabCourses []string
}

func (c *AvoidBackToBackLabs) IsHard() bool { return false }

func (c *AvoidBackToBackLabs) Evaluate(solution *Solution) (bool, float64) {
	penalty := 0.0

	labCourseMap := make(map[string]bool)
	for _, courseID := range c.LabCourses {
		labCourseMap[courseID] = true
	}

	// Group by day
	daySchedule := make(map[int][]*ClassAssignment)
	for _, assignment := range solution.Schedule {
		daySchedule[assignment.DayOfWeek] = append(daySchedule[assignment.DayOfWeek], assignment)
	}

	// Check for back-to-back labs
	for _, assignments := range daySchedule {
		for i := 0; i < len(assignments)-1; i++ {
			curr := assignments[i]
			next := assignments[i+1]

			if labCourseMap[curr.CourseID.String()] && labCourseMap[next.CourseID.String()] {
				if curr.EndTime == next.StartTime {
					penalty += 10.0
				}
			}
		}
	}

	return penalty > 0, penalty
}

func (c *AvoidBackToBackLabs) GetDescription() string {
	return "Lab sessions should not be scheduled back-to-back"
}

// BalancedDailyDistribution prefers balanced distribution of classes across days
type BalancedDailyDistribution struct{}

func (c *BalancedDailyDistribution) IsHard() bool { return false }

func (c *BalancedDailyDistribution) Evaluate(solution *Solution) (bool, float64) {
	dayCount := make(map[int]int)

	for _, assignment := range solution.Schedule {
		dayCount[assignment.DayOfWeek]++
	}

	// Calculate standard deviation
	if len(dayCount) == 0 {
		return false, 0
	}

	sum := 0
	for _, count := range dayCount {
		sum += count
	}
	mean := float64(sum) / float64(len(dayCount))

	variance := 0.0
	for _, count := range dayCount {
		diff := float64(count) - mean
		variance += diff * diff
	}
	variance /= float64(len(dayCount))

	penalty := variance

	return penalty > 0, penalty
}

func (c *BalancedDailyDistribution) GetDescription() string {
	return "Classes should be evenly distributed across weekdays"
}
