from datetime import datetime, timedelta


def generate_time_slots(schedule_date):
    number_of_lectures = schedule_date.number_of_lectures
    start_time = datetime.strptime("10:00", "%H:%M")
    end_time = datetime.strptime("16:00", "%H:%M")

    total_minutes = (end_time - start_time).seconds // 60
    lecture_duration = total_minutes // number_of_lectures

    time_slots = []
    current_time = start_time

    for slot_number in range(1, number_of_lectures + 1):
        slot_start = current_time
        slot_end = slot_start + timedelta(minutes=lecture_duration)
        time_slots.append(
            {
                "slot_number": slot_number,
                "start_time": slot_start.time(),
                "end_time": slot_end.time(),
            }
        )
        current_time = slot_end

    return time_slots
