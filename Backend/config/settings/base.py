import os
from pathlib import Path
import environ
from datetime import timedelta

env = environ.Env(DEBUG=(bool, False))

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = os.getenv("ENV_FILE", BASE_DIR / ".env.backend")
env.read_env(str(ENV_FILE))


SECRET_KEY = env("DJANGO_SECRET_KEY")
DEBUG = env.bool("DJANGO_DEBUG", default=False)
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=[])

AUTH_USER_MODEL = 'base.CustomUser'

INSTALLED_APPS = [
    'base',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'django_filters',
    'drf_spectacular',
    'drf_spectacular_sidecar',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'myproj.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'myproj.wsgi.application'

DATABASES = {
    'default': env.db(),
}

AUTH_PASSWORD_VALIDATORS = [
    { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator' },
    { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator' },
    { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator' },
    { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator' },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=25),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=90),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
}

# ---- Redis URL per environment ----
# Local docker:  redis://redis:6379/0
# Prod TLS:      rediss://<host>:<port>/<db>   (note the double 's')
REDIS_CACHE_URL = env("REDIS_CACHE_URL", default="redis://redis:6379/0")
REDIS_RATE_LIMIT_URL  = env("REDIS_RATE_LIMIT_URL",  default="redis://redis:6379/1")  # (optional) ratelimit
REDIS_TASK_URL  = env("REDIS_TASK_URL",  default="redis://redis:6379/2")  # (optional) Celery/RQ

# A short, environment-specific prefix to isolate keys across envs
# e.g., "fm:dev", "fm:stg", "fm:prod"
CACHE_KEY_PREFIX = env("CACHE_KEY_PREFIX", default="fm:dev")

# Central TTL policy (endpoints choose from here)
CACHE_TTL = {
    "CATEGORY_LIST": 300,  # 5m
    "ITEM_DETAIL": 60,     # 1m
}

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_CACHE_URL,
        "TIMEOUT": None,  # IMPORTANT: do per-key TTL in code
        "KEY_PREFIX": CACHE_KEY_PREFIX,
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            # Don’t take down the site if Redis hiccups (serve uncached)
            "IGNORE_EXCEPTIONS": True,
            # Be responsive under network issues
            "SOCKET_TIMEOUT": 1.0,     # seconds
            "SOCKET_CONNECT_TIMEOUT": 1.0,
            # Small but safe pool; adjust if you see pool exhaustion
            "CONNECTION_POOL_KWARGS": {"max_connections": 50, "retry_on_timeout": True},
            # Optional lightweight compression for bigger payloads
            # "COMPRESSOR": "django_redis.compressors.zlib.ZlibCompressor",
        },
    },

    # Secondary cache alias for rate limiting
    "ratelimit": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_RATE_LIMIT_URL,
        "TIMEOUT": None,
        "KEY_PREFIX": f"{CACHE_KEY_PREFIX}:rl",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "IGNORE_EXCEPTIONS": True,
            "SOCKET_TIMEOUT": 1.0,
            "SOCKET_CONNECT_TIMEOUT": 1.0,
            "CONNECTION_POOL_KWARGS": {"max_connections": 20, "retry_on_timeout": True},
        },
    },
}

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'FreeMarket API',
    'DESCRIPTION': 'API documentation for the FreeMarket project.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SECURITY': [{'BearerAuth': []}],
    'COMPONENTS': {
        'securitySchemes': {
            'BearerAuth': {
                'type': 'http',
                'scheme': 'bearer',
                'bearerFormat': 'JWT',
            }
        }
    }
}
