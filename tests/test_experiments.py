import pytest

from experiments.scenarios import ExperimentConfig


def test_valid_configuration():

    config = ExperimentConfig(
        attack_type="forgery",
        shots=1000,
        trials=10,
    )

    config.validate()


def test_invalid_attack_type():

    config = ExperimentConfig(
        attack_type="invalid",
        shots=1000,
        trials=10,
    )

    with pytest.raises(ValueError):
        config.validate()


def test_invalid_shots():

    config = ExperimentConfig(
        attack_type="none",
        shots=0,
        trials=10,
    )

    with pytest.raises(ValueError):
        config.validate()


def test_invalid_trials():

    config = ExperimentConfig(
        attack_type="none",
        shots=1000,
        trials=0,
    )

    with pytest.raises(ValueError):
        config.validate()