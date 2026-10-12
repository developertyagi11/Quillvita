"""Convert Pydantic JSON schemas into the subset accepted by structured-output LLM APIs."""

from collections.abc import Mapping

SUPPORTED_KEYWORDS = frozenset(
    {
        "$defs",
        "$ref",
        "type",
        "format",
        "title",
        "description",
        "enum",
        "items",
        "prefixItems",
        "minItems",
        "maxItems",
        "minimum",
        "maximum",
        "anyOf",
        "oneOf",
        "properties",
        "additionalProperties",
        "required",
    }
)
_NAMED_SCHEMA_MAPS = frozenset({"properties", "$defs"})
_NESTED_SCHEMAS = frozenset({"items", "additionalProperties"})
_SCHEMA_LISTS = frozenset({"anyOf", "oneOf", "prefixItems"})
_DEFS_PREFIX = "#/$defs/"


def _sanitize_node(node: object) -> object:
    if not isinstance(node, Mapping):
        return node

    result: dict[str, object] = {}
    for key, value in node.items():
        if not isinstance(key, str) or key not in SUPPORTED_KEYWORDS:
            continue
        if key in _NAMED_SCHEMA_MAPS and isinstance(value, Mapping):
            result[key] = {str(name): _sanitize_node(child) for name, child in value.items()}
        elif key in _NESTED_SCHEMAS:
            result[key] = _sanitize_node(value)
        elif key in _SCHEMA_LISTS and isinstance(value, list):
            result[key] = [_sanitize_node(child) for child in value]
        else:
            result[key] = value

    properties = result.get("properties")
    if isinstance(properties, Mapping):
        # Requiring every key makes models emit "" / [] instead of silently dropping fields.
        result["required"] = list(properties.keys())
    return result


def to_llm_schema(schema: Mapping[str, object]) -> dict[str, object]:
    sanitized = _sanitize_node(schema)
    return dict(sanitized) if isinstance(sanitized, Mapping) else {}


def to_strict_schema(schema: Mapping[str, object]) -> dict[str, object]:
    """Inline `$ref`s and close every object, as strict constrained decoding requires."""
    definitions = schema.get("$defs")
    defs = definitions if isinstance(definitions, Mapping) else {}
    strict = _close_node(schema, defs)
    return dict(strict) if isinstance(strict, Mapping) else {}


def _close_node(node: object, defs: Mapping[str, object]) -> object:
    if isinstance(node, list):
        return [_close_node(child, defs) for child in node]
    if not isinstance(node, Mapping):
        return node

    reference = node.get("$ref")
    if isinstance(reference, str) and reference.startswith(_DEFS_PREFIX):
        return _close_node(defs.get(reference.removeprefix(_DEFS_PREFIX), {}), defs)

    result: dict[str, object] = {}
    for key, value in node.items():
        if key == "$defs":
            continue
        if key in _NAMED_SCHEMA_MAPS and isinstance(value, Mapping):
            result[str(key)] = {
                str(name): _close_node(child, defs) for name, child in value.items()
            }
        else:
            result[str(key)] = _close_node(value, defs)
    if result.get("type") == "object":
        result["additionalProperties"] = False
    return result
