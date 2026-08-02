"""Core data models for the weekly health report service.

These models are intentionally decoupled from any specific data source
(wearable, health app, manual entry). Anything that can populate a
``WeeklyHealthData`` object -- whether it comes from Apple Health, Fitbit,
Oura, or a plain REST API response -- can be fed into the rest of the
pipeline.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from statistics import mean
from typing import Optional


@dataclass
class DailyMetric:
    """Health metrics for a single day. All fields except ``day`` are
    optional since real-world data sources rarely report everything."""

    day: date
    # Physical activity
    active_minutes: Optional[int] = None
    # Calorie intake / expenditure
    calories_in: Optional[int] = None
    calories_out: Optional[int] = None
    # Macro nutrients (grams)
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    # Body metrics
    weight_lbs: Optional[float] = None
    # Profile (logged per-day in the source data, but near-constant --
    # WeeklyStats takes the most recent non-null value rather than
    # averaging these, since you can't average a string, and an average
    # height/age across a week is meaningless anyway)
    height: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    activity_level: Optional[str] = None


@dataclass
class UserGoals:
    """A user's standing targets -- these don't change day to day the way
    ``DailyMetric`` does, so they're modeled separately and passed
    alongside a week's data rather than repeated on every day.

    Every field is optional: a user might set a target weight and nothing
    else, or a full macro split and no weight goal at all. The advisor
    (LLM or rule-based) only reasons about whichever targets are present.
    """

    goal_type: Optional[str] = None  # e.g. "lose_weight", "maintain", "build_muscle", "improve_endurance"
    target_weight_lbs: Optional[float] = None
    target_calories_in: Optional[int] = None
    target_protein_g: Optional[float] = None
    target_carbs_g: Optional[float] = None
    target_fat_g: Optional[float] = None
    target_steps: Optional[int] = None
    target_active_minutes: Optional[int] = None


@dataclass
class WeeklyHealthData:
    """A user's raw health data for one reporting week."""

    user_name: str
    week_start: date
    week_end: date
    days: list[DailyMetric] = field(default_factory=list)
    goals: Optional[UserGoals] = None
    previous_week_stats: Optional["WeeklyStats"] = None


@dataclass
class WeeklyStats:
    """Aggregated, derived statistics for a week. Computed once and reused
    by both the advisor (LLM or rule-based) and the PDF renderer, so the
    two never disagree about the numbers."""

    avg_active_minutes: Optional[float]
    avg_calories_in: Optional[float]
    avg_calories_out: Optional[float]
    avg_protein_g: Optional[float]
    avg_carbs_g: Optional[float]
    avg_fat_g: Optional[float]
    weight_start: Optional[float]
    weight_end: Optional[float]
    weight_change_lbs: Optional[float]
    height: Optional[float]
    age: Optional[int]
    gender: Optional[str]
    activity_level: Optional[str]

    @classmethod
    def from_days(cls, days: list[DailyMetric]) -> "WeeklyStats":
        def avg(values: list) -> Optional[float]:
            clean = [v for v in values if v is not None]
            return round(mean(clean), 1) if clean else None

        def most_recent(values: list):
            """For fields that don't meaningfully vary day to day (height,
            age, gender, activity level) -- take the latest non-null value
            instead of averaging."""
            for v in reversed(values):
                if v is not None:
                    return v
            return None

        weights = [d.weight_lbs for d in days if d.weight_lbs is not None]

        return cls(
            avg_active_minutes=avg([d.active_minutes for d in days]),
            avg_calories_in=avg([d.calories_in for d in days]),
            avg_calories_out=avg([d.calories_out for d in days]),
            avg_protein_g=avg([d.protein_g for d in days]),
            avg_carbs_g=avg([d.carbs_g for d in days]),
            avg_fat_g=avg([d.fat_g for d in days]),
            weight_start=weights[0] if weights else None,
            weight_end=weights[-1] if weights else None,
            weight_change_lbs=(
                round(weights[-1] - weights[0], 1) if len(weights) >= 2 else None
            ),
            height=most_recent([d.height for d in days]),
            age=most_recent([d.age for d in days]),
            gender=most_recent([d.gender for d in days]),
            activity_level=most_recent([d.activity_level for d in days]),
        )


@dataclass
class AdviceContent:
    """The narrative content generated for the report, whether produced by
    an LLM (:class:`OpenAIAdvisor`) or rules (:class:`RuleBasedAdvisor`)."""

    headline: str
    positive_reinforcement: str
    key_wins: list[str]
    diet_changes: list[str]
    lifestyle_changes: list[str]