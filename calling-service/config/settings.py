import environ
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env(DEBUG=(bool, False))
environ.Env.read_env(BASE_DIR / '.env')

SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'rest_framework',
    'corsheaders',
    'dao.apps.DaoConfig',
    'handler.apps.HandlerConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [],
    'APP_DIRS': True,
    'OPTIONS': {'context_processors': [
        'django.template.context_processors.request',
        'django.contrib.auth.context_processors.auth',
        'django.contrib.messages.context_processors.messages',
    ]},
}]

ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = ['http://localhost:3000']

DATABASES = {
    'default': {
        'ENGINE':   'django.db.backends.postgresql',
        'NAME':     env('DB_NAME'),
        'USER':     env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST':     env('DB_HOST'),
        'PORT':     env('DB_PORT', default='5432'),
    }
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'EXCEPTION_HANDLER': 'utils.exceptions.custom_exception_handler',
}

# Exotel credentials — set these in .env
EXOTEL_SID            = env('EXOTEL_SID',            default='')
EXOTEL_API_KEY        = env('EXOTEL_API_KEY',        default='')
EXOTEL_API_TOKEN      = env('EXOTEL_API_TOKEN',      default='')
EXOTEL_VIRTUAL_NUMBER = env('EXOTEL_VIRTUAL_NUMBER', default='')
EXOTEL_CALLBACK_URL   = env('EXOTEL_CALLBACK_URL',   default='')

JWT_SECRET    = env('JWT_SECRET',    default='your-super-secret-jwt-key')
JWT_ALGORITHM = 'HS256'
INTERNAL_SECRET    = env('INTERNAL_SECRET')
USER_SERVICE_URL   = env('USER_SERVICE_URL',   default='http://user-service:8001')
BOOKING_SERVICE_URL = env('BOOKING_SERVICE_URL', default='http://booking-service:8003')

USE_TZ = True
TIME_ZONE = 'UTC'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {'standard': {
        'format': '[%(asctime)s] %(levelname)s %(name)s: %(message)s',
        'datefmt': '%Y-%m-%d %H:%M:%S',
    }},
    'handlers': {'console': {'class': 'logging.StreamHandler', 'formatter': 'standard'}},
    'root': {'handlers': ['console'], 'level': 'INFO'},
}

# Set MOCK_CALLING=True in .env for development (no Exotel needed)
# Set MOCK_CALLING=False in production and fill in Exotel credentials
MOCK_CALLING         = env.bool('MOCK_CALLING', default=True)
MOCK_VIRTUAL_NUMBER  = env('MOCK_VIRTUAL_NUMBER', default='+91-SERVICE-BOOKING')
