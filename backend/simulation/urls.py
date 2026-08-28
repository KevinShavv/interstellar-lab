from django.urls import path

from .views import (
    ApiRootView,
    ChatProxyView,
    HealthCheckView,
    HorizonsProxyView,
    ModuleCatalogView,
    PlanetCatalogView,
    SceneCatalogView,
    SceneDetailView,
    SceneRuntimeConfigView,
    SkyfieldPositionView,
    SolarSystemConfigView,
)

urlpatterns = [
    path("", ApiRootView.as_view(), name="api-root"),
    path("health/", HealthCheckView.as_view(), name="api-health"),
    path("chat/", ChatProxyView.as_view(), name="api-chat"),
    path("modules/", ModuleCatalogView.as_view(), name="api-modules"),
    path("scenes/", SceneCatalogView.as_view(), name="api-scenes"),
    path("scenes/<slug:scene_slug>/runtime/", SceneRuntimeConfigView.as_view(), name="api-scene-runtime"),
    path("scenes/<slug:scene_slug>/", SceneDetailView.as_view(), name="api-scene-detail"),
    path("planets/", PlanetCatalogView.as_view(), name="api-planets"),
    path("solar-system/config/", SolarSystemConfigView.as_view(), name="api-solar-system-config"),
    path("horizons/", HorizonsProxyView.as_view(), name="api-horizons"),
    path("skyfield/", SkyfieldPositionView.as_view(), name="api-skyfield"),
]