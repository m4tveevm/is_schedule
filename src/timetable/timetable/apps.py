from django.apps import AppConfig

class ScheduleAppConfig(AppConfig):
    name = 'schedule_app'

    def ready(self):
        import src.timetable.schedule_app.signals
