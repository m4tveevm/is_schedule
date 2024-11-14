from datetime import datetime

from django.forms import formset_factory
from django.shortcuts import get_object_or_404, redirect, render
from django.core.exceptions import ValidationError

from .forms import (
    DateSelectionForm,
    TeacherAssignmentForm,
    ScheduleDateFormSet,
)
from .models import Group, Lecture, ScheduleDate, Teacher


def date_selection_view(request):
    if request.method == "POST":
        form = DateSelectionForm(request.POST)
        if form.is_valid():
            groups = form.cleaned_data["groups"]
            dates_str = form.cleaned_data["dates"]
            date_list = [
                date.strip() for date in dates_str.split(",") if date.strip()
            ]
            dates = [
                datetime.strptime(date_str, "%Y-%m-%d").date()
                for date_str in date_list
            ]
            # Сохраняем выбранные группы и даты в сессии
            request.session["selected_groups"] = [group.id for group in groups]
            request.session["selected_dates"] = [
                date.isoformat() for date in dates
            ]
            return redirect("assign_teachers")
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
    selected_group_ids = request.session.get("selected_groups", [])
    selected_dates = request.session.get("selected_dates", [])
    if not selected_group_ids or not selected_dates:
        return redirect("date_selection")

    groups = Group.objects.filter(id__in=selected_group_ids)
    dates = [
        datetime.strptime(date_str, "%Y-%m-%d").date()
        for date_str in selected_dates
    ]

    # Определяем форму для каждой даты
    TeacherAssignmentFormSet = formset_factory(TeacherAssignmentForm, extra=0)

    if request.method == "POST":
        formset = TeacherAssignmentFormSet(request.POST)
        has_errors = False
        if formset.is_valid():
            # Обработка каждой формы
            for form in formset:
                if form.cleaned_data.get("DELETE"):
                    continue  # Пропускаем удаленные карточки
                date = form.cleaned_data["date"]
                morning_teacher = form.cleaned_data.get("morning_teacher")
                evening_teacher = form.cleaned_data.get("evening_teacher")

                schedule_date, created = ScheduleDate.objects.get_or_create(
                    date=date
                )

                # Создаем лекции для утреннего и вечернего времени, если преподаватели назначены
                if morning_teacher:
                    lecture = Lecture(
                        schedule_date=schedule_date,
                        time_slot="morning",
                        teacher=morning_teacher,
                    )
                    try:
                        lecture.full_clean()
                        lecture.save()
                        lecture.groups.set(groups)
                    except ValidationError as e:
                        error_message = e.message_dict['teacher']
                        form.add_error('morning_teacher', error_message)
                        has_errors = True
                if evening_teacher:
                    lecture = Lecture(
                        schedule_date=schedule_date,
                        time_slot="evening",
                        teacher=evening_teacher,
                    )
                    try:
                        lecture.full_clean()
                        lecture.save()
                        lecture.groups.set(groups)
                    except ValidationError as e:
                        error_message = e.message_dict['teacher']
                        form.add_error('evening_teacher', error_message)
                        has_errors = True
            if has_errors:
                date_form_pairs = zip(dates, formset.forms)
                return render(
                    request,
                    "schedule_app/assign_teachers.html",
                    {
                        "date_form_pairs": date_form_pairs,
                        "formset": formset,
                    },
                )
            else:
                return redirect("schedule_success")
        else:
            date_form_pairs = zip(dates, formset.forms)
            return render(request, "schedule_app/assign_teachers.html",
                          {"date_form_pairs": date_form_pairs,
                           "formset": formset, }, )
    initial_data = []
    for date in dates:
        initial_data.append({"date": date})
    formset = TeacherAssignmentFormSet(initial=initial_data)

    date_form_pairs = zip(dates, formset.forms)
    return render(
        request,
        "schedule_app/assign_teachers.html",
        {
            "date_form_pairs": date_form_pairs,
            "formset": formset,
        },
    )


def schedule_view(request):
    lectures = Lecture.objects.all().order_by(
        "time_slot__" "schedule_date__date", "time_slot__slot_number"
    )
    return render(
        request, "schedule_app/schedule.html", {"lectures": lectures}
    )


def group_schedule_view(request):
    all_groups = Group.objects.all()
    if not all_groups:
        return render(request, "schedule_app/no_groups.html")

    group_id = request.GET.get('group_id')
    if group_id:
        group = get_object_or_404(Group, id=group_id)
    else:
        group = Group.objects.first()  # По умолчанию первая группа

    lectures = Lecture.objects.filter(groups=group).order_by(
        "schedule_date__date", "time_slot"
    )

    all_groups = Group.objects.all()

    return render(
        request,
        "schedule_app/group_schedule.html",
        {
            "group": group,
            "lectures": lectures,
            "all_groups": all_groups,
        },
    )


def teacher_schedule_view(request):
    all_teachers = Teacher.objects.all()
    if not all_teachers:
        return render(request, "schedule_app/no_teachers.html")

    teacher_id = request.GET.get('teacher_id')
    if teacher_id:
        teacher = get_object_or_404(Teacher, id=teacher_id)
    else:
        teacher = all_teachers.first()

    lectures = Lecture.objects.filter(teacher=teacher).order_by(
        "schedule_date__date", "time_slot"
    )

    return render(
        request,
        "schedule_app/teacher_schedule.html",
        {
            "teacher": teacher,
            "lectures": lectures,
            "all_teachers": all_teachers,
        },
    )


def schedule_success_view(request):
    return render(request, "schedule_app/schedule_success.html")
