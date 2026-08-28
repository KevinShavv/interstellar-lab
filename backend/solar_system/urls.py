from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from django.views.static import serve

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("simulation.urls")),
]

# In DEBUG mode, serve frontend static assets from the build directory.
# These directories (assets/, legacy/, course-materials/) sit at the root
# of the frontend build output and need to be reachable at top-level URLs.
if settings.DEBUG and settings.STATIC_DIR.exists():
    urlpatterns += [
        path("assets/<path:path>", serve, {"document_root": settings.STATIC_DIR / "assets"}),
        path("legacy/<path:path>", serve, {"document_root": settings.STATIC_DIR / "legacy"}),
        path("course-materials/<path:path>", serve, {"document_root": settings.STATIC_DIR / "course-materials"}),
    ]

# SPA fallback — must be the LAST pattern.
# Every unmatched request gets index.html so Vue Router can take over.
urlpatterns += [
    re_path(r"^(?!api/|admin/|static/).*$", TemplateView.as_view(template_name="index.html")),
]
