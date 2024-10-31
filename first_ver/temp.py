from dataclasses import dataclass
from typing import List, Dict
import datetime


@dataclass
class Teacher:
    id: int
    name: str


@dataclass
class Course:
    id: int
    name: str
    teacher: Teacher


@dataclass
class StudentGroup:
    id: int
    name: str


@dataclass
class TimeSlot:
    day: str
    start_time: datetime.time
    end_time: datetime.time
    week_parity: str


@dataclass
class ScheduleEntry:
    course: Course
    group: StudentGroup
    timeslot: TimeSlot


class Schedule:
    def __init__(self):
        self.entries: List[ScheduleEntry] = []
        self.teacher_schedule: Dict[int, List[TimeSlot]] = {}
        self.group_schedule: Dict[int, List[TimeSlot]] = {}

    def add_entry(self, entry: ScheduleEntry):
        teacher_id = entry.course.teacher.id
        group_id = entry.group.id
        timeslot = entry.timeslot

        if teacher_id in self.teacher_schedule:
            for ts in self.teacher_schedule[teacher_id]:
                if self.is_conflict(ts, timeslot):
                    print(
                        f"Конфликт у преподавателя {entry.course.teacher.name} в {timeslot.day} {timeslot.start_time}-{timeslot.end_time}")
                    return
        else:
            self.teacher_schedule[teacher_id] = []

        if group_id in self.group_schedule:
            for ts in self.group_schedule[group_id]:
                if self.is_conflict(ts, timeslot):
                    print(
                        f"Конфликт у группы {entry.group.name} в {timeslot.day} {timeslot.start_time}-{timeslot.end_time}")
                    return
        else:
            self.group_schedule[group_id] = []

        self.entries.append(entry)
        self.teacher_schedule[teacher_id].append(timeslot)
        self.group_schedule[group_id].append(timeslot)
        print(
            f"Занятие добавлено: {entry.course.name} с {entry.course.teacher.name} для группы {entry.group.name} в {timeslot.day} {timeslot.start_time}-{timeslot.end_time}")

    @staticmethod
    def is_conflict(ts1: TimeSlot, ts2: TimeSlot) -> bool:
        if ts1.day != ts2.day:
            return False

        latest_start = max(ts1.start_time, ts2.start_time)
        earliest_end = min(ts1.end_time, ts2.end_time)
        overlap = (earliest_end > latest_start)

        week_overlap = (
                ts1.week_parity == ts2.week_parity or
                ts1.week_parity == 'both' or
                ts2.week_parity == 'both'
        )

        return overlap and week_overlap


def main():
    teacher1 = Teacher(id=1, name='Иванов И.И.')
    teacher2 = Teacher(id=2, name='Петров П.П.')

    course1 = Course(id=1, name='Математика', teacher=teacher1)
    course2 = Course(id=2, name='Физика',
                     teacher=teacher1)

    group1 = StudentGroup(id=1, name='Группа А')
    group2 = StudentGroup(id=2, name='Группа Б')

    timeslot1 = TimeSlot(
        day='Понедельник',
        start_time=datetime.time(10, 0),
        end_time=datetime.time(12, 0),
        week_parity='both'
    )
    timeslot2 = TimeSlot(
        day='Понедельник',
        start_time=datetime.time(10, 1),
        end_time=datetime.time(12, 1),
        week_parity='even'
    )

    schedule = Schedule()

    entry1 = ScheduleEntry(course=course1, group=group1, timeslot=timeslot1)
    schedule.add_entry(entry1)

    entry2 = ScheduleEntry(course=course2, group=group2, timeslot=timeslot2)
    schedule.add_entry(entry2)


if __name__ == "__main__":
    main()
