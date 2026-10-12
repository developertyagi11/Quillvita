import re
import unicodedata

_INLINE_WHITESPACE = re.compile(r"[ \t\f\v\u00a0\u2000-\u200b\u202f\u205f\u3000]+")
_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0e-\x1f\x7f]")
_EXCESS_BLANK_LINES = re.compile(r"\n{3,}")
_BULLET_GLYPHS = re.compile(r"^[\u2022\u25cf\u25aa\u25e6\u2023\u2043\uf0b7\uf0a7]\s*")


def normalize_text(raw: str) -> str:
    """Collapse noisy whitespace from PDF/DOCX extraction while keeping line structure."""
    text = unicodedata.normalize("NFKC", raw)
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = _CONTROL_CHARS.sub("", text)
    lines = []
    for line in text.split("\n"):
        cleaned = _INLINE_WHITESPACE.sub(" ", line).strip()
        lines.append(_BULLET_GLYPHS.sub("- ", cleaned))
    return _EXCESS_BLANK_LINES.sub("\n\n", "\n".join(lines)).strip()
