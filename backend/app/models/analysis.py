from pydantic import BaseModel
from typing import List


class Snapshot(BaseModel):
    content: str
    logic: str
    core_insight: str


class Logic(BaseModel):
    chain: List[str]
    hinge: str
    pattern: str


class Evidence(BaseModel):
    quote: str
    function: str


class DeepShift(BaseModel):
    type: str
    before: str
    after: str


class Teaching(BaseModel):
    must_teach: List[str]
    questions: List[str]
    transfer: str


class AnalysisResult(BaseModel):
    snapshot: Snapshot
    logic: Logic
    evidence: List[Evidence]
    deep_shift: List[DeepShift]
    teaching: Teaching