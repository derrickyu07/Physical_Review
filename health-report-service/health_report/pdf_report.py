"""Renders a ``WeeklyHealthData`` + ``AdviceContent`` pair into a PDF.

Uses reportlab for layout/typesetting and matplotlib (headless Agg
backend) to render a small trend chart that gets embedded as an image.
Kept independent of the advisor and data-source layers -- it only needs
plain data classes, so it's easy to unit test or reuse with a different
advice-generation strategy.
"""

from __future__ import annotations

import tempfile
from pathlib import Path
from typing import Optional

import matplotlib

matplotlib.use("Agg")  # headless: no display server needed
import matplotlib.pyplot as plt

from reportlab.lib import colors
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Image,
    ListFlowable,
    ListItem,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from .models import AdviceContent, UserGoals, WeeklyHealthData, WeeklyStats

BRAND_GREEN = colors.HexColor("#2E7D5B")
BRAND_LIGHT_GREEN = colors.HexColor("#E7F3EC")
BRAND_GRAY = colors.HexColor("#4A4A4A")


def _build_trend_chart(data: WeeklyHealthData) -> Path:
    """Render a simple active-minutes + weight trend chart to a temp PNG
    and return its path. Caller is responsible for cleaning up the temp
    file.

    Pairs a physical-activity metric (active minutes) with a body metric
    (weight) since that's the combination most directly tied to a user's
    goal (e.g. lose_weight, build_muscle) -- swap this for calories
    in/out if you'd rather chart a different pair.
    """

    days = data.days
    labels = [d.day.strftime("%a") for d in days]
    active_minutes = [d.active_minutes if d.active_minutes is not None else 0 for d in days]
    # NaN (not 0) for missing weight readings, so matplotlib skips the
    # point instead of drawing a misleading drop to zero on the line.
    weight = [d.weight_lbs if d.weight_lbs is not None else float("nan") for d in days]

    fig, ax1 = plt.subplots(figsize=(6.5, 2.4), dpi=150)
    ax2 = ax1.twinx()

    ax1.bar(labels, active_minutes, color="#2E7D5B", alpha=0.75, label="Active minutes")
    ax2.plot(labels, weight, color="#1F5FA8", marker="o", linewidth=2, label="Weight (lbs)")

    ax1.set_ylabel("Active minutes", fontsize=8, color="#2E7D5B")
    ax2.set_ylabel("Weight (lbs)", fontsize=8, color="#1F5FA8")
    ax1.tick_params(axis="both", labelsize=8)
    ax2.tick_params(axis="y", labelsize=8)
    ax1.spines["top"].set_visible(False)
    ax2.spines["top"].set_visible(False)
    fig.tight_layout()

    tmp = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    fig.savefig(tmp.name, transparent=True)
    plt.close(fig)
    return Path(tmp.name)


def _kpi_table(stats: WeeklyStats) -> Table:
    def fmt(value, unit=""):
        return f"{value}{unit}" if value is not None else "--"

    rows = [
        ["Metric", "This Week's Average"],
        ["Height", fmt(stats.height)],
        ["Age", fmt(stats.age)],
        ["Gender", fmt(stats.gender)],
        ["Activity level", fmt(stats.activity_level)],
        ["Active minutes/day", fmt(stats.avg_active_minutes)],
        ["Calories in/day", fmt(stats.avg_calories_in)],
        ["Calories out/day", fmt(stats.avg_calories_out)],
        ["Protein/day", fmt(stats.avg_protein_g, "g")],
        ["Carbs/day", fmt(stats.avg_carbs_g, "g")],
        ["Fat/day", fmt(stats.avg_fat_g, "g")],
        ["Weight change", fmt(stats.weight_change_lbs, " lbs")],
    ]
    table = Table(rows, colWidths=[3.2 * inch, 3.2 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), BRAND_GREEN),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F5F7F6")]),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D0D7D4")),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return table


def _goals_table(stats: WeeklyStats, goals: UserGoals) -> Table:
    """Side-by-side actual-vs-target table, only rendered when the user
    has goals set. Rows where the user set no target are skipped."""

    def fmt(value, unit=""):
        return f"{value}{unit}" if value is not None else "--"

    candidate_rows = [
        ("Active minutes/day", stats.avg_active_minutes, goals.target_active_minutes),
        ("Calories/day", stats.avg_calories_in, goals.target_calories_in),
        ("Protein/day (g)", stats.avg_protein_g, goals.target_protein_g),
        ("Carbs/day (g)", stats.avg_carbs_g, goals.target_carbs_g),
        ("Fat/day (g)", stats.avg_fat_g, goals.target_fat_g),
        ("Weight (lbs)", stats.weight_end, goals.target_weight_lbs),
    ]

    rows = [["Metric", "Actual", "Target"]]
    for label, actual, target in candidate_rows:
        if target is None:
            continue
        rows.append([label, fmt(actual), fmt(target)])

    table = Table(rows, colWidths=[2.6 * inch, 2.0 * inch, 2.0 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), BRAND_GREEN),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F5F7F6")]),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D0D7D4")),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return table


def build_pdf(
    data: WeeklyHealthData,
    stats: WeeklyStats,
    advice: AdviceContent,
    output_path: Path,
) -> Path:
    """Render the full weekly health summary PDF to ``output_path``."""

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ReportTitle", parent=styles["Title"], textColor=BRAND_GREEN, fontSize=22
    )
    subtitle_style = ParagraphStyle(
        "Subtitle", parent=styles["Normal"], textColor=BRAND_GRAY, fontSize=11
    )
    h2_style = ParagraphStyle(
        "H2", parent=styles["Heading2"], textColor=BRAND_GREEN, spaceBefore=14
    )
    body_style = ParagraphStyle("Body", parent=styles["Normal"], fontSize=10, leading=14)
    callout_style = ParagraphStyle(
        "Callout", parent=body_style, backColor=BRAND_LIGHT_GREEN, borderPadding=10
    )

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=LETTER,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        leftMargin=0.7 * inch,
        rightMargin=0.7 * inch,
        title=f"Weekly Health Summary - {data.user_name}",
    )

    story = []
    story.append(Paragraph("Weekly Health Summary", title_style))
    story.append(
        Paragraph(
            f"{data.user_name} &nbsp;|&nbsp; "
            f"{data.week_start.strftime('%b %d')} &ndash; {data.week_end.strftime('%b %d, %Y')}",
            subtitle_style,
        )
    )
    story.append(Spacer(1, 12))

    story.append(Paragraph(advice.headline, h2_style))
    story.append(Paragraph(advice.positive_reinforcement, callout_style))
    story.append(Spacer(1, 10))

    if advice.key_wins:
        story.append(Paragraph("Key Wins", h2_style))
        story.append(
            ListFlowable(
                [ListItem(Paragraph(win, body_style)) for win in advice.key_wins],
                bulletType="bullet",
                start="circle",
            )
        )

    story.append(Paragraph("This Week at a Glance", h2_style))
    story.append(_kpi_table(stats))
    story.append(Spacer(1, 10))

    if data.goals is not None:
        story.append(Paragraph("Progress Toward Your Goals", h2_style))
        story.append(_goals_table(stats, data.goals))
        story.append(Spacer(1, 10))

    chart_path: Optional[Path] = None
    if any(d.active_minutes is not None or d.weight_lbs is not None for d in data.days):
        chart_path = _build_trend_chart(data)
        story.append(Image(str(chart_path), width=6.5 * inch, height=2.4 * inch))
        story.append(Spacer(1, 6))

    story.append(Paragraph("Diet Suggestions for Next Week", h2_style))
    story.append(
        ListFlowable(
            [ListItem(Paragraph(item, body_style)) for item in advice.diet_changes],
            bulletType="bullet",
        )
    )

    story.append(Paragraph("Lifestyle Suggestions for Next Week", h2_style))
    story.append(
        ListFlowable(
            [ListItem(Paragraph(item, body_style)) for item in advice.lifestyle_changes],
            bulletType="bullet",
        )
    )

    story.append(Spacer(1, 18))
    story.append(
        Paragraph(
            "This report is generated for general wellness encouragement and is not "
            "medical advice. Please consult a healthcare provider about any concerning "
            "symptoms or before making significant changes to diet or exercise.",
            ParagraphStyle("Disclaimer", parent=styles["Normal"], fontSize=7.5, textColor=colors.grey),
        )
    )

    doc.build(story)

    if chart_path is not None:
        chart_path.unlink(missing_ok=True)

    return output_path