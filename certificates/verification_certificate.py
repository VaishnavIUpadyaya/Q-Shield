from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import qrcode
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Image,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib import colors


PROJECT_ROOT = Path(__file__).resolve().parent.parent
CERTIFICATE_DIR = PROJECT_ROOT / "dataset" / "certificates"


def export_verification_certificate(
    verification_data: dict[str, Any],
    output_path: str | Path | None = None,
) -> str:
    """
    Generate a PDF verification certificate.

    Required verification_data fields:
        document_hash
        verification_score
        timestamp

    Optional fields:
        tvd_score
        valid
        tampered
        signer_id
        document_id
    """

    if not isinstance(verification_data, dict):
        raise ValueError(
            "verification_data must be a dictionary."
        )

    document_hash = verification_data.get(
        "document_hash"
    )

    if not document_hash:
        raise ValueError(
            "verification_data must contain "
            "'document_hash'."
        )

    verification_score = verification_data.get(
        "verification_score",
        verification_data.get("tvd_score", "N/A"),
    )

    timestamp = verification_data.get(
        "timestamp",
        datetime.now(timezone.utc).isoformat(),
    )

    if output_path is None:
        CERTIFICATE_DIR.mkdir(
            parents=True,
            exist_ok=True,
        )

        document_id = verification_data.get(
            "document_id",
            "document",
        )

        timestamp_id = datetime.now(
            timezone.utc
        ).strftime("%Y%m%d%H%M%S")

        output_path = (
            CERTIFICATE_DIR
            / f"certificate_{document_id}_{timestamp_id}.pdf"
        )
    else:
        output_path = Path(output_path)
        output_path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

    output_path = output_path.resolve()

    # QR code contains certificate verification data.
    qr_payload = (
        f"Document Hash: {document_hash}\n"
        f"Verification Score: {verification_score}\n"
        f"Timestamp: {timestamp}"
    )

    qr_code = qrcode.make(qr_payload)

    qr_path = output_path.with_suffix(".png")
    qr_code.save(qr_path)

    document = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=50,
        leftMargin=50,
        topMargin=50,
        bottomMargin=50,
    )

    styles = getSampleStyleSheet()
    story = []

    title = styles["Title"]
    heading = styles["Heading2"]
    normal = styles["BodyText"]

    story.append(
        Paragraph(
            "Q-SHIELD CRYPTOGRAPHIC VERIFICATION CERTIFICATE",
            title,
        )
    )

    story.append(Spacer(1, 20))

    story.append(
        Paragraph(
            "This certificate records the result of a "
            "Q-Shield document verification operation.",
            normal,
        )
    )

    story.append(Spacer(1, 20))

    certificate_status = (
        "VALID"
        if verification_data.get("valid", False)
        else "INVALID / NOT VERIFIED"
    )

    certificate_data = [
        ["Field", "Value"],
        ["Document ID", str(
            verification_data.get("document_id", "N/A")
        )],
        ["Signer ID", str(
            verification_data.get("signer_id", "N/A")
        )],
        ["SHA-256 Document Hash", str(document_hash)],
        ["TVD / Verification Score", str(
            verification_score
        )],
        ["Verification Status", certificate_status],
        ["Tampered", str(
            verification_data.get("tampered", "N/A")
        )],
        ["Timestamp", str(timestamp)],
    ]

    table = Table(
        certificate_data,
        colWidths=[2.2 * inch, 4.2 * inch],
    )

    table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#1f2937"),
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey,
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP",
                ),
                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
            ]
        )
    )

    story.append(table)
    story.append(Spacer(1, 25))

    story.append(
        Paragraph(
            "Certificate Verification QR Code",
            heading,
        )
    )

    story.append(Spacer(1, 10))
    story.append(
        Image(
            str(qr_path),
            width=1.8 * inch,
            height=1.8 * inch,
        )
    )

    story.append(Spacer(1, 20))

    story.append(
        Paragraph(
            "This document is automatically generated by "
            "the Q-Shield verification system. The certificate "
            "should be interpreted together with the underlying "
            "verification record and audit logs.",
            normal,
        )
    )

    document.build(story)

    # Remove the temporary QR image after PDF generation.
    if qr_path.exists():
        qr_path.unlink()

    return str(output_path)