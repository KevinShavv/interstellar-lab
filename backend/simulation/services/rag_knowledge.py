"""
课程知识库 RAG 检索模块。
从 course-materials 和 lesson-diagrams 中提取天文/航天知识点，
根据用户问题匹配相关课程内容，注入到 LLM 上下文。
"""
import json
import os
import re
from pathlib import Path

# ── 课程知识库 ──────────────────────────────────────────────

COURSE_KNOWLEDGE = [
    {
        "id": "solar-structure",
        "topic": "太阳系结构与行星",
        "keywords": ["太阳系", "行星", "八大行星", "轨道", "太阳", "水星", "金星", "地球",
                      "火星", "木星", "土星", "天王星", "海王星", "公转", "黄道面"],
        "content": (
            "太阳系由太阳和八大行星组成，从内到外依次为：水星、金星、地球、火星（岩石行星）、"
            "木星、土星、天王星、海王星（气态巨行星）。所有行星围绕太阳公转，轨道近似圆形且"
            "基本在同一平面（黄道面）内。小行星带位于火星和木星之间。"
        ),
    },
    {
        "id": "solar-rotation",
        "topic": "地球自转与公转",
        "keywords": ["自转", "公转", "地球", "昼夜", "一天", "一年", "365", "24小时",
                      "角速度", "线速度", "近日点", "远日点"],
        "content": (
            "地球自转一周约24小时（一个太阳日），产生昼夜交替。地球绕太阳公转一周约365.25天，"
            "轨道为椭圆，太阳位于椭圆的一个焦点上。每年1月初地球经过近日点（距太阳约1.471亿公里），"
            "7月初经过远日点（距太阳约1.521亿公里）。"
        ),
    },
    {
        "id": "solar-seasons",
        "topic": "四季成因与黄赤交角",
        "keywords": ["四季", "季节", "春分", "夏至", "秋分", "冬至", "黄赤交角", "地轴倾斜",
                      "回归线", "极昼", "极夜", "北半球", "南半球"],
        "content": (
            "四季的形成是由于地球自转轴相对于公转平面（黄道面）倾斜约23.5°（黄赤交角）。"
            "夏至（6月21日前后）：太阳直射北回归线（23.5°N），北半球昼最长、夜最短。"
            "冬至（12月22日前后）：太阳直射南回归线（23.5°S），北半球昼最短、夜最长。"
            "春分（3月21日前后）和秋分（9月23日前后）：太阳直射赤道，全球昼夜等长。"
        ),
    },
    {
        "id": "solar-radiation",
        "topic": "太阳辐射与距离关系",
        "keywords": ["太阳辐射", "光照", "距离", "平方反比", "温度", "近日点", "远日点",
                      "辐射强度", "能量"],
        "content": (
            "太阳辐射强度与距离的平方成反比（平方反比定律）。行星接收的太阳辐射随轨道距离增大而"
            "急剧减小。例如海王星接收的太阳辐射仅为地球的约0.1%。这也是外行星温度极低的主要原因。"
        ),
    },
    {
        "id": "earth-moon-sun",
        "topic": "日地月系统与特殊节点",
        "keywords": ["日食", "月食", "满月", "新月", "朔望月", "日地月", "月球", "潮汐",
                      "中秋", "月相", "望", "朔"],
        "content": (
            "日食发生在新月时（月球位于日地之间），月食发生在满月时（地球位于日月之间）。"
            "朔望月约为29.5天。月球绕地球公转同时被地球带着绕太阳公转，轨道非常复杂。"
            "月球引力是地球潮汐的主要成因。"
        ),
    },
    {
        "id": "move-transfer",
        "topic": "地月转移轨道",
        "keywords": ["地月转移", "霍曼转移", "月球探测器", "发射窗口", "逃逸速度",
                      "近月制动", "LOI", "转移轨道", "嫦娥", "变轨"],
        "content": (
            "地月转移轨道是航天器从地球出发到达月球轨道的飞行路径。通常采用霍曼转移轨道，"
            "在近地点加速进入椭圆转移轨道，到达月球附近后进行近月制动（LOI）被月球引力捕获。"
            "地月转移通常需要3-5天，发射窗口的选择需要考虑月球位置和光照条件。"
            "转移轨道的燃料消耗、到达时间和入轨精度是工程中的关键指标。"
        ),
    },
    {
        "id": "move-orbit",
        "topic": "轨道窗口与发射时机",
        "keywords": ["发射窗口", "轨道", "霍曼", "速度增量", "Δv", "近地点", "远地点",
                      "椭圆轨道", "圆轨道"],
        "content": (
            "发射窗口是指适合发射航天器的时间段，由目标天体位置、光照条件和运载能力共同决定。"
            "霍曼转移是最省燃料的轨道转移方式，在两个共面圆轨道之间经过半个椭圆转移。"
            "Δv（速度增量）是衡量轨道机动难度的核心指标。"
        ),
    },
    {
        "id": "move-brake",
        "topic": "近月制动与轨道捕获",
        "keywords": ["近月制动", "LOI", "捕获", "环月轨道", "减速", "反推", "制动",
                      "月球轨道", "环绕"],
        "content": (
            "近月制动（Lunar Orbit Insertion, LOI）是探测器到达月球附近后，通过发动机反推减速，"
            "使探测器被月球引力捕获并进入环月轨道的关键操作。制动时机和推力大小需要精确计算，"
            "太早或太晚、推力太大或太小都可能导致任务失败。"
        ),
    },
    {
        "id": "tls-gravity",
        "topic": "万有引力与多体模拟",
        "keywords": ["万有引力", "引力", "牛顿", "F=GMm/r²", "质量", "距离", "多体",
                      "N体问题", "模拟", "三体"],
        "content": (
            "牛顿万有引力定律：F=GMm/r²，两个物体之间的引力与质量乘积成正比，与距离平方成反比。"
            "多体（N体）问题中，每个天体受到其他所有天体的引力合力作用，一般没有解析解，"
            "需要通过数值积分方法（如RK4、Verlet积分）进行模拟计算。"
            "三体问题是N体问题中最简单的非平凡情况，表现出混沌特性。"
        ),
    },
    {
        "id": "tls-orbit-speed",
        "topic": "轨道速度与离心力平衡",
        "keywords": ["轨道速度", "离心力", "向心力", "引力平衡", "开普勒", "圆轨道",
                      "轨道周期"],
        "content": (
            "在圆轨道上，引力提供向心力：GMm/r² = mv²/r，因此轨道速度 v = √(GM/r)。"
            "离太阳越近的行星，轨道速度越快。水星轨道速度约47.9 km/s，海王星仅约5.4 km/s。"
            "开普勒第三定律：轨道周期的平方与轨道半长轴的立方成正比（T² ∝ a³）。"
        ),
    },
    {
        "id": "tls-conclusion",
        "topic": "天体力学与轨道稳定性",
        "keywords": ["轨道共振", "拉格朗日点", "希尔球", "摄动", "稳定性", "潮汐锁定"],
        "content": (
            "天体力学研究天体在引力作用下的运动规律。轨道共振（如木星与土星的5:2近共振）"
            "会影响天体轨道的长期演化。拉格朗日点（L1-L5）是三体问题中的五个平衡点，"
            "JWST望远镜位于日地L2点。希尔球定义了一个天体引力主导的区域范围。"
        ),
    },
]

# ── 辅助检索函数 ──────────────────────────────────────────────


def _tokenize(text: str) -> set:
    """简单中文分词：按标点和空格切分，同时保留双字和三字子串。"""
    tokens = set()
    # 去除标点
    cleaned = re.sub(r"[，。！？、；：""（）【】《》\s]+", " ", text)
    # 按空格分割
    words = [w for w in cleaned.split() if len(w) >= 1]
    for w in words:
        tokens.add(w)
        # 双字子串
        for i in range(len(w) - 1):
            tokens.add(w[i:i + 2])
        # 三字子串
        for i in range(len(w) - 2):
            tokens.add(w[i:i + 3])
    return tokens


def retrieve(query: str, top_k: int = 3) -> str:
    """
    根据用户查询检索最相关的课程知识片段。

    Args:
        query: 用户问题文本
        top_k: 返回最相关的前 k 个片段

    Returns:
        拼接后的知识文本，无匹配时返回空字符串
    """
    if not query or not COURSE_KNOWLEDGE:
        return ""

    query_tokens = _tokenize(query)

    # 计算每个知识条目的匹配分数
    scored = []
    for entry in COURSE_KNOWLEDGE:
        # 对 keywords 做精确匹配加权
        keyword_hits = 0
        for kw in entry["keywords"]:
            if kw in query:
                keyword_hits += 1
        # 对 content 做 token 重合度计算
        content_tokens = _tokenize(entry["content"] + " " + entry["topic"])
        overlap = len(query_tokens & content_tokens)

        score = keyword_hits * 3 + overlap
        if score > 0:
            scored.append((score, entry))

    # 按分数降序
    scored.sort(key=lambda x: x[0], reverse=True)

    if not scored:
        return ""

    top_entries = scored[:top_k]
    fragments = []
    for score, entry in top_entries:
        fragments.append(f"【{entry['topic']}】{entry['content']}")

    return "\n\n".join(fragments)


def build_rag_system_prompt(user_message: str) -> str:
    """
    构建带有 RAG 检索上下文的 system prompt。

    Args:
        user_message: 用户最新消息

    Returns:
        包含课程知识上下文的 system prompt 字符串
    """
    context = retrieve(user_message, top_k=2)

    base = (
        "你是嵌入在天文与航天仿真页面中的中文助手。"
        "请直接回答用户问题，优先结合当前页面模块内容作答。"
        "不要提及你的身份、模型来源、系统提示或接口实现。"
    )

    if context:
        return (
            f"{base}\n\n"
            f"以下是与用户问题相关的课程知识，请优先参考：\n"
            f"---\n"
            f"{context}\n"
            f"---\n"
            f"请在回答中尽量引用上述课程知识，帮助学生理解天文概念。"
        )

    return base
