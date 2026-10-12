"""Request JSON from an LLM, validate it against a Pydantic model, and repair once if needed."""

import json
import logging
import re
from typing import TypeVar

from pydantic import BaseModel, ValidationError

from app.errors import LLMInvalidOutputError
from app.services.json_schema import to_llm_schema
from app.services.llm.base import LLMClient
from app.services.prompts import build_repair_prompt

logger = logging.getLogger(__name__)

ModelT = TypeVar("ModelT", bound=BaseModel)

MAX_REPORTED_ERRORS = 10
_CODE_FENCE = re.compile(r"^\s*```(?:json)?\s*(?P<body>.*?)\s*```\s*$", re.DOTALL)
# Some models emit non-breaking hyphens and spaces, which many ATS parsers mishandle.
_ATS_SAFE_CHARACTERS = str.maketrans(
    {"\u2010": "-", "\u2011": "-", "\u00a0": " ", "\u2007": " ", "\u2009": " ", "\u202f": " "}
)
_SPACE_INSIDE_FIGURE = re.compile(r"(?<=\d)[\u00a0\u2009\u202f](?=[%KMBkmb](?![A-Za-z]))")

INVALID_OUTPUT_MESSAGE = (
    "The AI returned a response we couldn't use. Please try again; "
    "if it keeps happening, shorten the job description."
)


def strip_code_fences(raw: str) -> str:
    match = _CODE_FENCE.match(raw)
    return match.group("body") if match else raw.strip()


def parse_model_output(raw: str, model: type[ModelT]) -> ModelT:
    text = _SPACE_INSIDE_FIGURE.sub("", strip_code_fences(raw))
    return model.model_validate_json(text.translate(_ATS_SAFE_CHARACTERS))


def describe_validation_error(error: ValidationError) -> str:
    lines = []
    for issue in error.errors()[:MAX_REPORTED_ERRORS]:
        location = ".".join(str(part) for part in issue["loc"]) or "(root)"
        lines.append(f"- {location}: {issue['msg']}")
    return "\n".join(lines)


async def generate_structured(
    llm: LLMClient, system_prompt: str, user_prompt: str, model: type[ModelT]
) -> ModelT:
    schema = to_llm_schema(model.model_json_schema())
    first_raw = await llm.generate_json(system_prompt, user_prompt, schema=schema)
    try:
        return parse_model_output(first_raw, model)
    except ValidationError as first_error:
        problems = describe_validation_error(first_error)
        logger.warning("LLM output failed validation, retrying with repair prompt:\n%s", problems)

    repair_prompt = build_repair_prompt(
        original_prompt=user_prompt,
        previous_output=first_raw,
        problems=problems,
        schema_json=json.dumps(schema, separators=(",", ":")),
    )
    second_raw = await llm.generate_json(system_prompt, repair_prompt, schema=schema)
    try:
        return parse_model_output(second_raw, model)
    except ValidationError as second_error:
        logger.error(
            "LLM output failed validation after repair:\n%s",
            describe_validation_error(second_error),
        )
        raise LLMInvalidOutputError(INVALID_OUTPUT_MESSAGE) from second_error
