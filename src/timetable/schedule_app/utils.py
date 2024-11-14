from datetime import datetime, timedelta


def generate_time_slots(schedule_date):
    time_slots = [
        {
            "slot_number": 1,
            "start_time": datetime.strptime("09:30", "%H:%M").time(),
            "end_time": datetime.strptime("12:30", "%H:%M").time(),
        },
        {
            "slot_number": 2,
            "start_time": datetime.strptime("13:30", "%H:%M").time(),
            "end_time": datetime.strptime("16:30", "%H:%M").time(),
        },
    ]
    return time_slots
