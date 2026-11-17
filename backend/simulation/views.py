import json
import os
import re
from datetime import datetime, timedelta
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from django.http import Http404, JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from .serializers import (
    ModuleSerializer,
    PlanetSerializer,
    SceneSerializer,
    SolarSystemConfigSerializer,
)
from .services.data_loader import get_module_catalog, get_planet_catalog, get_scene_catalog
from .services.rag_knowledge import build_rag_system_prompt
from .services.runtime_config import get_scene_runtime_config
from .services.solar_calculator import build_solar_system_config

DEEPSEEK_DEFAULT_URL = "https://api.deepseek.com/chat/completions"
DEEPSEEK_DEFAULT_MODEL = "deepseek-chat"
ZHIPU_DEFAULT_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
ZHIPU_DEFAULT_MODEL = "glm-4-flash"

try:
    from rest_framework.response import Response as DrfResponse
    from rest_framework.views import APIView

    def api_response(data, status=200):
        return DrfResponse(data, status=status)

except ImportError:
    class APIView(View):
        """Fallback shim when Django REST Framework is not installed."""

    def api_response(data, status=200):
        return JsonResponse(data, status=status, safe=not isinstance(data, list))


API_ENDPOINTS = {
    "health": "/api/health/",
    "modules": "/api/modules/",
    "scenes": "/api/scenes/",
    "scene_runtime": "/api/scenes/<slug>/runtime/",
    "planets": "/api/planets/",
    "solar_system_config": "/api/solar-system/config/",
    "chat": "/api/chat/",
}


def _serialize_many(serializer_class, payload):
    return serializer_class(payload, many=True).data


def _get_scene_or_404(scene_slug):
    scene = next((item for item in get_scene_catalog() if item["slug"] == scene_slug), None)
    if scene is None:
        raise Http404("Scene not found.")
    return scene


def _chat_config():
    deepseek_key = getattr(settings, "DEEPSEEK_API_KEY", None) or os.getenv("DEEPSEEK_API_KEY")
    deepseek_url = getattr(settings, "DEEPSEEK_API_URL", None) or os.getenv("DEEPSEEK_API_URL") or DEEPSEEK_DEFAULT_URL
    deepseek_model = getattr(settings, "DEEPSEEK_MODEL", None) or os.getenv("DEEPSEEK_MODEL") or DEEPSEEK_DEFAULT_MODEL

    zhipu_key = os.getenv("ZHIPU_API_KEY")
    generic_key = os.getenv("CHAT_API_KEY")
    generic_url = os.getenv("CHAT_API_URL")
    generic_model = os.getenv("CHAT_MODEL")

    if deepseek_key:
        return {
            "provider": "deepseek",
            "api_key": deepseek_key,
            "api_url": deepseek_url,
            "model": deepseek_model,
        }

    if zhipu_key:
        return {
            "provider": "zhipu",
            "api_key": zhipu_key,
            "api_url": os.getenv("ZHIPU_API_URL", generic_url or ZHIPU_DEFAULT_URL),
            "model": os.getenv("ZHIPU_MODEL", generic_model or ZHIPU_DEFAULT_MODEL),
        }

    if generic_key and generic_url:
        return {
            "provider": "custom",
            "api_key": generic_key,
            "api_url": generic_url,
            "model": generic_model or DEEPSEEK_DEFAULT_MODEL,
        }

    raise RuntimeError(
        "Chat API 未配置。请在服务端设置 DEEPSEEK_API_KEY、ZHIPU_API_KEY，或同时设置 CHAT_API_KEY 和 CHAT_API_URL。"
    )


def _read_json_request(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError as exc:
        raise ValueError("请求体不是有效 JSON。") from exc


def _proxy_chat_request(messages, model=None):
    config = _chat_config()
    payload = {
        "model": model or config["model"],
        "messages": messages,
    }
    upstream_request = Request(
        config["api_url"],
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {config['api_key']}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(upstream_request, timeout=60) as response:
            raw = response.read().decode("utf-8")
            data = json.loads(raw or "{}")
            return data, getattr(response, "status", 200)
    except HTTPError as exc:
        raw = exc.read().decode("utf-8", "replace")
        try:
            data = json.loads(raw or "{}")
        except json.JSONDecodeError:
            data = {}

        message = None
        error_block = data.get("error")
        if isinstance(error_block, dict):
            message = error_block.get("message")
        if not message:
            message = data.get("message") or raw or f"上游接口返回 HTTP {exc.code}。"

        return {
            "error": {
                "message": message,
                "provider": config["provider"],
            }
        }, exc.code
    except URLError as exc:
        reason = getattr(exc, "reason", exc)
        return {
            "error": {
                "message": f"无法连接到 {config['provider']} 接口：{reason}",
                "provider": config["provider"],
            }
        }, 502


class ApiRootView(APIView):
    def get(self, request):
        return api_response(
            {
                "name": "solar-system-api",
                "status": "ok",
                "endpoints": API_ENDPOINTS,
            }
        )


class HealthCheckView(APIView):
    def get(self, request):
        return api_response({"status": "ok"})


class ModuleCatalogView(APIView):
    def get(self, request):
        return api_response(_serialize_many(ModuleSerializer, get_module_catalog()))


class SceneCatalogView(APIView):
    def get(self, request):
        return api_response(_serialize_many(SceneSerializer, get_scene_catalog()))


class SceneDetailView(APIView):
    def get(self, request, scene_slug):
        serializer = SceneSerializer(_get_scene_or_404(scene_slug))
        return api_response(serializer.data)


class SceneRuntimeConfigView(APIView):
    def get(self, request, scene_slug):
        try:
            return api_response(get_scene_runtime_config(scene_slug))
        except KeyError as exc:
            raise Http404(str(exc)) from exc


class PlanetCatalogView(APIView):
    def get(self, request):
        return api_response(_serialize_many(PlanetSerializer, get_planet_catalog()))


class SolarSystemConfigView(APIView):
    def get(self, request):
        serializer = SolarSystemConfigSerializer(build_solar_system_config())
        return api_response(serializer.data)


@method_decorator(csrf_exempt, name="dispatch")
class ChatProxyView(APIView):
    def post(self, request):
        try:
            payload = _read_json_request(request)
        except ValueError as exc:
            return api_response({"error": {"message": str(exc)}}, status=400)

        messages = payload.get("messages")
        if not isinstance(messages, list) or not messages:
            return api_response({"error": {"message": "messages 字段不能为空。"}}, status=400)

        # ── RAG 检索增强：提取用户最后一条消息，检索课程知识 ──
        user_text = ""
        for m in reversed(messages):
            if isinstance(m, dict) and m.get("role") == "user":
                user_text = str(m.get("content", ""))
                break

        rag_prompt = build_rag_system_prompt(user_text)

        # 在 messages 最前面插入 system prompt
        rag_messages = [{"role": "system", "content": rag_prompt}] + list(messages)

        try:
            data, status_code = _proxy_chat_request(rag_messages, payload.get("model"))
        except RuntimeError as exc:
            return api_response({"error": {"message": str(exc)}}, status=500)

        return api_response(data, status=status_code)


# ── NASA Horizons API 代理 ──────────────────────────────────────────────

HORIZONS_API_URL = "https://ssd.jpl.nasa.gov/api/horizons.api"

# 常见天体命令码
HORIZONS_BODY_MAP = {
    "mercury": "199",
    "venus": "299",
    "earth": "399",
    "mars": "499",
    "jupiter": "599",
    "saturn": "699",
    "uranus": "799",
    "neptune": "899",
    "moon": "301",
    "sun": "10",
}

# 简易内存缓存（key -> (data, expiry)）
_horizons_cache = {}


def _parse_horizons_csv(text):
    """解析 Horizons 返回的 CSV 数据，提取位置/速度向量。"""
    result = {"positions": [], "labels": []}

    # 查找 $$SOE 标记后的数据行
    soe_match = re.search(r'\$\$SOE\s*\n(.*?)\n\$\$EOE', text, re.DOTALL)
    if not soe_match:
        return result

    lines = soe_match.group(1).strip().split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            continue
        parts = [p.strip() for p in line.split(',')]
        if len(parts) >= 4:
            try:
                result["positions"].append({
                    "jd": float(parts[0]),
                    "date": parts[1] if len(parts) > 1 else "",
                    "x": float(parts[2]) if len(parts) > 2 else 0,
                    "y": float(parts[3]) if len(parts) > 3 else 0,
                    "z": float(parts[4]) if len(parts) > 4 else 0,
                    "vx": float(parts[5]) if len(parts) > 5 else 0,
                    "vy": float(parts[6]) if len(parts) > 6 else 0,
                    "vz": float(parts[7]) if len(parts) > 7 else 0,
                })
            except (ValueError, IndexError):
                continue

    return result


class HorizonsProxyView(APIView):
    """代理 NASA Horizons API，返回解析后的天体位置数据。"""

    def get(self, request):
        body_key = request.GET.get("body", "mars")
        center_key = request.GET.get("center", "sun")
        date_str = request.GET.get("date", datetime.utcnow().strftime("%Y-%m-%d"))

        body_code = HORIZONS_BODY_MAP.get(body_key.lower(), "499")
        center_code = HORIZONS_BODY_MAP.get(center_key.lower(), "10")

        # 构建缓存键
        cache_key = f"{body_code}_{center_code}_{date_str}"
        if cache_key in _horizons_cache:
            cached_data, expiry = _horizons_cache[cache_key]
            if datetime.utcnow() < expiry:
                return api_response(cached_data)

        # 构建 Horizons API 请求（需单引号包裹值）
        query_string = (
            f"format=text"
            f"&COMMAND='{body_code}'"
            f"&CENTER='500@{center_code}'"
            f"&MAKE_EPHEM='YES'"
            f"&TABLE_TYPE='VECTORS'"
            f"&START_TIME='{date_str}'"
            f"&STOP_TIME='{date_str}'"
            f"&STEP_SIZE='1d'"
            f"&CSV_FORMAT='YES'"
            f"&VEC_TABLE='2'"
            f"&REF_SYSTEM='ICRF'"
            f"&OUT_UNITS='KM-S'"
        )

        try:
            api_request = Request(
                f"{HORIZONS_API_URL}?{query_string}",
                headers={"User-Agent": "SolarSystemEdu/1.0"},
                method="GET",
            )
            with urlopen(api_request, timeout=30) as response:
                raw = response.read().decode("utf-8", "replace")
        except HTTPError as exc:
            return api_response(
                {"error": f"NASA Horizons API 返回错误: HTTP {exc.code}"},
                status=502,
            )
        except URLError as exc:
            return api_response(
                {"error": f"无法连接 NASA Horizons API: {exc.reason}"},
                status=502,
            )

        parsed = _parse_horizons_csv(raw)

        if not parsed["positions"]:
            return api_response(
                {"error": "未能解析星历数据", "raw": raw[:500]},
                status=500,
            )

        result = {
            "body": body_key,
            "body_code": body_code,
            "center": center_key,
            "center_code": center_code,
            "date": date_str,
            "positions": parsed["positions"],
            "unit": "km (ICRF)",
        }

        # 缓存 1 小时
        _horizons_cache[cache_key] = (result, datetime.utcnow() + timedelta(hours=1))

        return api_response(result)


# ── Skyfield 本地星历端点（替代 NASA Horizons）──────────────────────

_skyfield_position_cache = {}


class SkyfieldPositionView(APIView):
    """使用 Skyfield + JPL DE440 本地星历计算天体位置（完全离线）。"""

    def get(self, request):
        try:
            from .services.skyfield_calculator import (
                compute_position,
                compute_positions_range,
                get_available_bodies,
                get_body_info,
            )
        except ImportError:
            return api_response(
                {"error": "Skyfield 未安装，请运行: pip install skyfield"},
                status=501,
            )

        mode = request.GET.get("mode", "single")

        # ── 模式 1：天体信息 ──
        if mode == "info":
            body_key = request.GET.get("body", "mars")
            try:
                return api_response(get_body_info(body_key))
            except ValueError as exc:
                return api_response({"error": str(exc)}, status=400)
            except Exception as exc:
                return api_response({"error": f"Skyfield 计算失败: {exc}"}, status=500)

        # ── 模式 2：天体列表 ──
        if mode == "bodies":
            return api_response({"bodies": get_available_bodies()})

        # ── 模式 3：位置范围查询 ──
        if mode == "range":
            body_key = request.GET.get("body", "mars")
            center_key = request.GET.get("center", "sun")
            start_date = request.GET.get("start_date")
            stop_date = request.GET.get("stop_date")
            step_days = int(request.GET.get("step_days", 1))

            cache_key = f"range_{body_key}_{center_key}_{start_date}_{stop_date}_{step_days}"
            if cache_key in _skyfield_position_cache:
                cached_data, expiry = _skyfield_position_cache[cache_key]
                if datetime.utcnow() < expiry:
                    return api_response(cached_data)

            try:
                result = compute_positions_range(
                    body_key=body_key,
                    center_key=center_key,
                    start_date=start_date,
                    stop_date=stop_date,
                    step_days=step_days,
                )
            except ValueError as exc:
                return api_response({"error": str(exc)}, status=400)
            except Exception as exc:
                return api_response({"error": f"Skyfield 计算失败: {exc}"}, status=500)

            _skyfield_position_cache[cache_key] = (result, datetime.utcnow() + timedelta(hours=6))
            return api_response(result)

        # ── 模式 4：批量获取所有天体位置 ──
        if mode == "all":
            date_str = request.GET.get("date")
            center_key = request.GET.get("center", "sun")

            cache_key = f"all_{center_key}_{date_str}"
            if cache_key in _skyfield_position_cache:
                cached_data, expiry = _skyfield_position_cache[cache_key]
                if datetime.utcnow() < expiry:
                    return api_response(cached_data)

            try:
                bodies_to_query = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"]
                if center_key != "moon":
                    bodies_to_query.append("moon")  # 月球也一起查

                results = []
                for body_key in bodies_to_query:
                    try:
                        pos = compute_position(body_key=body_key, center_key=center_key, date=date_str)
                        pos["body_key"] = body_key
                        results.append(pos)
                    except Exception:
                        continue  # 跳过计算失败的天体

                result = {
                    "center": center_key,
                    "date": date_str or datetime.utcnow().strftime("%Y-%m-%d"),
                    "bodies": results,
                    "source": "Skyfield (JPL DE440)",
                }
            except Exception as exc:
                return api_response({"error": f"Skyfield 批量计算失败: {exc}"}, status=500)

            _skyfield_position_cache[cache_key] = (result, datetime.utcnow() + timedelta(hours=6))
            return api_response(result)

        # ── 默认模式：单点位置查询 ──
        body_key = request.GET.get("body", "mars")
        center_key = request.GET.get("center", "sun")
        date_str = request.GET.get("date")

        cache_key = f"single_{body_key}_{center_key}_{date_str}"
        if cache_key in _skyfield_position_cache:
            cached_data, expiry = _skyfield_position_cache[cache_key]
            if datetime.utcnow() < expiry:
                return api_response(cached_data)

        try:
            result = compute_position(
                body_key=body_key,
                center_key=center_key,
                date=date_str,
            )
        except ValueError as exc:
            return api_response({"error": str(exc)}, status=400)
        except Exception as exc:
            return api_response({"error": f"Skyfield 计算失败: {exc}"}, status=500)

        _skyfield_position_cache[cache_key] = (result, datetime.utcnow() + timedelta(hours=6))
        return api_response(result)