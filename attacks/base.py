from abc import ABC, abstractmethod


class BaseAttack(ABC):
    """
    Base class for all simulated attacks.
    """

    @abstractmethod
    def apply(self, experiment_data: dict) -> dict:
        """
        Apply an attack to the supplied experiment data.

        Returns a modified copy of the experiment.
        """
        pass