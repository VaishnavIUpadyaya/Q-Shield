from experiments.storage import (
    save_experiment,
    load_experiment,
)


def test_save_and_load_experiment(tmp_path):

    result = {
        "experiment_id": "TEST001",
        "attack_type": "none",
        "shots": 100,
        "trials": 1,
        "results": [],
    }

    file_path = save_experiment(
        result,
        str(tmp_path),
    )

    loaded = load_experiment(
        file_path
    )

    assert loaded["experiment_id"] == "TEST001"

    assert loaded["attack_type"] == "none"

    assert loaded["shots"] == 100

    assert loaded["trials"] == 1