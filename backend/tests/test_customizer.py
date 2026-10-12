from app.schemas.customize import LLMCustomization, SuggestedKeyword
from app.schemas.resume import SectionName
from app.services.customizer import apply_guardrails
from app.services.truthfulness import unsupported_terms
from tests.factories import JOB_DESCRIPTION, RESUME_LINES, customization_payload

RESUME_TEXT = "Jane Doe. Python, FastAPI. Built REST APIs."
FULL_RESUME_TEXT = "\n".join(RESUME_LINES)
ALL: list[SectionName] = ["summary", "skills", "experience", "projects"]


def _result(tailored_skills: tuple[str, ...] = ("FastAPI", "Python")) -> LLMCustomization:
    return LLMCustomization.model_validate_json(customization_payload(tailored_skills))


def test_unselected_sections_are_restored_from_original() -> None:
    result = _result()
    response = apply_guardrails(result, ["skills"], RESUME_TEXT, JOB_DESCRIPTION)
    assert response.tailored.summary == result.original.summary
    assert response.tailored.skills == ["FastAPI", "Python"]
    assert [change.section for change in response.changes] == ["skills"]
    assert response.sections == ["skills"]


def test_identity_and_education_always_come_from_original() -> None:
    result = _result()
    tampered = result.model_copy(
        update={"tailored": result.tailored.model_copy(update={"name": "Someone Else"})}
    )
    response = apply_guardrails(tampered, ["summary", "skills"], RESUME_TEXT, JOB_DESCRIPTION)
    assert response.tailored.name == "Jane Doe"


def test_drops_skills_the_resume_never_mentions() -> None:
    skills = ("FastAPI", "Kubernetes", "Docker", "REST APIs", "Python")
    response = apply_guardrails(_result(skills), ["skills"], RESUME_TEXT, JOB_DESCRIPTION)
    assert response.tailored.skills == ["FastAPI", "REST APIs", "Python"]


def test_keeps_reworded_skills_whose_words_appear_in_the_resume() -> None:
    text = RESUME_TEXT + " Managed PostgreSQL databases."
    response = apply_guardrails(_result(("Postgres", "Go")), ["skills"], text, JOB_DESCRIPTION)
    assert response.tailored.skills == ["Postgres"]


def test_job_description_names_missing_from_resume_are_unsupported() -> None:
    terms = unsupported_terms(JOB_DESCRIPTION, _result().suggested_keywords, FULL_RESUME_TEXT)
    assert {"docker", "kubernetes", "postgresql"} <= terms
    assert not {"python", "fastapi", "senior", "backend"} & terms


def test_ordinary_capitalized_words_are_not_treated_as_tools() -> None:
    job = (
        "We need a Technical Executive at RevX Hospitality to build automation."
        "Key Responsibilities\n"
        "Cloud Infrastructure: Deploy apps on AWS services such as EC2, S3, Lambda, and IAM.\n"
        "Version Control: Use Git and GitHub/GitLab for collaboration.\n"
        "Preferred Qualifications\n"
        "B.Tech in Computer Science, Information Technology or equivalent.\n"
        "What We Are Looking For a fast learner who is organized."
    )
    terms = unsupported_terms(job, [], "Built apps with Git and GitHub on AWS S3.")
    assert {"ec2", "lambda", "iam", "gitlab", "revx"} <= terms
    assert (
        not {
            "technical",
            "executive",
            "hospitality",
            "automation",
            "infrastructure",
            "responsibilities",
            "qualifications",
            "information",
            "technology",
            "collaboration",
            "we",
            "are",
            "looking",
        }
        & terms
    )
    assert not any("." in term and " " not in term and term != "b.tech" for term in terms)


def test_versioned_and_equivalent_skills_count_as_present() -> None:
    job = "Use HTML, CSS, SQL and REST APIs. Familiarity with NoSQL, Vue, or Angular."
    resume = "HTML5, CSS3, MySQL, MongoDB. Engineered RESTful APIs."
    assert unsupported_terms(job, [], resume) == {"vue", "angular"} | {
        "hundreds",
        "thousands",
        "millions",
        "billions",
    }


def test_names_inside_missing_keywords_are_unsupported() -> None:
    keywords = [SuggestedKeyword(keyword="Testing tools (Cypress, Jest)", reason="")]
    terms = unsupported_terms("Write tests.", keywords, "Built React apps.")
    assert {"cypress", "jest", "testing tools"} <= terms


def test_reverts_sections_that_borrow_tools_from_the_job_description() -> None:
    result = _result()
    job = result.tailored.experience[0].model_copy(
        update={"bullets": ["Built REST APIs on Kubernetes with Docker serving 2M requests"]}
    )
    tailored = result.tailored.model_copy(
        update={"summary": "Backend engineer running Docker workloads.", "experience": [job]}
    )
    response = apply_guardrails(
        result.model_copy(update={"tailored": tailored}), ALL, FULL_RESUME_TEXT, JOB_DESCRIPTION
    )
    assert response.tailored.summary == result.original.summary
    assert response.tailored.experience == result.original.experience


def test_reverts_summary_that_rounds_a_real_metric() -> None:
    result = _result()
    tailored = result.tailored.model_copy(
        update={"summary": "Backend engineer serving millions of requests daily."}
    )
    response = apply_guardrails(
        result.model_copy(update={"tailored": tailored}), ALL, FULL_RESUME_TEXT, JOB_DESCRIPTION
    )
    assert response.tailored.summary == result.original.summary


def test_drops_changes_that_claim_unsupported_terms() -> None:
    response = apply_guardrails(_result(), ALL, RESUME_TEXT, JOB_DESCRIPTION)
    assert response.tailored.summary == "Backend engineer."
    assert [change.section for change in response.changes] == ["skills"]


def test_deduplicates_matched_skills() -> None:
    response = apply_guardrails(_result(), ["summary"], RESUME_TEXT, JOB_DESCRIPTION)
    assert response.matched_skills == ["FastAPI", "Python"]
