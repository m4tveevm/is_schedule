import os
from pathlib import Path

from corsheaders.defaults import default_headers
from decouple import Csv, config, strtobool

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config("DJANGO_SECRET", default="fallback_secret_key")

DEBUG = config(
    "DEBUG", default="False", cast=lambda v: bool(strtobool(v or "False"))
)

ALLOWED_HOSTS = config("DJANGO_ALLOWED_HOSTS", default="*", cast=Csv())

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
    # --- Third‑party
    "corsheaders",
    # --- Allauth (сессии + headless)
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.usersessions",
    "allauth.headless",
    "allauth.mfa",
    # --- Ninja JWT (+ blacklist)
    "ninja_jwt",
    "ninja_jwt.token_blacklist",
    #
    "core.apps.CoreConfig",
    "brigade_assignment.apps.BrigadeAssignmentConfig",
    "educational_plan.apps.EducationalPlanConfig",
    "group_educational_plan.apps.GroupEducationalPlanConfig",
    "groups.apps.GroupsConfig",
    "subject.apps.SubjectConfig",
    "teacher.apps.TeacherConfig",
    "teacher_profile.apps.TeacherProfileConfig",
]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    "allauth.usersessions.middleware.UserSessionsMiddleware",
]

ROOT_URLCONF = "timetable.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "timetable.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "dev.sqlite3",
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation."
        "UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOWED_ORIGIN_REGEXES = config(
    "CORS_ALLOWED_ORIGIN_REGEXES",
    default=r"^https:\/\/(?:.*\.)?updspace\.com$",
    cast=lambda v: [v],
)

CORS_ALLOW_HEADERS = list(default_headers) + ["sentry-trace", "baggage"]
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS", default="http://localhost:3000", cast=Csv()
)


if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{asctime}] {levelname} [{name}] {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {"handlers": ["console"], "level": "INFO"},
}

SITE_ID = 1

AUTHENTICATION_BACKENDS = (
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
)


ACCOUNT_EMAIL_VERIFICATION = "optional"
ACCOUNT_SIGNUP_FIELDS = ["email", "username*", "password1*", "password2*"]
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_LOGIN_METHODS = {"username"}
HEADLESS_TOKEN_STRATEGY = (
    "allauth.headless.tokens.sessions.SessionTokenStrategy"
)
SOCIALACCOUNT_LOGIN_ON_GET = False

NINJA_JWT = {
    "BLACKLIST_AFTER_ROTATION": True,
}
