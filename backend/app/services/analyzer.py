from app.services.pipeline import run_analysis_pipeline


def analyze_text(text: str):
    return run_analysis_pipeline(text)