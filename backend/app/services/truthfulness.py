"""Code-level truthfulness checks that hold no matter which LLM produced the output.

Tool and product names from the job description, seniority words, and the model's own "missing
keyword" list must not appear in the tailored resume unless the original resume already mentions
them. Neither may vague magnitudes ("millions") that round a real figure. Offending sections are
reverted to the original wording.

Ordinary capitalized words (headings such as "Key Responsibilities", job titles, "What We Are
Looking For") are not treated as names: a term counts only when it is shaped like a product name
("GitLab", "EC2", "Node.js", "AWS") or appears as an item in a list of names ("Selenium,
Playwright, or Cypress").
"""

import logging
import re
from collections.abc import Iterable, Sequence

from app.schemas.customize import ChangeEntry, SuggestedKeyword
from app.schemas.resume import ResumeContent

logger = logging.getLogger(__name__)

_SENTENCE_BREAK = re.compile(r"(?<=[.!?:;])\s+|\n+")
_MISSING_SPACE = re.compile(r"(?<=[a-z]{3})\.(?=[A-Z][a-z])")
_WORD = re.compile(r"[A-Za-z][A-Za-z0-9+#]*(?:[.\-][A-Za-z0-9+#]+)*")
_LIST_SEPARATOR = re.compile(r",\s*(?:(?:and|or)\s+)?|\s+(?:and|or)\s+")
_KEYWORD_SEPARATOR = re.compile(r"[(),;]|\s+(?:and|or)\s+")
_VAGUE_MAGNITUDES = frozenset({"hundreds", "thousands", "millions", "billions"})
_SENIORITY_WORDS = frozenset({"senior", "lead", "principal", "staff", "head", "expert", "chief"})
MAX_ACRONYM_LETTERS = 6
_SHOUTED_WORDS = frozenset(
    {
        "AND",
        "ARE",
        "FOR",
        "HAVE",
        "MUST",
        "NICE",
        "NOT",
        "ONLY",
        "OUR",
        "PLUS",
        "THE",
        "WILL",
        "YOU",
    }
)
# A resume that names the right-hand side demonstrates the left-hand concept.
_EQUIVALENTS: dict[str, tuple[str, ...]] = {
    "sql": ("mysql", "postgresql", "postgres", "sqlite", "mssql", "sql server", "mariadb"),
    "nosql": ("mongodb", "dynamodb", "firestore", "firebase", "cassandra", "couchdb", "redis"),
    "rest": ("restful",),
    "postgresql": ("postgres",),
    "postgres": ("postgresql",),
    "javascript": ("js", "es6"),
    "js": ("javascript",),
}


def _is_product_shaped(word: str) -> bool:
    """Inner capitals, digits or symbols: "GitLab", "EC2", "Node.js", "C++", "AWS"."""
    if len(word) < 2 or word in _SHOUTED_WORDS:
        return False
    if any(char.isdigit() or char in "+#." for char in word):
        return True
    if word.isupper():
        return len(word) <= MAX_ACRONYM_LETTERS
    return any(char.isupper() for char in word[1:])


def _listed_names(sentence: str) -> set[str]:
    """Single capitalized words used as items of a list ("React, Vue, or Angular")."""
    items = [item for item in _LIST_SEPARATOR.split(sentence) if item.strip()]
    names: set[str] = set()
    for item in items:
        words = _WORD.findall(item)
        if not words or not words[-1][0].isupper():
            continue
        if len(words) > 1 and words[-2][0].isupper():
            continue
        names.add(words[-1])
    return names if len(names) > 1 else set()


def _named_terms(job_description: str) -> set[str]:
    terms: set[str] = set()
    for sentence in _SENTENCE_BREAK.split(_MISSING_SPACE.sub(". ", job_description)):
        if not sentence.strip():
            continue
        sentence = sentence[:1].lower() + sentence[1:]
        terms.update(
            word.casefold() for word in _WORD.findall(sentence) if _is_product_shaped(word)
        )
        terms.update(name.casefold() for name in _listed_names(sentence))
    folded = job_description.casefold()
    terms.update(word for word in _SENIORITY_WORDS if _mentions(folded, word))
    return terms


def _keyword_terms(keywords: Sequence[SuggestedKeyword]) -> set[str]:
    """Each missing keyword plus the names inside it ("Testing tools (Cypress, Jest)")."""
    terms: set[str] = set()
    for keyword in keywords:
        terms.add(keyword.keyword.strip().casefold())
        terms.update(
            piece.strip().casefold()
            for piece in _KEYWORD_SEPARATOR.split(keyword.keyword)
            if piece.strip()
        )
    return terms


def _mentions(text: str, term: str) -> bool:
    return re.search(rf"(?<![a-z0-9]){re.escape(term)}(?![a-z0-9])", text.casefold()) is not None


def _is_supported(resume_text: str, term: str) -> bool:
    """The resume names the term, a versioned form of it ("HTML5") or an equivalent ("MySQL")."""
    pattern = rf"(?<![a-z0-9]){re.escape(term)}(?:\d+(?:\.\d+)*)?(?![a-z0-9])"
    if re.search(pattern, resume_text.casefold()):
        return True
    return any(_mentions(resume_text, other) for other in _EQUIVALENTS.get(term, ()))


def unsupported_terms(
    job_description: str, keywords: Sequence[SuggestedKeyword], resume_text: str
) -> set[str]:
    candidates = _named_terms(job_description) | _keyword_terms(keywords) | _VAGUE_MAGNITUDES
    return {term for term in candidates if term and not _is_supported(resume_text, term)}


def _is_unsafe(texts: Iterable[str], terms: set[str]) -> bool:
    return any(_mentions(text, term) for text in texts for term in terms)


def revert_unsupported_claims(
    original: ResumeContent, tailored: ResumeContent, terms: set[str]
) -> ResumeContent:
    if not terms:
        return tailored
    summary = original.summary if _is_unsafe([tailored.summary], terms) else tailored.summary
    originals_by_role = {(job.title, job.company): job for job in original.experience}
    experience = [
        originals_by_role.get((job.title, job.company), job.model_copy(update={"bullets": []}))
        if _is_unsafe(job.bullets, terms)
        else job
        for job in tailored.experience
    ]
    originals_by_name = {project.name: project for project in original.projects}
    projects = [
        originals_by_name.get(
            project.name, project.model_copy(update={"description": "", "bullets": []})
        )
        if _is_unsafe([project.description, *project.bullets], terms)
        else project
        for project in tailored.projects
    ]
    reverted = (
        (summary != tailored.summary)
        + sum(new is not old for new, old in zip(experience, tailored.experience, strict=True))
        + sum(new is not old for new, old in zip(projects, tailored.projects, strict=True))
    )
    if reverted:
        logger.warning("Reverted %d section(s) that claimed skills not in the resume", reverted)
    return tailored.model_copy(
        update={"summary": summary, "experience": experience, "projects": projects}
    )


def drop_present_keywords(
    keywords: Sequence[SuggestedKeyword], resume_text: str
) -> list[SuggestedKeyword]:
    """A "missing" keyword that the resume or a user-confirmed skill already names is dropped."""
    return [k for k in keywords if not _is_supported(resume_text, k.keyword.strip().casefold())]


def drop_unsupported_changes(changes: Sequence[ChangeEntry], terms: set[str]) -> list[ChangeEntry]:
    return [change for change in changes if not _is_unsafe([change.after], terms)]
