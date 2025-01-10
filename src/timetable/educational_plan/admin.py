from django.contrib import admin

from .models import EducationalPlan, EducationalPlanEntry


class EducationalPlanEntryInline(admin.TabularInline):
    model = EducationalPlanEntry
    extra = 1


class EducationalPlanAdmin(admin.ModelAdmin):
    inlines = [EducationalPlanEntryInline]


admin.site.register(EducationalPlan, EducationalPlanAdmin)
