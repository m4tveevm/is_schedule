from django import forms
from .models import ScheduleEntry


# CRUD препод.
# CRUD группы
# - Cr группа -> расписание по датам

class ScheduleEntryForm(forms.ModelForm):
    class Meta:
        model = ScheduleEntry
        fields = ['course', 'groups', 'timeslot']
        widgets = {
            'course': forms.Select(attrs={'class': 'form-control'}),
            'groups': forms.SelectMultiple(attrs={'class': 'form-control'}),
            'timeslot': forms.Select(attrs={'class': 'form-control'}),
        }
        labels = {
            'course': 'Курс',
            'groups': 'Группы',
            'timeslot': 'Временной интервал',
        }
        help_texts = {
            'course': 'Выберите курс из списка.',
            'groups': 'Выберите одну или несколько групп.',
            'timeslot': 'Выберите временной интервал.',
        }

    def clean(self):
        cleaned_data = super().clean()
        course = cleaned_data.get('course')
        timeslot = cleaned_data.get('timeslot')
        groups = cleaned_data.get('groups')

        if not course or not timeslot or not groups:
            return

        teacher_conflicts = ScheduleEntry.objects.filter(
            course__teacher=course.teacher,
            timeslot__day=timeslot.day,
        ).exclude(id=self.instance.id)

        for entry in teacher_conflicts:
            if timeslot.overlaps(entry.timeslot):
                raise forms.ValidationError(
                    f"Обнаружен конфликт у преподавателя {course.teacher} с занятием '{entry.course}' в {entry.timeslot}"
                )

        for group in groups:
            group_conflicts = ScheduleEntry.objects.filter(
                groups=group,
                timeslot__day=timeslot.day,
            ).exclude(id=self.instance.id)

            for entry in group_conflicts:
                if timeslot.overlaps(entry.timeslot):
                    raise forms.ValidationError(
                        f"конфликт у группы {group} с занятием '{entry.course}' (преподаватель {entry.course.teacher}) в {entry.timeslot}"
                    )

        return cleaned_data
