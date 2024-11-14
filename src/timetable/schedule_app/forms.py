from datetime import timedelta

from django import forms
from django.forms import modelformset_factory
from django.utils import timezone

from .models import Group, ScheduleDate, Teacher, Lecture


# CRUD препод.
# CRUD группы
# - Cr группа -> расписание по датам


class DateSelectionForm(forms.Form):
    groups = forms.ModelMultipleChoiceField(
        queryset=Group.objects.all(),
        widget=forms.CheckboxSelectMultiple,
        label="Выберите группы",
    )
    dates = forms.CharField(
        widget=forms.TextInput(attrs={"id": "date-picker"}),
        label="Выберите даты",
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        today = timezone.now().date()
        end_date = today + timedelta(days=270)
        date_list = [
            today + timedelta(days=x)
            for x in range((end_date - today).days + 1)
        ]
        self.fields["dates"].choices = [
            (date.isoformat(), date.strftime("%d.%m.%Y (%A)"))
            for date in date_list
        ]


class ScheduleDateForm(forms.ModelForm):
    class Meta:
        model = ScheduleDate
        fields = ["id", "date"]  # Удалили "number_of_lectures"
        widgets = {
            "id": forms.HiddenInput(),
            "date": forms.HiddenInput(),
        }


ScheduleDateFormSet = modelformset_factory(
    ScheduleDate, form=ScheduleDateForm, extra=0
)


class TeacherAssignmentForm(forms.Form):
    date = forms.DateField(widget=forms.HiddenInput())
    time_slot = forms.ChoiceField(
        choices=Lecture.TIME_SLOT_CHOICES,
        label="Время проведения (Утро/Вечер)",
        widget=forms.RadioSelect()
    )
    brigade_1_teacher = forms.ModelChoiceField(
        queryset=Teacher.objects.all(),
        required=False,
        label="Преподаватель для бригады 1",
    )
    brigade_2_teacher = forms.ModelChoiceField(
        queryset=Teacher.objects.all(),
        required=False,
        label="Преподаватель для бригады 2",
    )
    brigade_3_teacher = forms.ModelChoiceField(
        queryset=Teacher.objects.all(),
        required=False,
        label="Преподаватель для бригады 3",
    )
    DELETE = forms.BooleanField(
        required=False, initial=False, widget=forms.HiddenInput()
    )


class GroupForm(forms.ModelForm):
    class Meta:
        model = Group
        fields = ['name']
        labels = {
            'name': 'Название группы',
        }


class TeacherForm(forms.ModelForm):
    class Meta:
        model = Teacher
        fields = ['name']
        labels = {
            'name': 'Имя преподавателя',
        }
