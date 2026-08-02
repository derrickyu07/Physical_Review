"""Demo entry point for the weekly health report service.

Usage:
    python main.py            # uses rule-based advisor (no API key needed)
    python main.py --openai   # uses OpenAI (requires OPENAI_API_KEY env var)

This mirrors how you'd wire the service into a real app: fetch/parse data
from your health API, hand it to WeeklyHealthReportService, get a PDF path
back.
"""

from __future__ import annotations

import argparse
import os

from dotenv import load_dotenv

from health_report import (
    OpenAIAdvisor,
    RuleBasedAdvisor,
    WeeklyHealthReportService,
    build_weekly_health_data,
)
from health_report.sample_data import SAMPLE_API_RESPONSE, SAMPLE_GOALS


def main() -> None:
    load_dotenv()

    parser = argparse.ArgumentParser(description="Generate a weekly health summary PDF.")
    parser.add_argument(
        "--openai",
        action="store_true",
        help="Use the OpenAI-backed advisor instead of the rule-based one.",
    )
    parser.add_argument("--user", default="Derrick", help="Name to put on the report.")
    parser.add_argument(
        "--output-dir", default="reports", help="Directory to write the PDF into."
    )
    args = parser.parse_args()

    # In a real integration, replace SAMPLE_API_RESPONSE with the JSON list
    # you get back from your fitness/health API of choice.
    weekly_data = build_weekly_health_data(
        user_name=args.user,
        records=SAMPLE_API_RESPONSE,
        goals=SAMPLE_GOALS,
    )

    if args.openai:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise SystemExit(
                "OPENAI_API_KEY is not set. Add it to a .env file or export it, "
                "or run without --openai to use the rule-based advisor."
            )
        advisor = OpenAIAdvisor(api_key=api_key)
    else:
        advisor = RuleBasedAdvisor()

    service = WeeklyHealthReportService(advisor=advisor, output_dir=args.output_dir)
    pdf_path = service.generate(weekly_data)

    print(f"Report generated: {pdf_path.resolve()}")


if __name__ == "__main__":
    main()