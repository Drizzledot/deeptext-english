import uuid
from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.services.pipeline import run_analysis_pipeline


router = APIRouter()

# MVP 阶段先保存在内存中
analysis_tasks = {}


def run_task(run_id: str, article: str):
    def update_progress(stage: str, progress: int, message: str):
        analysis_tasks[run_id].update({
            "status": "running",
            "stage": stage,
            "progress": progress,
            "message": message
        })

    try:
        result = run_analysis_pipeline(
            article,
            progress_callback=update_progress
        )

        analysis_tasks[run_id].update({
            "status": "completed",
            "stage": "completed",
            "progress": 100,
            "message": "解析完成",
            "result": result
        })

    except Exception as e:
        analysis_tasks[run_id].update({
            "status": "failed",
            "stage": "failed",
            "message": str(e)
        })


@router.post("/analyze")
def analyze(
    article: str,
    background_tasks: BackgroundTasks
):
    run_id = str(uuid.uuid4())

    analysis_tasks[run_id] = {
        "status": "queued",
        "stage": "queued",
        "progress": 5,
        "message": "任务已创建，等待开始",
        "result": None
    }

    background_tasks.add_task(
        run_task,
        run_id,
        article
    )

    return {
        "run_id": run_id,
        "status": "queued"
    }


@router.get("/analysis/{run_id}")
def get_analysis(run_id: str):
    task = analysis_tasks.get(run_id)

    if not task:
        raise HTTPException(
            status_code=404,
            detail="分析任务不存在"
        )

    return task