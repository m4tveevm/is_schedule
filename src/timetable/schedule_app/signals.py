from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ScheduleDate, TimeSlot
from .utils import generate_time_slots

@receiver(post_save, sender=ScheduleDate)
def create_time_slots(sender, instance, **kwargs):
    # Удаляем существующие временные слоты
    instance.time_slots.all().delete()
    # Генерируем новые временные слоты
    slots = generate_time_slots(instance)
    for slot in slots:
        TimeSlot.objects.create(
            schedule_date=instance,
            slot_number=slot['slot_number'],
            start_time=slot['start_time'],
            end_time=slot['end_time'],
        )
