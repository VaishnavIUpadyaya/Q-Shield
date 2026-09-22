
# import base64
# import json
# from pathlib import Path
# from typing import Optional, Union

# from fastapi import (
#     APIRouter,
#     File,
#     Form,
#     HTTPException,
#     Request,
#     UploadFile,
#     status,
# )
# from fastapi.responses import FileResponse

# from backend.schemas import (
#     DocumentHashResponse,
#     DocumentSignRequest,
#     DocumentSignResponse,
#     DocumentVerifyRequest,
#     DocumentVerifyResponse,
# )
# from quantum.document_hasher import hash_and_chunk_document
# from quantum.protocol import (
#     sign_document_payload,
#     verify_document_payload,
# )
# from certificates.verification_certificate import (
#     export_verification_certificate,
# )


# router = APIRouter(
#     prefix="/documents",
#     tags=["Documents"],
# )


# @router.post(
#     "/hash",
#     response_model=DocumentHashResponse,
#     summary="Compute document SHA-256 and 2-bit quantum block partition",
# )
# async def hash_document_endpoint(
#     request: Request,
#     file: Optional[UploadFile] = File(None),
#     document_text: Optional[str] = Form(None),
#     document_base64: Optional[str] = Form(None),
# ):
#     """
#     Compute cryptographic SHA-256 digest and partition
#     into quantum blocks.
#     """

#     try:
#         content_type = request.headers.get(
#             "content-type",
#             "",
#         )

#         content = None

#         if "application/json" in content_type:
#             try:
#                 body = await request.json()
#             except Exception:
#                 body = {}

#             if body.get("document_base64"):
#                 content = base64.b64decode(
#                     body["document_base64"]
#                 )
#             elif body.get("document_text"):
#                 content = body["document_text"].encode(
#                     "utf-8"
#                 )

#         elif file is not None:
#             content = await file.read()

#         elif document_base64 is not None:
#             content = base64.b64decode(
#                 document_base64
#             )

#         elif document_text is not None:
#             content = document_text.encode("utf-8")

#         else:
#             try:
#                 form = await request.form()

#                 if "file" in form and form["file"]:
#                     file_item = form["file"]

#                     if hasattr(file_item, "read"):
#                         content = await file_item.read()

#                 elif "document_text" in form:
#                     content = str(
#                         form["document_text"]
#                     ).encode("utf-8")

#                 elif "document_base64" in form:
#                     content = base64.b64decode(
#                         str(form["document_base64"])
#                     )

#             except Exception:
#                 pass

#         if content is None:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail=(
#                     "Must provide a file upload, "
#                     "document_text, or document_base64"
#                 ),
#             )

#         doc_hash, chunks = hash_and_chunk_document(
#             content
#         )

#         return DocumentHashResponse(
#             document_hash=doc_hash,
#             total_blocks=len(chunks),
#             chunks=chunks,
#         )

#     except HTTPException:
#         raise

#     except Exception as exc:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail=f"Hashing error: {str(exc)}",
#         )


# @router.post(
#     "/sign",
#     response_model=DocumentSignResponse,
#     summary=(
#         "Sign a document payload using Xu-Wang QDS "
#         "across quantum blocks"
#     ),
# )
# async def sign_document(
#     request: Request,
#     file: Optional[UploadFile] = File(None),
#     signer_id: Optional[str] = Form(None),
# ):
#     """
#     Compute the SHA-256 digest of an uploaded file or text
#     and sign it using the Xu-Wang QDS protocol.
#     """

#     try:
#         content_type = request.headers.get(
#             "content-type",
#             "",
#         )

#         actual_signer = "Alice"
#         content: Union[bytes, str] = b""

#         if "application/json" in content_type:
#             try:
#                 body = await request.json()
#             except Exception as exc:
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail=f"Invalid JSON payload: {str(exc)}",
#                 )

#             if not body:
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail="Empty JSON body",
#                 )

#             req = DocumentSignRequest(**body)

#             actual_signer = req.signer_id or "Alice"

#             if req.document_base64:
#                 content = base64.b64decode(
#                     req.document_base64
#                 )

#             elif req.document_text:
#                 content = req.document_text.encode(
#                     "utf-8"
#                 )

#             elif req.document_hash:
#                 content = req.document_hash

#             else:
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail=(
#                         "Must provide document_base64, "
#                         "document_text, or document_hash"
#                     ),
#                 )

#         elif (
#             "multipart/form-data" in content_type
#             or file is not None
#         ):
#             if file is None:
#                 form = await request.form()

#                 file_item = form.get("file")

#                 if (
#                     file_item is not None
#                     and hasattr(file_item, "read")
#                 ):
#                     content = await file_item.read()

#                 signer_form = form.get("signer_id")

#                 if signer_form:
#                     actual_signer = str(signer_form)

#             else:
#                 content = await file.read()

#                 if signer_id:
#                     actual_signer = signer_id

#             if not content:
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail=(
#                         "Uploaded file is empty or missing"
#                     ),
#                 )

#         else:
#             try:
#                 body = await request.json()

#                 req = DocumentSignRequest(**body)

#                 actual_signer = req.signer_id or "Alice"

#                 if req.document_base64:
#                     content = base64.b64decode(
#                         req.document_base64
#                     )

#                 elif req.document_text:
#                     content = req.document_text.encode(
#                         "utf-8"
#                     )

#                 elif req.document_hash:
#                     content = req.document_hash

#                 else:
#                     raise ValueError(
#                         "No valid document field in body"
#                     )

#             except Exception:
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail=(
#                         "No document payload provided "
#                         "for signing"
#                     ),
#                 )

#         signature = sign_document_payload(
#             content,
#             signer_id=actual_signer,
#         )

#         sig_dict = signature.to_dict()

#         return DocumentSignResponse(
#             document_hash=sig_dict["document_hash"],
#             signer_id=sig_dict["signer_id"],
#             total_blocks=sig_dict["total_blocks"],
#             quantum_seal=sig_dict["quantum_seal"],
#             created_at=sig_dict["created_at"],
#             signatures=sig_dict["signatures"],
#             status="signed",
#         )

#     except HTTPException:
#         raise

#     except Exception as exc:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail=f"Document signing failed: {str(exc)}",
#         )


# @router.post(
#     "/verify",
#     response_model=DocumentVerifyResponse,
#     summary=(
#         "Measure and verify multi-block QDS "
#         "state projections against a document"
#     ),
# )
# async def verify_document(
#     request: Request,
#     file: Optional[UploadFile] = File(None),
#     signature_json: Optional[str] = Form(None),
#     shots: Optional[int] = Form(100),
# ):
#     """
#     Verify a multi-block quantum seal against a document
#     or document hash.
#     """

#     try:
#         content_type = request.headers.get(
#             "content-type",
#             "",
#         )

#         content_to_verify: Union[bytes, str] = b""
#         sig_data: dict = {}
#         actual_shots: int = 100

#         if "application/json" in content_type:
#             try:
#                 body = await request.json()
#             except Exception as exc:
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail=f"Invalid JSON payload: {str(exc)}",
#                 )

#             if not body:
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail="Empty JSON payload",
#                 )

#             req = DocumentVerifyRequest(**body)

#             actual_shots = req.shots
#             sig_data = req.quantum_signature

#             if req.document_base64:
#                 content_to_verify = base64.b64decode(
#                     req.document_base64
#                 )

#             elif req.document_text:
#                 content_to_verify = req.document_text.encode(
#                     "utf-8"
#                 )

#             elif req.document_hash:
#                 content_to_verify = req.document_hash

#             else:
#                 content_to_verify = sig_data.get(
#                     "document_hash",
#                     "",
#                 )

#                 if not content_to_verify:
#                     raise HTTPException(
#                         status_code=status.HTTP_400_BAD_REQUEST,
#                         detail=(
#                             "Must provide document_base64, "
#                             "document_text, document_hash, "
#                             "or file"
#                         ),
#                     )

#         elif (
#             "multipart/form-data" in content_type
#             or file is not None
#         ):
#             raw_sig = signature_json

#             if file is None or not raw_sig:
#                 form = await request.form()

#                 file_item = form.get("file")

#                 if (
#                     file_item is not None
#                     and hasattr(file_item, "read")
#                 ):
#                     content_to_verify = (
#                         await file_item.read()
#                     )

#                 if form.get("signature_json"):
#                     raw_sig = str(
#                         form.get("signature_json")
#                     )

#                 if form.get("shots"):
#                     actual_shots = int(
#                         form.get("shots")
#                     )

#             else:
#                 content_to_verify = await file.read()

#                 if shots is not None:
#                     actual_shots = shots

#             if not raw_sig:
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail=(
#                         "signature_json is required "
#                         "when uploading a file "
#                         "for verification"
#                     ),
#                 )

#             try:
#                 sig_data = (
#                     json.loads(raw_sig)
#                     if isinstance(raw_sig, str)
#                     else raw_sig
#                 )

#             except Exception as exc:
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail=(
#                         "Invalid JSON in signature_json: "
#                         f"{str(exc)}"
#                     ),
#                 )

#         else:
#             try:
#                 body = await request.json()

#                 req = DocumentVerifyRequest(**body)

#                 actual_shots = req.shots
#                 sig_data = req.quantum_signature

#                 if req.document_base64:
#                     content_to_verify = base64.b64decode(
#                         req.document_base64
#                     )

#                 elif req.document_text:
#                     content_to_verify = req.document_text.encode(
#                         "utf-8"
#                     )

#                 elif req.document_hash:
#                     content_to_verify = req.document_hash

#                 else:
#                     content_to_verify = sig_data.get(
#                         "document_hash",
#                         "",
#                     )

#             except Exception:
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail="No verification payload provided",
#                 )

#         verification_result = verify_document_payload(
#             document_hash=content_to_verify,
#             quantum_signature=sig_data,
#             shots=actual_shots,
#         )

#         status_str = (
#             "verified"
#             if verification_result.valid
#             else (
#                 "tampered"
#                 if verification_result.tampered
#                 else "rejected"
#             )
#         )

#         return DocumentVerifyResponse(
#             valid=verification_result.valid,
#             verification_score=(
#                 verification_result.verification_score
#             ),
#             document_hash=verification_result.document_hash,
#             total_blocks=verification_result.total_blocks,
#             valid_blocks=verification_result.valid_blocks,
#             invalid_blocks=verification_result.invalid_blocks,
#             tampered=verification_result.tampered,
#             signer_id=verification_result.signer_id,
#             status=status_str,
#             details=verification_result.details or {},
#             telemetry=verification_result.telemetry or {},
#         )

#     except HTTPException:
#         raise

#     except Exception as exc:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail=(
#                 "Document verification failed: "
#                 f"{str(exc)}"
#             ),
#         )


# @router.post(
#     "/certificate",
#     summary="Generate a downloadable verification certificate",
# )
# async def generate_certificate(
#     verification_data: dict,
# ):
#     """
#     Generate a PDF certificate from verification results.

#     The certificate is currently generated and served
#     from the local machine.
#     """

#     try:
#         output_path = export_verification_certificate(
#             verification_data
#         )

#         return FileResponse(
#             path=output_path,
#             media_type="application/pdf",
#             filename=Path(output_path).name,
#         )

#     except Exception as exc:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=(
#                 "Certificate generation failed: "
#                 f"{str(exc)}"
#             ),
#         )


import base64
import json
import logging
from pathlib import Path
from typing import Optional, Union
from uuid import uuid4

from fastapi import (
    APIRouter,
    File,
    Form,
    HTTPException,
    Request,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse

from backend.schemas import (
    DocumentHashResponse,
    DocumentSignRequest,
    DocumentSignResponse,
    DocumentVerifyRequest,
    DocumentVerifyResponse,
)

from quantum.document_hasher import hash_and_chunk_document

from quantum.protocol import (
    sign_document_payload,
    verify_document_payload,
)

from certificates.verification_certificate import (
    export_verification_certificate,
)

from experiments.firestore_storage import (
    save_audit_event,
    save_signed_document,
)


# ---------------------------------------------------------
# Router configuration
# ---------------------------------------------------------

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


logger = logging.getLogger(__name__)


# ---------------------------------------------------------
# Firestore helper
# ---------------------------------------------------------

def _save_firestore_safely(
    save_function,
    data: dict,
) -> None:
    """
    Save data to Firestore without breaking the API
    if Firebase is unavailable.
    """

    try:
        save_function(data)

    except Exception as exc:
        logger.warning(
            "Firestore logging failed: %s",
            exc,
        )


# ---------------------------------------------------------
# HASH DOCUMENT
# ---------------------------------------------------------

@router.post(
    "/hash",
    response_model=DocumentHashResponse,
    summary=(
        "Compute document SHA-256 and "
        "2-bit quantum block partition"
    ),
)
async def hash_document_endpoint(
    request: Request,
    file: Optional[UploadFile] = File(None),
    document_text: Optional[str] = Form(None),
    document_base64: Optional[str] = Form(None),
):
    """
    Compute cryptographic SHA-256 digest and partition
    into quantum blocks.
    """

    try:
        content_type = request.headers.get(
            "content-type",
            "",
        )

        content = None

        # JSON request
        if "application/json" in content_type:
            try:
                body = await request.json()

            except Exception:
                body = {}

            if body.get("document_base64"):
                content = base64.b64decode(
                    body["document_base64"]
                )

            elif body.get("document_text"):
                content = body["document_text"].encode(
                    "utf-8"
                )

        # Uploaded file
        elif file is not None:
            content = await file.read()

        # Form base64 content
        elif document_base64 is not None:
            content = base64.b64decode(
                document_base64
            )

        # Form text content
        elif document_text is not None:
            content = document_text.encode(
                "utf-8"
            )

        # Fallback form parsing
        else:
            try:
                form = await request.form()

                if "file" in form and form["file"]:
                    file_item = form["file"]

                    if hasattr(file_item, "read"):
                        content = await file_item.read()

                elif "document_text" in form:
                    content = str(
                        form["document_text"]
                    ).encode("utf-8")

                elif "document_base64" in form:
                    content = base64.b64decode(
                        str(form["document_base64"])
                    )

            except Exception:
                pass

        if content is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Must provide a file upload, "
                    "document_text, or document_base64"
                ),
            )

        doc_hash, chunks = hash_and_chunk_document(
            content
        )

        return DocumentHashResponse(
            document_hash=doc_hash,
            total_blocks=len(chunks),
            chunks=chunks,
        )

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Hashing error: {str(exc)}",
        )


# ---------------------------------------------------------
# SIGN DOCUMENT
# ---------------------------------------------------------

@router.post(
    "/sign",
    response_model=DocumentSignResponse,
    summary=(
        "Sign a document payload using Xu-Wang QDS "
        "across quantum blocks"
    ),
)
async def sign_document(
    request: Request,
    file: Optional[UploadFile] = File(None),
    signer_id: Optional[str] = Form(None),
):
    """
    Compute the SHA-256 digest of an uploaded file or text
    and sign it using the Xu-Wang QDS protocol.

    After signing, the signed document metadata is saved
    to Firestore when Firebase is available.
    """

    try:
        content_type = request.headers.get(
            "content-type",
            "",
        )

        actual_signer = "Alice"
        content: Union[bytes, str] = b""

        # JSON request
        if "application/json" in content_type:
            try:
                body = await request.json()

            except Exception as exc:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Invalid JSON payload: {str(exc)}"
                    ),
                )

            if not body:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Empty JSON body",
                )

            req = DocumentSignRequest(**body)

            actual_signer = req.signer_id or "Alice"

            if req.document_base64:
                content = base64.b64decode(
                    req.document_base64
                )

            elif req.document_text:
                content = req.document_text.encode(
                    "utf-8"
                )

            elif req.document_hash:
                content = req.document_hash

            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Must provide document_base64, "
                        "document_text, or document_hash"
                    ),
                )

        # Multipart file request
        elif (
            "multipart/form-data" in content_type
            or file is not None
        ):
            if file is None:
                form = await request.form()

                file_item = form.get("file")

                if (
                    file_item is not None
                    and hasattr(file_item, "read")
                ):
                    content = await file_item.read()

                signer_form = form.get("signer_id")

                if signer_form:
                    actual_signer = str(
                        signer_form
                    )

            else:
                content = await file.read()

                if signer_id:
                    actual_signer = signer_id

            if not content:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Uploaded file is empty or missing"
                    ),
                )

        # Fallback JSON request
        else:
            try:
                body = await request.json()

                req = DocumentSignRequest(**body)

                actual_signer = req.signer_id or "Alice"

                if req.document_base64:
                    content = base64.b64decode(
                        req.document_base64
                    )

                elif req.document_text:
                    content = req.document_text.encode(
                        "utf-8"
                    )

                elif req.document_hash:
                    content = req.document_hash

                else:
                    raise ValueError(
                        "No valid document field in body"
                    )

            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "No document payload provided "
                        "for signing"
                    ),
                )

        # Generate the quantum signature
        signature = sign_document_payload(
            content,
            signer_id=actual_signer,
        )

        sig_dict = signature.to_dict()

        # -------------------------------------------------
        # Save signed document to Firestore
        # -------------------------------------------------

        document_id = sig_dict["document_hash"]

        signed_document_record = {
            "document_id": document_id,
            "document_hash": sig_dict["document_hash"],
            "signer_id": sig_dict["signer_id"],
            "total_blocks": sig_dict["total_blocks"],
            "quantum_seal": sig_dict["quantum_seal"],
            "signatures": sig_dict["signatures"],
            "created_at": sig_dict["created_at"],
            "status": "signed",
        }

        _save_firestore_safely(
            save_signed_document,
            signed_document_record,
        )

        # Return the signing response
        return DocumentSignResponse(
            document_hash=sig_dict["document_hash"],
            signer_id=sig_dict["signer_id"],
            total_blocks=sig_dict["total_blocks"],
            quantum_seal=sig_dict["quantum_seal"],
            created_at=sig_dict["created_at"],
            signatures=sig_dict["signatures"],
            status="signed",
        )

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Document signing failed: {str(exc)}"
            ),
        )


# ---------------------------------------------------------
# VERIFY DOCUMENT
# ---------------------------------------------------------

@router.post(
    "/verify",
    response_model=DocumentVerifyResponse,
    summary=(
        "Measure and verify multi-block QDS "
        "state projections against a document"
    ),
)
async def verify_document(
    request: Request,
    file: Optional[UploadFile] = File(None),
    signature_json: Optional[str] = Form(None),
    shots: Optional[int] = Form(100),
):
    """
    Verify a multi-block quantum seal against a document
    or document hash.

    Verification results are logged to Firestore when
    Firebase is available.
    """

    try:
        content_type = request.headers.get(
            "content-type",
            "",
        )

        content_to_verify: Union[bytes, str] = b""
        sig_data: dict = {}
        actual_shots: int = 100

        # JSON request
        if "application/json" in content_type:
            try:
                body = await request.json()

            except Exception as exc:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Invalid JSON payload: {str(exc)}"
                    ),
                )

            if not body:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Empty JSON payload",
                )

            req = DocumentVerifyRequest(**body)

            actual_shots = req.shots
            sig_data = req.quantum_signature

            if req.document_base64:
                content_to_verify = base64.b64decode(
                    req.document_base64
                )

            elif req.document_text:
                content_to_verify = req.document_text.encode(
                    "utf-8"
                )

            elif req.document_hash:
                content_to_verify = req.document_hash

            else:
                content_to_verify = sig_data.get(
                    "document_hash",
                    "",
                )

                if not content_to_verify:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            "Must provide document_base64, "
                            "document_text, document_hash, "
                            "or file"
                        ),
                    )

        # Multipart request
        elif (
            "multipart/form-data" in content_type
            or file is not None
        ):
            raw_sig = signature_json

            if file is None or not raw_sig:
                form = await request.form()

                file_item = form.get("file")

                if (
                    file_item is not None
                    and hasattr(file_item, "read")
                ):
                    content_to_verify = (
                        await file_item.read()
                    )

                if form.get("signature_json"):
                    raw_sig = str(
                        form.get("signature_json")
                    )

                if form.get("shots"):
                    actual_shots = int(
                        form.get("shots")
                    )

            else:
                content_to_verify = await file.read()

                if shots is not None:
                    actual_shots = shots

            if not raw_sig:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "signature_json is required "
                        "when uploading a file "
                        "for verification"
                    ),
                )

            try:
                sig_data = (
                    json.loads(raw_sig)
                    if isinstance(raw_sig, str)
                    else raw_sig
                )

            except Exception as exc:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Invalid JSON in signature_json: "
                        f"{str(exc)}"
                    ),
                )

        # Fallback JSON request
        else:
            try:
                body = await request.json()

                req = DocumentVerifyRequest(**body)

                actual_shots = req.shots
                sig_data = req.quantum_signature

                if req.document_base64:
                    content_to_verify = base64.b64decode(
                        req.document_base64
                    )

                elif req.document_text:
                    content_to_verify = req.document_text.encode(
                        "utf-8"
                    )

                elif req.document_hash:
                    content_to_verify = req.document_hash

                else:
                    content_to_verify = sig_data.get(
                        "document_hash",
                        "",
                    )

            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "No verification payload provided"
                    ),
                )

        # Perform verification
        verification_result = verify_document_payload(
            document_hash=content_to_verify,
            quantum_signature=sig_data,
            shots=actual_shots,
        )

        # Determine verification status
        status_str = (
            "verified"
            if verification_result.valid
            else (
                "tampered"
                if verification_result.tampered
                else "rejected"
            )
        )

        # -------------------------------------------------
        # Save verification audit event to Firestore
        # -------------------------------------------------

        verification_event = {
            "event_id": str(uuid4()),
            "document_id": verification_result.document_hash,
            "event_type": (
                "verification_success"
                if verification_result.valid
                else (
                    "tamper_detected"
                    if verification_result.tampered
                    else "verification_rejected"
                )
            ),
            "valid": verification_result.valid,
            "verification_score": (
                verification_result.verification_score
            ),
            "total_blocks": verification_result.total_blocks,
            "valid_blocks": verification_result.valid_blocks,
            "invalid_blocks": (
                verification_result.invalid_blocks
            ),
            "tampered": verification_result.tampered,
            "signer_id": verification_result.signer_id,
            "status": status_str,
            "details": verification_result.details or {},
            "telemetry": verification_result.telemetry or {},
        }

        _save_firestore_safely(
            save_audit_event,
            verification_event,
        )

        # Return the verification response
        return DocumentVerifyResponse(
            valid=verification_result.valid,
            verification_score=(
                verification_result.verification_score
            ),
            document_hash=verification_result.document_hash,
            total_blocks=verification_result.total_blocks,
            valid_blocks=verification_result.valid_blocks,
            invalid_blocks=verification_result.invalid_blocks,
            tampered=verification_result.tampered,
            signer_id=verification_result.signer_id,
            status=status_str,
            details=verification_result.details or {},
            telemetry=verification_result.telemetry or {},
        )

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Document verification failed: "
                f"{str(exc)}"
            ),
        )


# ---------------------------------------------------------
# GENERATE VERIFICATION CERTIFICATE
# ---------------------------------------------------------

@router.post(
    "/certificate",
    summary="Generate a downloadable verification certificate",
)
async def generate_certificate(
    verification_data: dict,
):
    """
    Generate a PDF certificate from verification results.

    The certificate is currently generated and served
    from the local machine.
    """

    try:
        output_path = export_verification_certificate(
            verification_data
        )

        return FileResponse(
            path=output_path,
            media_type="application/pdf",
            filename=Path(output_path).name,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Certificate generation failed: "
                f"{str(exc)}"
            ),
        )