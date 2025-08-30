from ninja import NinjaAPI
from ninja_jwt.authentication import JWTAuth
from accounts.api.exception_handlers import install_http_error_handler

from brigade_assignment.api.router import router as brigade_router
from educational_plan.api.router import router as eplan_router
from group_educational_plan.api.router import router as gep_router
from groups.api.router import router as groups_router
from subject.api.router import router as subject_router
from teacher.api.router import router as teacher_router
from teacher_profile.api.router import router as tprofile_router

from accounts.api.router import account_router
from accounts.api.router_auth import auth_router
from accounts.api.router_headless import headless_router
from accounts.api.router_oauth import router_oauth

api = NinjaAPI(title="Timetable API (Ninja)")
install_http_error_handler(api)

auth = JWTAuth()

api.add_router("/teachers/", teacher_router, auth=auth)
api.add_router("/brigade_assignments", brigade_router, auth=auth)
api.add_router("/educational_plans", eplan_router, auth=auth)
api.add_router("/group_educational_plans", gep_router, auth=auth)
api.add_router("/groups", groups_router, auth=auth)
api.add_router("/subjects", subject_router, auth=auth)
api.add_router("/teacher_profiles", tprofile_router, auth=auth)


api.add_router("/account", account_router)
api.add_router("/auth", auth_router)
api.add_router("/headless", headless_router)
api.add_router("/oauth", router_oauth)
