import pytest

from app.errors import LLMInvalidOutputError
from app.schemas.customize import LLMCustomization
from app.services.json_schema import to_llm_schema
from app.services.structured_output import generate_structured, strip_code_fences
from tests.factories import customization_payload
from tests.fakes import FakeLLM

SYSTEM = "system"
USER = "user prompt"


async def test_returns_valid_output_without_repair() -> None:
    llm = FakeLLM([customization_payload()])
    result = await generate_structured(llm, SYSTEM, USER, LLMCustomization)
    assert result.scores.match_score == 78
    assert len(llm.requests) == 1


async def test_repairs_invalid_output_once() -> None:
    llm = FakeLLM(['{"original": "not an object"}', customization_payload()])
    result = await generate_structured(llm, SYSTEM, USER, LLMCustomization)
    assert result.tailored.summary.startswith("Senior backend engineer")
    assert len(llm.requests) == 2
    repair_prompt = llm.requests[1].user
    assert USER in repair_prompt
    assert "original" in repair_prompt
    assert '"not an object"' in repair_prompt


async def test_raises_after_failed_repair() -> None:
    llm = FakeLLM(["not json", "still not json"])
    with pytest.raises(LLMInvalidOutputError):
        await generate_structured(llm, SYSTEM, USER, LLMCustomization)


async def test_rejects_out_of_range_scores() -> None:
    bad = customization_payload().replace('"match_score": 78', '"match_score": 140')
    llm = FakeLLM([bad, bad])
    with pytest.raises(LLMInvalidOutputError):
        await generate_structured(llm, SYSTEM, USER, LLMCustomization)


async def test_replaces_ats_unfriendly_hyphens_and_spaces() -> None:
    payload = customization_payload().replace(
        "Senior backend engineer", "Senior\u00a0back\u2011end engineer"
    )
    result = await generate_structured(FakeLLM([payload]), SYSTEM, USER, LLMCustomization)
    assert result.tailored.summary.startswith("Senior back-end engineer")


async def test_joins_figures_split_by_narrow_spaces() -> None:
    payload = customization_payload().replace(
        "scaling APIs.", "scaling APIs to 2\u202fM requests, 30\u202f% cheaper, for 5\u00a0teams."
    )
    result = await generate_structured(FakeLLM([payload]), SYSTEM, USER, LLMCustomization)
    assert result.tailored.summary.endswith("to 2M requests, 30% cheaper, for 5 teams.")


def test_strip_code_fences() -> None:
    assert strip_code_fences('```json\n{"a": 1}\n```') == '{"a": 1}'
    assert strip_code_fences('  {"a": 1} ') == '{"a": 1}'


def test_llm_schema_drops_unsupported_keywords_and_requires_all_fields() -> None:
    schema = to_llm_schema(LLMCustomization.model_json_schema())
    defs = schema["$defs"]
    assert isinstance(defs, dict)
    resume = defs["ResumeContent"]
    assert isinstance(resume, dict)
    assert "maxLength" not in str(resume)
    assert "default" not in resume["properties"]["summary"]
    assert set(resume["required"]) == set(resume["properties"])
