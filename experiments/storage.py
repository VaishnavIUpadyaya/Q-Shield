import json
from pathlib import Path


def save_experiment(
    result: dict,
    output_directory: str = "dataset/experiments",
) -> str:
    """
    Save an experiment result as a JSON file.

    Parameters
    ----------
    result:
        Complete experiment result returned by run_experiment().

    output_directory:
        Directory where experiment files are stored.

    Returns
    -------
    str
        Path to the saved JSON file.
    """

    output_path = Path(output_directory)

    output_path.mkdir(
        parents=True,
        exist_ok=True,
    )

    # Find existing experiment files so that
    # automatically generated IDs do not overwrite them.
    existing_files = list(
        output_path.glob("experiment_*.json")
    )

    experiment_number = len(existing_files) + 1

    experiment_id = result.get(
        "experiment_id",
        f"experiment_{experiment_number:04d}",
    )

    result["experiment_id"] = experiment_id

    file_path = (
        output_path
        / f"{experiment_id}.json"
    )

    with file_path.open(
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            result,
            file,
            indent=2,
        )

    return str(file_path)


def load_experiment(
    file_path: str,
) -> dict:
    """
    Load a previously saved experiment result.
    """

    path = Path(file_path)

    with path.open(
        "r",
        encoding="utf-8",
    ) as file:

        return json.load(file)