import hashlib
from io import BytesIO, IOBase
from pathlib import Path
from typing import BinaryIO, List, Tuple, Union

SUPPORTED_CHUNK_VALUES = {"00", "01", "10", "11"}
SHA256_BLOCK_COUNT = 128  # 256 bits / 2 bits per quantum block = 128 blocks
CHUNK_BUFFER_SIZE = 65536  # 64 KB streaming buffer for large documents


def compute_sha256_bytes(
    data: Union[bytes, bytearray, str, Path, BinaryIO, IOBase],
) -> bytes:
    """
    Compute the raw 32-byte SHA-256 cryptographic digest of the provided input.

    Supports:
        - bytes / bytearray
        - str: File path if existing on filesystem, else raw string encoded as UTF-8
        - Path: File path to read in buffered chunks
        - BinaryIO / IOBase: File-like stream
    """
    hasher = hashlib.sha256()

    if isinstance(data, (bytes, bytearray)):
        hasher.update(data)
    elif isinstance(data, Path):
        with open(data, "rb") as f:
            while chunk := f.read(CHUNK_BUFFER_SIZE):
                hasher.update(chunk)
    elif isinstance(data, (BinaryIO, IOBase)):
        # If seekable, remember position and reset if needed or read stream
        while chunk := data.read(CHUNK_BUFFER_SIZE):
            if isinstance(chunk, str):
                chunk = chunk.encode("utf-8")
            hasher.update(chunk)
    elif isinstance(data, str):
        path_obj = Path(data)
        if path_obj.is_file():
            with open(path_obj, "rb") as f:
                while chunk := f.read(CHUNK_BUFFER_SIZE):
                    hasher.update(chunk)
        else:
            hasher.update(data.encode("utf-8"))
    else:
        raise TypeError(f"Unsupported data type for SHA-256 computation: {type(data)}")

    return hasher.digest()


def compute_sha256(
    data: Union[bytes, bytearray, str, Path, BinaryIO, IOBase],
) -> str:
    """
    Compute the 64-character lowercase hexadecimal SHA-256 digest of the input.
    """
    digest_bytes = compute_sha256_bytes(data)
    return digest_bytes.hex()


def hash_to_2bit_chunks(hash_input: Union[str, bytes, bytearray]) -> List[str]:
    """
    Partition a 256-bit SHA-256 digest into 128 2-bit quantum blocks.

    Each 2-bit block is one of: '00', '01', '10', '11'.

    Args:
        hash_input: 64-char hexadecimal string or 32-byte binary digest.

    Returns:
        List of 128 2-bit strings.
    """
    if isinstance(hash_input, str):
        clean_hex = hash_input.strip().lower()
        if len(clean_hex) != 64:
            raise ValueError(
                f"Invalid SHA-256 hex string length: expected 64 characters, got {len(clean_hex)}"
            )
        try:
            raw_bytes = bytes.fromhex(clean_hex)
        except ValueError as err:
            raise ValueError(f"Invalid hexadecimal SHA-256 string: {err}") from err
    elif isinstance(hash_input, (bytes, bytearray)):
        if len(hash_input) != 32:
            raise ValueError(
                f"Invalid SHA-256 bytes length: expected 32 bytes (256 bits), got {len(hash_input)}"
            )
        raw_bytes = bytes(hash_input)
    else:
        raise TypeError(f"Expected str or bytes for hash_input, got {type(hash_input)}")

    chunks: List[str] = []
    for byte in raw_bytes:
        # Each byte contains 4 2-bit blocks (bits 7-6, 5-4, 3-2, 1-0)
        chunks.append(f"{(byte >> 6) & 0b11:02b}")
        chunks.append(f"{(byte >> 4) & 0b11:02b}")
        chunks.append(f"{(byte >> 2) & 0b11:02b}")
        chunks.append(f"{byte & 0b11:02b}")

    if len(chunks) != SHA256_BLOCK_COUNT:
        raise ValueError(
            f"Chunk partitioning error: produced {len(chunks)} blocks instead of {SHA256_BLOCK_COUNT}"
        )

    return chunks


def chunks_to_hash(chunks: List[str]) -> str:
    """
    Reconstruct the 64-character hexadecimal SHA-256 digest from 128 2-bit quantum blocks.

    Args:
        chunks: List of 128 2-bit strings ('00', '01', '10', '11').

    Returns:
        64-character lowercase hexadecimal string.
    """
    if len(chunks) != SHA256_BLOCK_COUNT:
        raise ValueError(
            f"Expected {SHA256_BLOCK_COUNT} 2-bit chunks, got {len(chunks)}"
        )

    raw_bytes = bytearray()
    for i in range(0, SHA256_BLOCK_COUNT, 4):
        quad = chunks[i : i + 4]
        for val in quad:
            if val not in SUPPORTED_CHUNK_VALUES:
                raise ValueError(f"Invalid 2-bit chunk value: '{val}'. Expected one of {SUPPORTED_CHUNK_VALUES}")
        
        b = (
            (int(quad[0], 2) << 6)
            | (int(quad[1], 2) << 4)
            | (int(quad[2], 2) << 2)
            | int(quad[3], 2)
        )
        raw_bytes.append(b)

    return raw_bytes.hex()


def hash_and_chunk_document(
    document: Union[bytes, bytearray, str, Path, BinaryIO, IOBase],
) -> Tuple[str, List[str]]:
    """
    Convenience function that computes the SHA-256 digest and splits it into
    128 2-bit quantum blocks.

    Returns:
        Tuple of (document_hash_hex, list_of_128_chunks)
    """
    digest_bytes = compute_sha256_bytes(document)
    digest_hex = digest_bytes.hex()
    chunks = hash_to_2bit_chunks(digest_bytes)
    return digest_hex, chunks
