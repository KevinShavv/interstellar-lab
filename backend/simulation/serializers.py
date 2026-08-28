try:
    from rest_framework import serializers
except ImportError:
    serializers = None


class _FallbackSerializer:
    def __init__(self, instance, many=False):
        self.instance = instance
        self.many = many

    @property
    def data(self):
        return self.instance


if serializers:
    class ModuleSerializer(serializers.Serializer):
        slug = serializers.CharField()
        title = serializers.CharField()
        summary = serializers.CharField()
        description = serializers.CharField()
        route = serializers.CharField()
        preview_image = serializers.CharField()
        accent = serializers.CharField()


    class SceneSerializer(serializers.Serializer):
        slug = serializers.CharField()
        title = serializers.CharField()
        route = serializers.CharField()
        legacy_path = serializers.CharField()
        kind = serializers.CharField()


    class PlanetSerializer(serializers.Serializer):
        key = serializers.CharField()
        name = serializers.CharField()
        radius_km = serializers.FloatField()
        distance_million_km = serializers.FloatField(required=False)
        eccentricity = serializers.FloatField(required=False)
        model = serializers.CharField()
        nasa_url = serializers.CharField()
        description = serializers.CharField()


    class PlanetConfigSerializer(serializers.Serializer):
        key = serializers.CharField()
        name = serializers.CharField()
        distance = serializers.FloatField()
        size = serializers.FloatField()
        speed = serializers.FloatField()
        rotation_speed = serializers.FloatField()
        eccentricity = serializers.FloatField(required=False)
        color = serializers.CharField()
        orbit_color = serializers.CharField(required=False)
        model = serializers.CharField()
        parent = serializers.CharField(required=False)


    class SolarSystemConfigSerializer(serializers.Serializer):
        size_scale = serializers.FloatField()
        distance_scale = serializers.FloatField()
        distance_gap_scale = serializers.FloatField()
        planets = PlanetConfigSerializer(many=True)

else:
    class ModuleSerializer(_FallbackSerializer):
        pass


    class SceneSerializer(_FallbackSerializer):
        pass


    class PlanetSerializer(_FallbackSerializer):
        pass


    class SolarSystemConfigSerializer(_FallbackSerializer):
        pass
