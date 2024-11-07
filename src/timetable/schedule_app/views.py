from datetime import datetime

from django.forms import formset_factory
from django.shortcuts import get_object_or_404, redirect, render

from .forms import (
    DateSelectionForm,
    LectureAssignmentForm,
    ScheduleDateFormSet,
)
from .models import Group, Lecture, ScheduleDate, Teacher, TimeSlot


def date_selection_view(request):
    if request.method == "POST":
        form = DateSelectionForm(request.POST)
        if form.is_valid():
            groups = form.cleaned_data["groups"]
            dates_str = form.cleaned_data["dates"]
            dates = dates_str.split(",")
            schedule_dates = []
            for date_str in dates:
                date = datetime.strptime(
                    date_str.strip(), "" "%Y-%m-%d"
                ).date()
                schedule_date, created = ScheduleDate.objects.get_or_create(
                    date=date
                )
                schedule_dates.append(schedule_date)
            request.session["selected_groups"] = [group.id for group in groups]
            request.session["schedule_date_ids"] = [
                sd.id for sd in schedule_dates
            ]
            return redirect("adjust_lectures")
    else:
        form = DateSelectionForm()
    return render(request, "schedule_app/date_selection.html", {"form": form})


def adjust_lectures_view(request):
    schedule_date_ids = request.session.get("schedule_date_ids", [])
    if not schedule_date_ids:
        return redirect("date_selection")
    schedule_dates = ScheduleDate.objects.filter(id__in=schedule_date_ids)
    if request.method == "POST":
        formset = ScheduleDateFormSet(request.POST, queryset=schedule_dates)
        if formset.is_valid():
            formset.save()
            return redirect("assign_teachers")
        else:
            print(formset.errors)
    else:
        formset = ScheduleDateFormSet(queryset=schedule_dates)
    return render(
        request, "schedule_app/adjust_lectures.html", {"formset": formset}
    )


def assign_teachers_view(request):
    schedule_date_ids = request.session.get("schedule_date_ids", [])
    selected_group_ids = request.session.get("selected_groups", [])
    if not schedule_date_ids or not selected_group_ids:
        return redirect("date_selection")
    schedule_dates = ScheduleDate.objects.filter(id__in=schedule_date_ids)
    time_slots = TimeSlot.objects.filter(
        schedule_date__in=schedule_dates
    ).order_by("schedule_date__date", "slot_number")

    LectureFormSet = formset_factory(LectureAssignmentForm, extra=0)

    if request.method == "POST":
        formset = LectureFormSet(request.POST)
        if formset.is_valid():
            for form in formset:
                if not form.cleaned_data:
                    continue
                time_slot_id = form.cleaned_data["time_slot"]
                teacher = form.cleaned_data["teacher"]
                groups = form.cleaned_data["groups"]
                lecture = Lecture(
                    time_slot=TimeSlot.objects.get(id=int(time_slot_id)),
                    teacher=teacher,
                )
                lecture.save()
                lecture.groups.set(groups)
            return redirect("schedule_success")
        else:
            raise Exception(formset.errors)
    else:
        # Инициализация форм
        initial_data = []
        for time_slot in time_slots:
            initial_data.append(
                {
                    "time_slot": time_slot.id,
                    "groups": selected_group_ids,
                }
            )
        print(initial_data)
        formset = LectureFormSet(initial=initial_data)

    form_time_slot_pairs = zip(formset.forms, time_slots)
    return render(
        request,
        "schedule_app/assign_teachers.html",
        {
            "formset": formset,
            "form_time_slot_pairs": form_time_slot_pairs,
        },
    )


def schedule_view(request):
    lectures = Lecture.objects.all().order_by(
        "time_slot__" "schedule_date__date", "time_slot__slot_number"
    )
    return render(
        request, "schedule_app/schedule.html", {"lectures": lectures}
    )


def group_schedule_view(request, group_id):
    group = get_object_or_404(Group, id=group_id)
    lectures = Lecture.objects.filter(groups=group).order_by(
        "time_slot__schedule_date__date", "time_slot__slot_number"
    )
    return render(
        request,
        "schedule_app/group_schedule.html",
        {"group": group, "lectures": lectures},
    )


def teacher_schedule_view(request, teacher_id):
    teacher = get_object_or_404(Teacher, id=teacher_id)
    lectures = Lecture.objects.filter(teacher=teacher).order_by(
        "time_slot__schedule_date__date", "time_slot__slot_number"
    )
    return render(
        request,
        "schedule_app/teacher_schedule.html",
        {"teacher": teacher, "lectures": lectures},
    )


def schedule_success_view(request):
    return render(request, "schedule_app/schedule_success.html")
