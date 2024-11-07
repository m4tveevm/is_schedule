from datetime import timedelta

from django import forms
from django.forms import modelformset_factory
from django.utils import timezone

from .models import Group, ScheduleDate, Teacher, TimeSlot


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
        fields = ["id", "date", "number_of_lectures"]
        widgets = {
            "id": forms.HiddenInput(),
            "date": forms.HiddenInput(),
            "number_of_lectures": forms.NumberInput(
                attrs={"min": 1, "max": 5}
            ),
        }


ScheduleDateFormSet = modelformset_factory(
    ScheduleDate, form=ScheduleDateForm, extra=0
)


class LectureAssignmentForm(forms.Form):
    time_slot = forms.CharField(widget=forms.HiddenInput())
    teacher = forms.ModelChoiceField(
        queryset=Teacher.objects.all(), widget=forms.Select()
    )
    groups = forms.ModelMultipleChoiceField(
        queryset=Group.objects.all(), widget=forms.CheckboxSelectMultiple()
    )

    def clean_time_slot(self):
        time_slot_id = self.cleaned_data.get("time_slot")
        try:
            TimeSlot.objects.get(id=int(time_slot_id))
        except (ValueError, TypeError, TimeSlot.DoesNotExist):
            raise forms.ValidationError("Invalid time slot.")
        return time_slot_id
