"""FastAPI wrapper around the health_report package.

This is the seam between your Node.js server and the Python
report-generation logic: Node calls POST /reports/weekly over HTTP and
gets a PDF back. Node owns routing/auth/orchestration; this service owns
advisor logic + PDF rendering.

Run it with:
    uvicorn app:app --reload --port 8000
"""

from __future__ import annotations

import logging
import shutil
import tempfile
from pathlib import Path
from typing import Literal, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from starlette.background import BackgroundTask

from health_report import (
    OpenAIAdvisor,
    RuleBasedAdvisor,
    WeeklyHealthReportService,
    build_weekly_health_data,
)

load_dotenv()
logger = logging.getLogger("health_report.api")

app = FastAPI(
    title="Weekly Health Report Service",
    description="Generates a PDF weekly health summary from per-day fitness data.",
    version="1.0.0",
)


class WeeklyReportRequest(BaseModel):
    user_name: str = Field(..., description="Name to display on the report")
    records: list[dict] = Field(
        ..., description="Per-day health records (any common fitness-API shape)"
    )
    advisor: Literal["rule_based", "openai"] = Field(
        default="rule_based",
        description="Which advisor to use for generating advice/reinforcement text",
    )
    goals: Optional[dict] = Field(
        default=None,
        description=(
            "Optional standing user goals -- goal_type, target_weight_lbs, "
            "target_calories_in, target_protein_g, target_carbs_g, target_fat_g, "
            "target_steps, target_active_minutes. Any subset is fine."
        ),
    )
    openai_api_key: Optional[str] = Field(
        default=None,
        description="Optional per-request OpenAI key override; otherwise reads OPENAI_API_KEY",
    )


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


@app.post("/reports/weekly")
def generate_weekly_report(payload: WeeklyReportRequest) -> FileResponse:
    try:
        weekly_data = build_weekly_health_data(
            user_name=payload.user_name,
            records=payload.records,
            goals=payload.goals,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    # Fail soft on advisor construction too: a missing/invalid OpenAI key
    # shouldn't 500 the whole request when rule-based advice is a fine
    # substitute. WeeklyHealthReportService already falls back mid-run if
    # the OpenAI *call* fails; this covers the case where it fails at
    # *construction* (e.g. no key configured anywhere).
    advisor = RuleBasedAdvisor()
    if payload.advisor == "openai":
        try:
            advisor = OpenAIAdvisor(api_key=payload.openai_api_key)
        except Exception:
            logger.warning(
                "Could not construct OpenAIAdvisor (missing/invalid key?); "
                "falling back to rule-based advice."
            )

    # Each request gets its own temp directory so concurrent requests
    # never collide on filenames; the file is cleaned up once the
    # response has finished streaming.
    tmp_dir = Path(tempfile.mkdtemp(prefix="health_report_"))
    service = WeeklyHealthReportService(advisor=advisor, output_dir=tmp_dir)

    try:
        pdf_path = service.generate(weekly_data)
    except Exception as exc:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        logger.exception("Report generation failed")
        raise HTTPException(
            status_code=500, detail=f"Report generation failed: {exc}"
        ) from exc

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=pdf_path.name,
        background=BackgroundTask(shutil.rmtree, tmp_dir, ignore_errors=True),
    )