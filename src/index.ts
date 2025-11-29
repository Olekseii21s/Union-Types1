// Визначення базових типів:

type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type TimeSlot =
  | "8:30-10:00"
  | "10:15-11:45"
  | "12:15-13:45"
  | "14:00-15:30"
  | "15:45-17:15";

type CourseType = "Lecture" | "Seminar" | "Lab" | "Practice";

// Створення основних структур:

type Professor = {
  id: number;
  name: string;
  department: string;
};

type Classroom = {
  number: string;
  capacity: number;
  hasProjector: boolean;
};

type Course = {
  id: number;
  name: string;
  type: CourseType;
};

type Lesson = {
  lessonId: number;
  courseId: number;
  professorId: number;
  classroomNumber: string;
  dayOfWeek: DayOfWeek;
  timeSlot: TimeSlot;
};

// Робота з масивами даних:

const professors: Professor[] = [];
const classrooms: Classroom[] = [];
const courses: Course[] = [];
const schedule: Lesson[] = [];

function addProfessor(professor: Professor): void {
  professors.push(professor);
}

function addClassroom(classroom: Classroom): void {
  classrooms.push(classroom);
}

function addCoourse(course: Course): void {
  courses.push(course);
}

// function addLesson(lesson: Lesson): boolean {
//   const conflict = schedule.find(
//     (l) =>
//       l.dayOfWeek === lesson.dayOfWeek &&
//       l.timeSlot === lesson.timeSlot &&
//       (l.professorId === lesson.professorId ||
//         l.classroomNumber === lesson.classroomNumber)
//   );

//   if (!conflict) {
//     schedule.push(lesson);
//   }
//   return !conflict;
// }

function addLesson(lesson: Lesson): boolean {
  const conflict = validateLesson(lesson);

  if (conflict === null) {
    schedule.push(lesson);
  }

  console.log("conflict", conflict);

  return !conflict;
}

// Функції пошуку та фільтрації:

function findAvailableClassrooms(
  timeSlot: TimeSlot,
  dayOfWeek: DayOfWeek
): string[] {
  const occupied = schedule
    .filter((l) => l.dayOfWeek === dayOfWeek && l.timeSlot === timeSlot)
    .map((l) => l.classroomNumber);
  return classrooms.map((c) => c.number).filter((n) => !occupied.includes(n));
}

function getProfessorSchedule(professorId: number): Lesson[] {
  return schedule.filter((l) => l.professorId === professorId);
}

// Обробка конфліктів та валідація:
type ScheduleConflict = {
  type: "ProfessorConflict" | "ClassroomConflict";
  lessonDetails: Lesson;
};

function validateLesson(lesson: Lesson): ScheduleConflict | null {
  const conflict = schedule.find(
    (l) =>
      l.dayOfWeek === lesson.dayOfWeek &&
      l.timeSlot === lesson.timeSlot &&
      (l.professorId === lesson.professorId ||
        l.classroomNumber === lesson.classroomNumber)
  );
  if (conflict) {
    if (conflict.professorId === lesson.professorId) {
      return { type: "ProfessorConflict", lessonDetails: conflict };
    } else {
      return { type: "ClassroomConflict", lessonDetails: conflict };
    }
  }
  return null;
}

// Аналіз та звіти:

function getClassroomUtilization(classroomNumber: string): number {
  const totalSlots = 5 * 5; // 5 днів * 5 часових слотів
  const usedSlots = schedule.filter(
    (l) => l.classroomNumber === classroomNumber
  ).length;
  return (usedSlots / totalSlots) * 100;
}

function printALLClassroomUtilization() {
  classrooms.forEach((classroom) => {
    const utilization = getClassroomUtilization(classroom.number);
    console.log(
      `Classroom ${classroom.number} utilization: ${utilization.toFixed(2)}%`
    );
  });
}

function getMostPopularCourseType(): CourseType {
  const typeCount: { [key in CourseType]: number } = {
    Lecture: 0,
    Seminar: 0,
    Lab: 0,
    Practice: 0,
  };

  schedule.forEach((lesson) => {
    const course = courses.find((c) => c.id === lesson.courseId);
    if (course) {
      typeCount[course.type]++;
    }
  });

  console.log(typeCount);

  let popularType: CourseType = "Lecture";
  let maxCount = 0;
  for (const type in typeCount) {
    if (typeCount[type as CourseType] > maxCount) {
      maxCount = typeCount[type as CourseType];
      popularType = type as CourseType;
    }
  }
  return popularType;
}

function reassignClassroom(
  lessonId: number,
  newClassroomNumber: string
): boolean {
  const lesson = schedule.find((l) => l.lessonId === lessonId);
  if (!lesson) return false;

  const conflict = validateLesson({
    ...lesson,
    professorId: -1,
    classroomNumber: newClassroomNumber,
  });

  console.log("conflict", conflict);

  if (conflict) return false;

  lesson.classroomNumber = newClassroomNumber;
  return true;
}

function cancelLesson(lessonId: number): void {
  const index = schedule.findIndex((l) => l.lessonId === lessonId);
  if (index !== -1) schedule.splice(index, 1);
  else {
    console.log(`Lesson with ID ${lessonId} not found.`);
  }
}

function main() {
  addProfessor({ id: 1, name: "Dr. Smith", department: "Computer Science" });
  addClassroom({ number: "A101", capacity: 30, hasProjector: true });
  addClassroom({ number: "A102", capacity: 25, hasProjector: false });
  addCoourse({ id: 101, name: "Intro to Programming on JS", type: "Lecture" });
  addCoourse({ id: 102, name: "Intro to Programming on CS", type: "Seminar" });
  addCoourse({ id: 103, name: "Intro to Programming on TS", type: "Seminar" });

  console.log("\n--- Поточні аудиторії, викладачі та курси ---");
  console.log("classrooms", classrooms);
  console.log("professors", professors);
  console.log("courses", courses);

  console.log("\n----- Додавання уроків та перевірка конфліктів -----");
  console.log(
    addLesson({
      lessonId: 1,
      courseId: 101,
      professorId: 1,
      classroomNumber: "A101",
      dayOfWeek: "Monday",
      timeSlot: "8:30-10:00",
    })
  );

  console.log(
    addLesson({
      lessonId: 2,
      courseId: 101,
      professorId: 1,
      classroomNumber: "A101",
      dayOfWeek: "Monday",
      timeSlot: "8:30-10:00",
    })
  );

  console.log("\n--- Поточний розклад ---");
  console.log("schedule", schedule);

  console.log("\n----- Пошук вільних аудиторій -----");
  console.log(
    "НЕ зайнята аудиторія в понеділок 8:30-10:00:",
    findAvailableClassrooms("8:30-10:00", "Monday")
  );

  console.log("----- Розклад викладача -----");
  console.log("Розклад викладача 1", getProfessorSchedule(1));

  console.log("\n----- Додаткові уроки -----");
  addLesson({
    lessonId: 3,
    courseId: 102,
    professorId: 2,
    classroomNumber: "A101",
    dayOfWeek: "Monday",
    timeSlot: "8:30-10:00",
  });
  addLesson({
    lessonId: 4,
    courseId: 102,
    professorId: 1,
    classroomNumber: "A102",
    dayOfWeek: "Monday",
    timeSlot: "8:30-10:00",
  });
  addLesson({
    lessonId: 5,
    courseId: 102,
    professorId: 1,
    classroomNumber: "A102",
    dayOfWeek: "Tuesday",
    timeSlot: "8:30-10:00",
  });
  addLesson({
    lessonId: 6,
    courseId: 102,
    professorId: 1,
    classroomNumber: "A102",
    dayOfWeek: "Wednesday",
    timeSlot: "8:30-10:00",
  });

  console.log("\n--- Розклад після спроби додати конфліктні уроки ---");
  console.log("schedule after conflict attempt", schedule);

  console.log("\n----- Використання аудиторій -----");
  printALLClassroomUtilization();

  console.log("\n----- Найпопулярніший тип курсу -----");
  console.log("Most popular course type:", getMostPopularCourseType());

  console.log("\n----- Переназначення аудиторії для уроку 1 -----");
  console.log(
    "Reassign classroom for lesson 1 to A102:",
    reassignClassroom(1, "A102")
  );
  console.log("schedule after reassignment", schedule);

  console.log("\n----- Скасування уроків -----");
  cancelLesson(1);
  console.log("schedule after cancellation", schedule);
  cancelLesson(1);
}

main();
