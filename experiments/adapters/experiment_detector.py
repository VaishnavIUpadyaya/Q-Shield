from .detection_adapter import run_p2_detector


def run_experiment_detector(attacked_result):
    """
    Adapt P3's attacked result into the existing P2 adapter.

    P3 provides Bob's attacked counts while preserving the
    protocol metadata needed by P2.
    """

    return run_p2_detector(attacked_result)