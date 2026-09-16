from .runner import run_experiment
from .validation import validate_experiment_result
from .metrics import summarize_results
from .storage import save_experiment
from .firestore_storage import save_experiment_to_firestore


def execute_experiment(
    config,
    protocol_runner,
    attack_runner,
    detector,
    save=True,
    save_firestore=False,
):
    """
    Execute the complete P4 experiment lifecycle.

    Flow:

        P1 -> P3 -> P2
             ↓
        validation
             ↓
          metrics
             ↓
       ┌─────┴─────┐
       ↓           ↓
     JSON      Firestore

    Parameters
    ----------
    save:
        Whether to save the experiment locally as JSON.

    save_firestore:
        Whether to save the completed experiment to Firestore.
    """

    # 1. Run the experiment.
    result = run_experiment(
        config=config,
        protocol_runner=protocol_runner,
        attack_runner=attack_runner,
        detector=detector,
    )

    # 2. Validate the complete result.
    validation = validate_experiment_result(
        result
    )

    # 3. Calculate experiment metrics.
    metrics = summarize_results(
        result["results"]
    )

    # 4. Attach P4 information.
    result["validation"] = validation
    result["metrics"] = metrics

    # 5. Persist locally.
    #
    # This also assigns the experiment_id.
    if save:
        storage_path = save_experiment(
            result
        )

        result["storage_path"] = storage_path

    # 6. Persist to Firestore.
    #
    # If local storage is disabled, generate a unique
    # experiment ID before sending the result to Firestore.
    if save_firestore:

        if "experiment_id" not in result:
            import uuid

            result["experiment_id"] = (
                f"experiment_{uuid.uuid4().hex[:12]}"
            )

        firestore_document_id = (
            save_experiment_to_firestore(
                result
            )
        )

        result["firestore_document_id"] = (
            firestore_document_id
        )

    return result