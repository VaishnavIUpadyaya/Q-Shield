# Q-Shield API Contract

This document defines the interfaces between project modules.

## 1. Quantum Protocol

Owner: P1

Responsible for:

- Quantum state preparation
- Bell-state generation
- Quantum teleportation
- Pauli corrections
- Projective measurements

The quantum module must return structured results.

## 2. Measurement Result

Example:

{
    "basis": "Z",
    "shots": 1000,
    "counts": {
        "0": 503,
        "1": 497
    },
    "probabilities": {
        "0": 0.503,
        "1": 0.497
    }
}

## 3. Attack Result

Example:

{
    "attack_type": "forgery",
    "attack_parameters": {},
    "modified_data": {}
}

## 4. Detection Result

Example:

{
    "decision": "REJECT",
    "attack_detected": true,
    "statistical_method": "",
    "statistic": 0.0,
    "p_value": null,
    "reason": ""
}

## 5. Experiment Result

Example:

{
    "experiment_id": "",
    "attack_type": "forgery",
    "shots": 1000,
    "trial": 1,
    "measurements": {},
    "verification_result": "",
    "detection_result": {}
}