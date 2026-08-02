"""Top-level orchestrator: raw weekly data -> finished PDF.

This is the one class most callers should need to touch. It wires
together stats aggregation, advice generation, and PDF rendering, and
degrades gracefully: if the configured advisor raises (e.g. an OpenAI
call fails or times out), it automatically falls back to the rule-based
advisor rather than failing the whole report.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Optional

from .advisor import Advisor, RuleBasedAdvisor
from .models import WeeklyHealthData, WeeklyStats
from .pdf_report import build_pdf

logger = logging.getLogger(__name__)


class WeeklyHealthReportService:
    def __init__(
        self,
        advisor: Advisor,
        output_dir: Path | str = "reports",
        fallback_advisor: Optional[Advisor] = None,
    ):
        self._advisor = advisor
        self._fallback_advisor = fallback_advisor or RuleBasedAdvisor()
        self._output_dir = Path(output_dir)

    def generate(self, data: WeeklyHealthData) -> Path:
        """Generate the weekly PDF report for ``data`` and return its path."""

        stats = WeeklyStats.from_days(data.days)

        try:
            advice = self._advisor.generate(
                user_name=data.user_name,
                stats=stats,
                goals=data.goals,
                previous_stats=data.previous_week_stats,
            )
        except Exception:
            logger.exception(
                "Primary advisor failed; falling back to rule-based advice."
            )
            advice = self._fallback_advisor.generate(
                user_name=data.user_name,
                stats=stats,
                goals=data.goals,
                previous_stats=data.previous_week_stats,
            )

        filename = (
            f"{data.user_name.replace(' ', '_').lower()}_"
            f"weekly_summary_{data.week_start.isoformat()}.pdf"
        )
        output_path = self._output_dir / filename

        return build_pdf(data=data, stats=stats, advice=advice, output_path=output_path)