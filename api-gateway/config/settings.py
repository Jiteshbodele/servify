import environ
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env(DEBUG=(bool, False))
environ.Env.read_env(BASE_DIR / '.env')

SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')
ALLOWED_HOSTS = ['*']
CORS_ALLOW_ALL_ORIGINS = True

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'rest_framework',
    'corsheaders',
    'handler.apps.HandlerConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME', default='postgres'),
        'USER': env('DB_USER', default='postgres'),
        'PASSWORD': env('DB_PASSWORD', default='postgres'),
        'HOST': env('DB_HOST', default='localhost'),
        'PORT': env('DB_PORT', default='5432'),
    }
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.AllowAny',),
    'EXCEPTION_HANDLER': 'utils.exceptions.custom_exception_handler',
}

INTERNAL_SECRET = env('INTERNAL_SECRET', default='internal-secret')
JWT_SECRET = env('JWT_SECRET', default='jwt-secret')
JWT_ALGORITHM = 'HS256'
KAFKA_BOOTSTRAP_SERVERS = env('KAFKA_BOOTSTRAP_SERVERS', default='kafka:9092')

USE_TZ = True
TIME_ZONE = 'UTC'
LANGUAGE_CODE = 'en-us'

import environ
from pathlib import Path
_env = environ.Env()
_env.read_env(Path(__file__).resolve().parent.parent / '.env')
USER_SERVICE_URL         = _env('USER_SERVICE_URL',         default='http://user-service:8001')
CATALOG_SERVICE_URL      = _env('CATALOG_SERVICE_URL',      default='http://catalog-service:8002')
BOOKING_SERVICE_URL      = _env('BOOKING_SERVICE_URL',      default='http://booking-service:8003')
PAYMENT_SERVICE_URL      = _env('PAYMENT_SERVICE_URL',      default='http://payment-service:8004')
NOTIFICATION_SERVICE_URL = _env('NOTIFICATION_SERVICE_URL', default='http://notification-service:8005')
REVIEW_SERVICE_URL       = _env('REVIEW_SERVICE_URL',       default='http://review-service:8006')
SEARCH_SERVICE_URL       = _env('SEARCH_SERVICE_URL',       default='http://search-service:8007')
CALLING_SERVICE_URL      = _env('CALLING_SERVICE_URL',      default='http://calling-service:8008')


REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
    },
    'EXCEPTION_HANDLER': 'utils.exceptions.custom_exception_handler',
}

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = ['http://localhost:3000']

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '[%(asctime)s] %(levelname)s %(name)s: %(message)s',
            'datefmt': '%Y-%m-%d %H:%M:%S',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'standard',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}
