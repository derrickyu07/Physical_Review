"""Adapter for turning a generic health/fitness API response into a
``WeeklyHealthData`` object.

Most consumer health APIs (Fitbit, Withings, Oura, Google Fit, a hospital
patient portal, etc.) return one JSON record per day with slightly
different field names. Rather than hard-coding one vendor, this module
does three things:

1. ``fetch_json`` -- a thin, swappable HTTP fetch helper.
2. ``parse_daily_records`` -- maps a list of arbitrary day-records into
   ``DailyMetric`` objects using a configurable field-name mapping, so you
   can point this at whatever API you actually have credentials for
   without touching the rest of the pipeline.
3. ``parse_goals`` -- maps a single, mostly-static "user goals" record
   (target weight, target macros, etc.) into a ``UserGoals`` object.
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Any, Optional

import requests

from .models import DailyMetric, UserGoals, WeeklyHealthData

# Maps our canonical field name -> list of possible keys a given API might
# use for that field. Extend this if your API uses different names.
DEFAULT_FIELD_MAP: dict[str, list[str]] = {
    "day": ["date", "day", "recorded_on"],
    "active_minutes": ["active_minutes", "activeMinutes", "activity_minutes"],
    "calories_in": ["calories_in", "caloriesConsumed", "intake_calories", "caloriesIn"],
    "calories_out": ["calories_out", "caloriesBurned", "calories_expended", "caloriesOut"],
    "protein_g": ["protein_g", "proteinGrams", "protein", "proteinG"],
    "carbs_g": ["carbs_g", "carbGrams", "carbohydrates_g", "carbs", "carbohydrates"],
    "fat_g": ["fat_g", "fatGrams", "fat"],
    "weight_lbs": ["weight_lbs", "weightLbs", "body_weight_lbs"],
    "height": ["height", "height_in", "heightIn"],
    "age": ["age"],
    "gender": ["gender", "sex"],
    "activity_level": ["activity_level", "activityLevel"],
}

# Same idea, for the one-off "goals" record rather than per-day records.
DEFAULT_GOALS_FIELD_MAP: dict[str, list[str]] = {
    "goal_type": ["goal_type", "goalType"],
    "target_weight_lbs": ["target_weight_lbs", "targetWeightLbs"],
    "target_calories_in": ["target_calories_in", "targetCalories", "calorie_target"],
    "target_protein_g": ["target_protein_g", "targetProteinGrams", "protein_target"],
    "target_carbs_g": ["target_carbs_g", "targetCarbGrams", "carbs_target"],
    "target_fat_g": ["target_fat_g", "targetFatGrams", "fat_target"],
    "target_steps": ["target_steps", "targetSteps", "steps_target"],
    "target_active_minutes": ["target_active_minutes", "targetActiveMinutes"],
}


def fetch_json(
    url: str,
    params: Optional[dict] = None,
    headers: Optional[dict] = None,
    timeout: float = 15.0,
) -> Any:
    """Fetch and return JSON from a health/fitness API endpoint.

    Kept deliberately dumb (no retries, no auth scheme baked in) so it's
    easy to swap for the SDK of whichever provider you end up using.
    """
    response = requests.get(url, params=params, headers=headers, timeout=timeout)
    response.raise_for_status()
    return response.json()


def _first_present(record: dict, keys: list[str]) -> Any:
    for key in keys:
        if key in record and record[key] is not None:
            return record[key]
    return None


def _parse_day(value: Any) -> date:
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        # Handles "2026-07-14" and full ISO timestamps alike.
        return datetime.fromisoformat(value.split("T")[0]).date()
    raise ValueError(f"Cannot parse date from value: {value!r}")


def parse_daily_records(
    records: list[dict],
    field_map: dict[str, list[str]] = DEFAULT_FIELD_MAP,
) -> list[DailyMetric]:
    """Convert a list of raw per-day API records into ``DailyMetric``
    objects, tolerating missing fields and varying key names."""

    daily_metrics: list[DailyMetric] = []
    for record in records:
        raw_day = _first_present(record, field_map["day"])
        if raw_day is None:
            continue  # can't place this record on the calendar; skip it

        daily_metrics.append(
            DailyMetric(
                day=_parse_day(raw_day),
                active_minutes=_first_present(record, field_map["active_minutes"]),
                calories_in=_first_present(record, field_map["calories_in"]),
                calories_out=_first_present(record, field_map["calories_out"]),
                protein_g=_first_present(record, field_map["protein_g"]),
                carbs_g=_first_present(record, field_map["carbs_g"]),
                fat_g=_first_present(record, field_map["fat_g"]),
                weight_lbs=_first_present(record, field_map["weight_lbs"]),
                height=_first_present(record, field_map["height"]),
                age=_first_present(record, field_map["age"]),
                gender=_first_present(record, field_map["gender"]),
                activity_level=_first_present(record, field_map["activity_level"]),
            )
        )
    daily_metrics.sort(key=lambda d: d.day)
    return daily_metrics


def parse_goals(
    raw_goals: Optional[dict],
    field_map: dict[str, list[str]] = DEFAULT_GOALS_FIELD_MAP,
) -> Optional[UserGoals]:
    """Convert a single raw "goals" record into a ``UserGoals`` object.
    Returns ``None`` if no goals data was provided at all."""

    if not raw_goals:
        return None

    return UserGoals(
        goal_type=_first_present(raw_goals, field_map["goal_type"]),
        target_weight_lbs=_first_present(raw_goals, field_map["target_weight_lbs"]),
        target_calories_in=_first_present(raw_goals, field_map["target_calories_in"]),
        target_protein_g=_first_present(raw_goals, field_map["target_protein_g"]),
        target_carbs_g=_first_present(raw_goals, field_map["target_carbs_g"]),
        target_fat_g=_first_present(raw_goals, field_map["target_fat_g"]),
        target_steps=_first_present(raw_goals, field_map["target_steps"]),
        target_active_minutes=_first_present(
            raw_goals, field_map["target_active_minutes"]
        ),
    )


def build_weekly_health_data(
    user_name: str,
    records: list[dict],
    goals: Optional[dict] = None,
    field_map: dict[str, list[str]] = DEFAULT_FIELD_MAP,
    goals_field_map: dict[str, list[str]] = DEFAULT_GOALS_FIELD_MAP,
) -> WeeklyHealthData:
    """End-to-end convenience wrapper: raw API records (+ optional raw
    goals) -> WeeklyHealthData."""

    days = parse_daily_records(records, field_map=field_map)
    if not days:
        raise ValueError("No parseable daily records were provided.")

    return WeeklyHealthData(
        user_name=user_name,
        week_start=days[0].day,
        week_end=days[-1].day,
        days=days,
        goals=parse_goals(goals, field_map=goals_field_map),
    )