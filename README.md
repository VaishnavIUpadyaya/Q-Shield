# Quantum-Inspired Cyber Threat Detection for Digital Signature Security

**SIH26141 · Team Egreen Quanta · Blockchain & Cybersecurity**

A quantum-inspired cybersecurity framework for detecting attacks against teleportation-based Quantum Digital Signature (QDS) protocols, using quantum measurements and statistical analysis — without Artificial Intelligence or Machine Learning.


## Table of Contents

- [Problem Statement](#problem-statement)
- [Our Solution](#our-solution)
- [Objectives](#objectives)
- [How It Works](#how-it-works)
  - [1. Quantum Signature Protocol](#1-quantum-signature-protocol)
  - [2. Attack Scenarios](#2-attack-scenarios)
  - [3. Quantum Measurement Analysis](#3-quantum-measurement-analysis)
  - [4. Statistical Threat Detection](#4-statistical-threat-detection)
- [Security Metrics](#security-metrics)
- [Repeated Experiments](#repeated-experiments)
- [Interactive Prototype](#interactive-prototype)
- [Technology Stack](#technology-stack)
- [Why No AI/ML?](#why-no-aiml)
- [Dataset](#dataset)
- [Expected Deliverables](#expected-deliverables)
- [Key Principles](#key-principles)
- [Disclaimer](#disclaimer)

---

## Problem Statement

**SIH26141 — Quantum-Inspired Cyber Threat Detection for Digital Signature Security**

### Background

The rapid advancement of quantum computing threatens classical public-key cryptographic systems such as RSA and Elliptic Curve Cryptography (ECC), both of which can be broken by quantum algorithms such as Shor's algorithm. This creates a security risk for critical digital infrastructure that depends on traditional digital signatures.

Quantum Digital Signature (QDS) protocols offer an alternative approach, using principles of quantum mechanics to provide strong security guarantees. Among these, **teleportation-based QDS protocols** use quantum teleportation and entanglement for signature generation and verification.

### Description

This problem statement calls for a quantum-inspired cyber threat detection framework designed for QDS systems. The framework must detect threats to the integrity and authenticity of digital signatures, including:

- Signature forgery
- Impersonation
- Replay attacks
- Unauthorized verification attempts
- Quantum channel manipulation

The detection approach must **not use Artificial Intelligence or Machine Learning**. Instead, it must rely on:

- Pauli eigenstates
- Quantum measurements
- Projective measurements
- Measurement statistics
- Statistical threshold-based detection

The system should calculate forgery probabilities and verification accuracy while respecting the security assumptions of the underlying QDS protocol.

*(This section reflects the official problem statement as provided. It is kept separate from our proposed solution below.)*

---

## Our Solution

We are building a **Quantum Digital Signature Security Testing and Detection Framework**.

The core idea: a user configures a security experiment, the system simulates a teleportation-based QDS protocol, an attack is optionally introduced, quantum measurements are collected, the measurements are statistically analyzed, and the system reports whether the signature or communication satisfies the expected security conditions. Security metrics are calculated from repeated experiments, not a single run.

```
                 Quantum QDS Protocol
                         |
                         v
                Normal / Attack Scenario
                         |
                         v
                  Qiskit Simulation
                         |
                         v
                Quantum Measurements
                         |
                         v
                Statistical Analysis
                         |
                         v
                 Threat Detection
                         |
             +-----------+-----------+
             |                       |
             v                       v
        Legitimate                Attack
         ACCEPT                   REJECT
             |                       |
             +-----------+-----------+
                         |
                         v
                 Security Metrics
```

This is intended as a working research prototype, not a static demo with pre-set results.

---

## Objectives

1. Design a quantum-inspired threat detection framework for teleportation-based QDS protocols.
2. Detect signature forgery, impersonation, replay attacks, unauthorized verification attempts, and quantum channel manipulation.
3. Use Pauli eigenstates, quantum measurements, and statistical thresholds for threat detection — without AI/ML.
4. Evaluate the system using attack simulations, forgery probability, detection rate, verification accuracy, and false-accept rate, derived from repeated experiments.

---

## How It Works

### 1. Quantum Signature Protocol

The framework will simulate a teleportation-based QDS protocol, including:

- Bell-state entanglement
- Quantum teleportation
- Pauli correction operations
- Pauli eigenstate preparation
- Projective measurements
- Signature verification

A legitimate signature run is used to establish the expected measurement behavior that later experiments are compared against.

### 2. Attack Scenarios

The framework is designed to address five threat scenarios. Not all of them are detected the same way — each has a different relationship to quantum measurement data.

**Forgery Attack**
An attacker attempts to create or modify a valid signature.

```
Legitimate:  Signer   ──> Verifier   (valid signature)
Forgery:     Attacker ──> Verifier   (fake / modified signature)
```

A forged signature is expected to produce measurement statistics that deviate from the legitimate baseline. The detector will compare observed statistics against this baseline to flag likely forgeries.

**Impersonation**
An attacker attempts to act as the legitimate signer.

```
Signer   ──> Verifier   (legitimate)
Attacker ──> Verifier   (pretending to be signer)
```

Detection here depends on the verification conditions defined by the specific QDS protocol being simulated (e.g. whether the attacker can reproduce the expected correlations between signer and verifier). This will be evaluated against the chosen protocol's verification rules, not treated as a generic measurement anomaly.

**Replay Attack**
An attacker captures a previously valid signature and attempts to reuse it.

```
Signer ──> Verifier
    |
    | signature captured
    v
Attacker ──> Verifier   (reuses old signature)
```

Detecting a replay is not purely a measurement-statistics problem — it typically requires message or session freshness information (e.g. sequence numbers, timestamps, or one-time session data) in addition to measurement analysis. The framework will incorporate freshness checks alongside statistical comparison.

**Unauthorized Verification**
An unauthorized entity attempts to perform or access verification operations. This is primarily an access-control concern rather than a quantum-measurement anomaly, and will be handled by recording and evaluating verification attempts against defined protocol rules, in addition to any relevant measurement checks.

**Quantum Channel Manipulation**
An attacker interferes with the quantum state while it is in transit.

```
Signer ──> Attacker (modifies state) ──> Verifier
```

Channel manipulation can alter the resulting measurement distribution, so this scenario is the closest fit to pure statistical detection from measurement outcomes.

### 3. Quantum Measurement Analysis

Each simulated experiment is run multiple times, referred to as **shots**. For example:

```
1000 measurements
State 00 → 492
State 01 → 508
```

These counts are converted into probability distributions:

```
P(00) ≈ 49.2%
P(01) ≈ 50.8%
```

The observed distribution is compared against the expected distribution for a legitimate signature.

### 4. Statistical Threat Detection

No AI or Machine Learning is used at any stage. The detection pipeline is:

```
Expected (legitimate) measurement distribution
                |
                v
       Observed measurement distribution
                |
                v
      Statistical comparison / difference
                |
                v
        Detection decision
```

Detection thresholds will be derived from the selected QDS protocol and the statistical model used for comparison (for example, a chi-squared test or a confidence-interval-based bound), rather than fixed arbitrary numbers. The exact method will be finalized as the detector is implemented.

---

## Security Metrics

The framework will evaluate detection performance using the following metrics, calculated from repeated experiments:

| Metric | Definition |
|---|---|
| **Detection Rate** | Fraction of actual attacks correctly flagged as attacks |
| **False Accept Rate** | Fraction of malicious attempts incorrectly accepted as legitimate |
| **False Reject Rate** | Fraction of legitimate signatures incorrectly rejected |
| **Verification Accuracy** | Fraction of all signatures (legitimate and malicious) correctly classified |
| **Forgery Probability** | Estimated probability that a forged signature passes verification, under the tested conditions |

These values are outputs of running many simulated experiments — they are not fixed or assumed in advance.

---

## Repeated Experiments

A single simulation run is not sufficient to make a security claim. The framework will run each scenario many times to build up a statistical picture. For example, a configuration might look like:

```
Attack type: Forgery
Shots per experiment: 5,000
Number of trials: 100
```

*(These numbers are illustrative only — actual values will depend on the protocol and what is computationally practical.)*

Across all trials, the framework will compute the security metrics listed above. This lets us describe detector performance statistically, rather than relying on a single demonstration run.

---

## Interactive Prototype

This is intended to be an **interactive testing tool**, not a static page showing fixed results.

Planned user-configurable parameters include:

- QDS protocol / scenario selection
- Attack type
- Number of qubits
- Number of measurement shots
- Number of trials
- Measurement basis
- Attack-specific parameters (where applicable)

Changing a configuration should trigger an actual quantum simulation and a fresh statistical analysis — not a lookup of a pre-computed result.

```
Configuration
      |
      v
Quantum Simulation (Qiskit)
      |
      v
Attack Injection
      |
      v
Measurement Collection
      |
      v
Statistical Analysis
      |
      v
Security Metrics + Explanation
```

The framework will also aim to show *why* a detection decision was made — e.g. which statistical comparison was used and how far the observed data deviated from the expected baseline — rather than only a pass/fail label.

---

## Technology Stack

**Frontend**
- JavaScript, React, Next.js
- Tailwind CSS
- Recharts / D3.js — for experiment controls and visualizations

**Backend**
- Python, FastAPI — runs experiments and connects the frontend to the simulation engine

**Quantum Simulation**
- Qiskit, Qiskit Aer — circuit simulation, Bell-state generation, teleportation, Pauli operations, measurements

**Analysis**
- NumPy, SciPy — measurement processing, probability calculations, statistical comparisons

**Data Storage**
- Firebase Firestore — experiment results, security metrics, experiment history

**Deployment**
- Vercel (frontend)
- Cloud deployment for the Python backend
- Firebase (storage)

Authentication is not a current priority for this prototype and is out of scope for this README.

---

## Why No AI/ML?

The problem statement explicitly excludes AI and Machine Learning from the detection method. The framework's detection logic is therefore built from:

- Quantum measurements
- Mathematical and statistical analysis
- Protocol-derived security thresholds

This keeps the detection process explainable and directly tied to the underlying quantum protocol, rather than dependent on a trained model.

---

## Dataset

We do not currently have access to an official SIH26141 dataset, and this README does not claim one exists or describe its contents.

- The core framework generates its own experimental measurement data by running Qiskit simulations.
- If an official dataset becomes available, it can be used for validation or comparison alongside our simulated results.
- Since the problem statement excludes AI/ML, any such dataset will be used for validation/comparison only — never as training data.

---

## Expected Deliverables

- Teleportation-based QDS simulation
- Bell-state entanglement simulation
- Pauli correction operations
- Pauli eigenstate measurements
- Projective measurement analysis
- Simulation of forgery, impersonation, replay, unauthorized verification, and channel manipulation scenarios
- Statistical threat detection pipeline
- Forgery probability analysis
- Verification accuracy, detection rate, false accept rate, false reject rate
- Support for repeated/batched experiments
- Interactive experiment configuration
- Measurement visualization
- Security analysis with explanation of detection decisions
- Experiment history

---

## Key Principles

- **No AI/ML** — detection relies on quantum measurements and statistical methods only.
- **Explainable** — detection decisions are reported along with the reasoning behind them.
- **Experiment-driven** — performance claims come from repeated simulations, not single demonstrations.
- **Protocol-grounded** — detection logic is tied to the specific QDS protocol being simulated, not treated as one-size-fits-all.

---

## Disclaimer

This project is a software simulation and research prototype. Results from simulated quantum environments are not proof of security for real-world quantum communication systems. Security conclusions depend on the correctness of the implemented QDS protocol, the attack model used, the statistical analysis applied, and the assumptions underlying all of these.
