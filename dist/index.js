"use strict";

// ======= Базові типи =======
type WeekDay = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
type SlotTime = "8:30-10:00" | "10:15-11:45" | "12:15-13:45" | "14:00-15:30" | "15:45-17:15";
type LessonType = "Lecture" | "Seminar" | "Lab" | "Practice";

type Teacher = { id: number; name: string; department: string; };
type Room = { number: string; capacity: number; hasProjector: boolean; };
type Subject = { id: number; name: string; type: LessonType; };
type Session = { sessionId: number; subjectId: number; teacherId: number; roomNumber: string; day: WeekDay; time: SlotTime; };

// ======= Масиви для даних =======
let teachers: Teacher[] = [];
let rooms: Room[] = [];
let subjects: Subject[] = [];
let timetable: Session[] = [];

// ======= Функції для додавання =======
function addTeacher(teacher: Teacher): void {
    teachers.push(teacher);
}

function addRoom(room: Room): void {
    rooms.push(room);
}

function addSubject(subject: Subject): void {
    subjects.push(subject);
}

function scheduleSession(session: Session): boolean {
    const conflict = checkSessionConflict(session);
    if (!conflict) {
        timetable.push(session);
        return true;
    }
    console.warn("Conflict detected:", conflict);
    return false;
}

// ======= Пошук та фільтрація =======
function getFreeRooms(day: WeekDay, time: SlotTime): string[] {
    const busyRooms = timetable
        .filter(s => s.day === day && s.time === time)
        .map(s => s.roomNumber);

    return rooms.map(r => r.number).filter(n => !busyRooms.includes(n));
}

function getTeacherSchedule(teacherId: number): Session[] {
    return timetable.filter(s => s.teacherId === teacherId);
}

// ======= Перевірка конфліктів =======
type Conflict = { type: "TeacherConflict" | "RoomConflict"; sessionDetails: Session; };

function checkSessionConflict(session: Session): Conflict | null {
    const conflicting = timetable.find(s =>
        s.day === session.day &&
        s.time === session.time &&
        (s.teacherId === session.teacherId || s.roomNumber === session.roomNumber)
    );

    if (!conflicting) return null;

    return conflicting.teacherId === session.teacherId
        ? { type: "TeacherConflict", sessionDetails: conflicting }
        : { type: "RoomConflict", sessionDetails: conflicting };
}

// ======= Аналітика =======
function getRoomUsage(roomNumber: string): number {
    const totalSlots = 5 * 5; // 5 днів * 5 часових слотів
    const occupied = timetable.filter(s => s.roomNumber === roomNumber).length;
    return (occupied / totalSlots) * 100;
}

function showRoomUsage(): void {
    rooms.forEach(room => {
        console.log(`Room ${room.number} usage: ${getRoomUsage(room.number).toFixed(2)}%`);
    });
}

function getMostFrequentLessonType(): LessonType {
    const counts: Record<LessonType, number> = { Lecture: 0, Seminar: 0, Lab: 0, Practice: 0 };

    timetable.forEach(s => {
        const subj = subjects.find(sub => sub.id === s.subjectId);
        if (subj) counts[subj.type]++;
    });

    let popular: LessonType = "Lecture";
    let maxCount = 0;
    for (const type in counts) {
        if (counts[type as LessonType] > maxCount) {
            maxCount = counts[type as LessonType];
            popular = type as LessonType;
        }
    }
    return popular;
}

// ======= Зміни та скасування =======
function changeRoom(sessionId: number, newRoom: string): boolean {
    const session = timetable.find(s => s.sessionId === sessionId);
    if (!session) return false;

    const conflict = checkSessionConflict({ ...session, teacherId: -1, roomNumber: newRoom });
    if (conflict) return false;

    session.roomNumber = newRoom;
    return true;
}

function cancelSession(sessionId: number): void {
    const index = timetable.findIndex(s => s.sessionId === sessionId);
    if (index !== -1) timetable.splice(index, 1);
    else console.warn(`No session found with ID ${sessionId}`);
}

// ======= Демонстрація роботи =======
function demo() {
    addTeacher({ id: 1, name: "Dr. Ivanov", department: "Math" });
    addTeacher({ id: 2, name: "Dr. Petrenko", department: "CS" });

    addRoom({ number: "B101", capacity: 30, hasProjector: true });
    addRoom({ number: "B102", capacity: 25, hasProjector: false });

    addSubject({ id: 101, name: "Programming Basics", type: "Lecture" });
    addSubject({ id: 102, name: "Data Structures", type: "Seminar" });

    console.log("---- Free rooms before scheduling ----", getFreeRooms("Monday", "8:30-10:00"));

    scheduleSession({ sessionId: 1, subjectId: 101, teacherId: 1, roomNumber: "B101", day: "Monday", time: "8:30-10:00" });
    scheduleSession({ sessionId: 2, subjectId: 102, teacherId: 1, roomNumber: "B101", day: "Monday", time: "8:30-10:00" });

    console.log("---- Teacher schedule ----", getTeacherSchedule(1));
    console.log("---- Free rooms ----", getFreeRooms("Monday", "8:30-10:00"));
    console.log("---- Most frequent lesson type ----", getMostFrequentLessonType());

    showRoomUsage();
    changeRoom(1, "B102");
    cancelSession(2);

    console.log("---- Final timetable ----", timetable);
}

demo();
