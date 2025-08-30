from ninja.errors import HttpError
from ninja import NinjaAPI
from pydantic import BaseModel
import json
from typing import Optional, Dict, List


class FieldErrorItem(BaseModel):
    message: str
    code: Optional[str] = None


class ErrorOut(BaseModel):
    detail: str
    code: Optional[int] = None
    errors: Optional[Dict[str, List[FieldErrorItem]]] = None
    fields: Optional[Dict[str, str]] = None


def _normalize_form_errors(raw: str):
    try:
        data = json.loads(raw)
    except Exception:
        return None, None
    if not isinstance(data, dict):
        return None, None
    errors, fields = {}, {}
    for field, entries in data.items():
        if not isinstance(entries, list):
            continue
        norm = []
        for e in entries:
            if isinstance(e, dict):
                msg = (e.get("message") or "").strip() or str(e)
                code = e.get("code")
            else:
                msg, code = str(e), None
            norm.append({"message": msg, "code": code})
        if norm:
            errors[field] = norm
            fields[field] = norm[0]["message"]
    return (errors or None), (fields or None)


def install_http_error_handler(api: NinjaAPI) -> None:
    @api.exception_handler(HttpError)
    def on_http_error(request, exc: HttpError):
        status = getattr(exc, "status_code", 500)
        raw_detail = getattr(exc, "message", None) or str(exc)
        errors, fields = _normalize_form_errors(str(raw_detail))
        if errors:
            return api.create_response(
                request,
                ErrorOut(
                    detail="validation_error",
                    code=status,
                    errors=errors,
                    fields=fields,
                ),
                status=status,
            )
        return api.create_response(
            request,
            ErrorOut(detail=str(raw_detail), code=status),
            status=status,
        )
