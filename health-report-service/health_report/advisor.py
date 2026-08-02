"""Generates the narrative advice + positive reinforcement for a report.

Two implementations share one interface (``Advisor``):

* ``OpenAIAdvisor``  -- calls the OpenAI API with a system prompt and asks
  for structured JSON back. This is the "real" advisor.
* ``RuleBasedAdvisor`` -- a deterministic, no-API-key-required fallback.
  Useful for local development, tests, and as a safety net if the OpenAI
  call fails or no key is configured.

Both advisors reason about the same five categories: calorie intake,
physical activity, body metrics, macro nutrients, and (when provided)
the user's standing goals -- comparing actuals against targets rather
than just generic thresholds when a goal is present.

``WeeklyHealthReportService`` depends on the ``Advisor`` protocol, not on
either concrete class, so swapping providers (or adding e.g. an
Anthropic-backed advisor later) doesn't require touching the rest of the
pipeline.
"""

from __future__ import annotations

import json
import logging
from typing import Optional, Protocol

from .models import AdviceContent, UserGoals, WeeklyStats

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """\
You are a supportive, evidence-based wellness coach writing a weekly health \
summary for one person. You are given a week's worth of aggregated health \
metrics across four categories: physical activity (active minutes), \
calorie intake, macro nutrients (protein/carbs/fat), and body metrics \
(weight). You're also given the user's profile -- height, age, gender, and \
activity level (sedentary through extremely active) -- useful context for \
judging whether their calorie/macro intake is reasonable for their body \
and lifestyle. You may also be given the user's standing goals -- a goal \
type (e.g. lose weight, build muscle, maintain, improve endurance) and \
specific numeric targets.

Your job:
1. Always lead with genuine, specific positive reinforcement. Find real \
   progress or consistency in the numbers -- do not invent achievements, \
   but do look for anything worth acknowledging (consistency, small \
   improvements, hitting even one healthy threshold on some days).
2. If goals were provided, frame your analysis relative to those targets \
   specifically -- e.g. "you averaged 140g of protein against your 160g \
   target" rather than generic advice. If no goals were provided, fall \
   back to general healthy ranges.
3. Suggest concrete, realistic diet changes for the coming week, informed \
   by the macro and calorie data. Prefer small, specific swaps ("add a \
   serving of Greek yogurt to close your protein gap") over vague advice \
   ("eat healthier").
4. Suggest concrete, realistic lifestyle/activity changes for the coming \
   week, same style: specific and small.
5. Never shame, guilt, or use alarming language, even if the numbers are \
   concerning or off-target. Frame gaps as opportunities, not failures.
6. You are not a doctor or registered dietitian. Do not diagnose \
   conditions or prescribe exact medical/nutritional protocols. If a \
   metric looks medically concerning, gently suggest mentioning it to a \
   doctor or dietitian rather than interpreting it yourself.

Respond with ONLY a JSON object matching this schema, no extra prose:
{
  "headline": "one short encouraging sentence summarizing the week",
  "positive_reinforcement": "2-4 sentences of specific, genuine praise",
  "key_wins": ["short phrase", "short phrase", ...],
  "diet_changes": ["specific suggestion", ...],
  "lifestyle_changes": ["specific suggestion", ...]
}
"""


class Advisor(Protocol):
    """Anything that can turn weekly stats (+ optional goals) into
    narrative advice."""

    def generate(
        self,
        user_name: str,
        stats: WeeklyStats,
        goals: Optional[UserGoals] = None,
        previous_stats: Optional[WeeklyStats] = None,
    ) -> AdviceContent: ...


def _stats_to_prompt(
    user_name: str,
    stats: WeeklyStats,
    goals: Optional[UserGoals],
    previous_stats: Optional[WeeklyStats],
) -> str:
    def fmt(value, unit=""):
        return f"{value}{unit}" if value is not None else "no data"

    lines = [
        f"User: {user_name}",
        "User's profile:",
        f"- Height: {fmt(stats.height)}",
        f"- Age: {fmt(stats.age)}",
        f"- Gender: {fmt(stats.gender)}",
        f"- Activity level: {fmt(stats.activity_level)}",
        "This week's averages:",
        f"- Active minutes/day: {fmt(stats.avg_active_minutes)}",
        f"- Calories in/day: {fmt(stats.avg_calories_in)}",
        f"- Calories out/day: {fmt(stats.avg_calories_out)}",
        f"- Protein/day: {fmt(stats.avg_protein_g, 'g')}",
        f"- Carbs/day: {fmt(stats.avg_carbs_g, 'g')}",
        f"- Fat/day: {fmt(stats.avg_fat_g, 'g')}",
        f"- Weight change this week: {fmt(stats.weight_change_lbs, ' lbs')}",
    ]

    if goals is not None:
        lines.append("User's stated goals:")
        if goals.goal_type:
            lines.append(f"- Goal type: {goals.goal_type}")
        lines.append(f"- Target weight: {fmt(goals.target_weight_lbs, ' lbs')}")
        lines.append(f"- Target calories/day: {fmt(goals.target_calories_in)}")
        lines.append(f"- Target protein/day: {fmt(goals.target_protein_g, 'g')}")
        lines.append(f"- Target carbs/day: {fmt(goals.target_carbs_g, 'g')}")
        lines.append(f"- Target fat/day: {fmt(goals.target_fat_g, 'g')}")
        lines.append(
            f"- Target active minutes/day: {fmt(goals.target_active_minutes)}"
        )

    if previous_stats is not None:
        lines.append("Previous week's averages, for trend comparison:")
        lines.append(f"- Active minutes/day: {fmt(previous_stats.avg_active_minutes)}")
        lines.append(f"- Weight change: {fmt(previous_stats.weight_change_lbs, ' lbs')}")

    return "\n".join(lines)


class OpenAIAdvisor:
    """Advisor backed by the OpenAI Chat Completions API.

    Requires the ``openai`` package and an API key (passed explicitly or
    read from the ``OPENAI_API_KEY`` environment variable by the client).
    """

    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o-mini"):
        from openai import OpenAI  # imported lazily so RuleBasedAdvisor-only

        self._client = OpenAI(api_key=api_key)
        self._model = model

    def generate(
        self,
        user_name: str,
        stats: WeeklyStats,
        goals: Optional[UserGoals] = None,
        previous_stats: Optional[WeeklyStats] = None,
    ) -> AdviceContent:
        user_prompt = _stats_to_prompt(user_name, stats, goals, previous_stats)

        response = self._client.chat.completions.create(
            model=self._model,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.6,
        )
        raw = response.choices[0].message.content
        try:
            data = json.loads(raw)
            return AdviceContent(
                headline=data["headline"],
                positive_reinforcement=data["positive_reinforcement"],
                key_wins=list(data.get("key_wins", [])),
                diet_changes=list(data.get("diet_changes", [])),
                lifestyle_changes=list(data.get("lifestyle_changes", [])),
            )
        except (json.JSONDecodeError, KeyError) as exc:
            logger.error("Failed to parse OpenAI response as AdviceContent: %s", exc)
            raise ValueError(
                "OpenAI response did not match the expected JSON schema"
            ) from exc


class RuleBasedAdvisor:
    """Deterministic advisor with no external dependencies.

    Serves as the default in demos/tests and as a fallback if the OpenAI
    call errors out, so report generation never hard-fails just because
    an API key is missing or a request timed out. Compares actuals
    against ``goals`` when provided, falling back to generic thresholds
    otherwise.
    """

    def generate(
        self,
        user_name: str,
        stats: WeeklyStats,
        goals: Optional[UserGoals] = None,
        previous_stats: Optional[WeeklyStats] = None,
    ) -> AdviceContent:
        key_wins: list[str] = []
        diet_changes: list[str] = []
        lifestyle_changes: list[str] = []

        goal_active_minutes = (goals.target_active_minutes if goals else None) or 30
        goal_protein = goals.target_protein_g if goals else None
        goal_calories = goals.target_calories_in if goals else None

        # --- Key wins ---
        if goal_protein and stats.avg_protein_g and stats.avg_protein_g >= goal_protein * 0.9:
            key_wins.append(f"Averaged {stats.avg_protein_g:.0f}g of protein, close to your {goal_protein:.0f}g target")

        if goals and goals.goal_type == "lose_weight" and stats.weight_change_lbs is not None and stats.weight_change_lbs <= 0:
            key_wins.append("Trending in the right direction on weight toward your goal")
        elif stats.weight_change_lbs is not None and stats.weight_change_lbs <= 0:
            key_wins.append("Held steady or trended down on weight this week")

        if not key_wins:
            key_wins.append("Logged data consistently this week -- that's the hardest part")

        # --- Diet changes (calorie + macro aware) ---
        if goal_protein and stats.avg_protein_g and stats.avg_protein_g < goal_protein * 0.85:
            gap = goal_protein - stats.avg_protein_g
            diet_changes.append(
                f"You're averaging about {gap:.0f}g/day under your {goal_protein:.0f}g protein target -- "
                "try adding a protein source (Greek yogurt, eggs, or a shake) at one meal."
            )
        elif not goal_protein and stats.avg_protein_g is not None and stats.avg_protein_g < 100:
            diet_changes.append(
                "Protein intake looks on the lower side -- try adding a serving of lean protein to one meal a day."
            )

        if goal_calories and stats.avg_calories_in and stats.avg_calories_in > goal_calories * 1.1:
            diet_changes.append(
                f"Average intake is running above your {goal_calories}-calorie target -- "
                "try trimming one higher-calorie snack or portion per day."
            )
        elif (
            not goal_calories
            and stats.avg_calories_in
            and stats.avg_calories_out
            and (stats.avg_calories_in - stats.avg_calories_out > 300)
        ):
            diet_changes.append(
                "Try adding a serving of vegetables or lean protein at dinner in place of one "
                "refined-carb portion, to nudge intake closer to output."
            )

        if not diet_changes:
            diet_changes.append(
                "Keep doing what you're doing -- consider adding one new vegetable to your "
                "rotation this week just for variety."
            )

        # --- Lifestyle changes (activity + goal aware) ---
        if stats.avg_active_minutes is not None and stats.avg_active_minutes < goal_active_minutes:
            lifestyle_changes.append(
                f"Aim for a 10-minute walk after one meal a day to build toward your "
                f"{goal_active_minutes:.0f}-active-minute goal."
            )

        if not lifestyle_changes:
            lifestyle_changes.append(
                "Your activity levels look solid -- try a 5-minute stretch or "
                "breathing break to support recovery."
            )

        headline = f"Solid week, {user_name} -- here's what stood out."
        wins_sentence = ". ".join(key_wins[:2])
        positive_reinforcement = (
            f"{user_name}, this week's numbers show real consistency: "
            f"{wins_sentence}. Small, steady habits like these compound over time, "
            "and you're building them."
        )

        return AdviceContent(
            headline=headline,
            positive_reinforcement=positive_reinforcement,
            key_wins=key_wins,
            diet_changes=diet_changes,
            lifestyle_changes=lifestyle_changes,
        )