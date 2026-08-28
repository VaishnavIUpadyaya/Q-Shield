# Q-Shield QDS Protocol Specification

## 1. Protocol Selection

The project requires a teleportation-based Quantum Digital Signature
(QDS) simulation using Bell-state entanglement, quantum teleportation,
Pauli corrections, projective measurements, and statistical threat
detection.

Two relevant protocol families were investigated:

| Protocol | Quantum model | Teleportation | Fit with current P1 qubit foundation |
|---|---|---|---|
| Gottesman-Chuang (2001) | Quantum public-key QDS | Not the core signing mechanism | Partial |
| Xu-Wang (2022) | QDS based on superdense teleportation | Yes | Potentially closer |
| Teleportation-based CV QDS (2023) | Continuous-variable QDS | Yes | No — uses CV/squeezed-state model |

### Current conclusion

The Gottesman-Chuang protocol is the foundational information-theoretic
QDS reference, but it should not be described as a teleportation-based
QDS implementation.

The Xu-Wang 2022 protocol is explicitly based on superdense
teleportation and is therefore relevant to the teleportation-based QDS
requirement. However, it must not be conflated with the ordinary
three-qubit teleportation circuit currently implemented in this
repository.

The 2023 teleportation-based continuous-variable QDS protocol uses a
different physical model based on continuous-variable quantum states
and therefore does not directly match the current qubit/Qiskit
foundation.

Further protocol mapping is required before `quantum/protocol.py` is
implemented.

The Gottesman-Chuang construction is used as the foundational
information-theoretic QDS reference.

The teleportation and Bell-state components in Q-Shield are treated as
the quantum transport primitives required by the project specification.
They are not claimed to be part of the original Gottesman-Chuang
signing algorithm.

The protocol layer must explicitly define how these teleportation
primitives are combined with the QDS verification model.

---

## 2. References Used for Protocol Selection

### 2.1 Gottesman-Chuang

D. Gottesman and I. Chuang,
"Quantum Digital Signatures",
arXiv:quant-ph/0105032 (2001).

This is used as the foundational QDS reference for the
information-theoretic security model.

### 2.2 Xu-Wang

L. Xu and M. Wang,
"A QDS scheme based on superdense teleportation",
Quantum Information Processing 21, 220 (2022).

This is used as the primary teleportation-related QDS reference for
further protocol investigation.

### 2.3 Teleportation-based continuous-variable QDS

A 2023 teleportation-based QDS construction uses continuous-variable
quantum states and therefore is not directly adopted as the Qiskit
qubit implementation model.

---

## 3. Q-Shield Protocol Model

### 3.1 Scope

Q-Shield models a qubit-based teleportation-assisted quantum signature
verification experiment.

The implementation uses:

1. single-qubit states;
2. Bell-state entanglement;
3. quantum teleportation;
4. classical Bell-measurement outcomes;
5. Pauli X/Z correction;
6. Pauli-basis projective measurements;
7. statistical analysis of repeated measurement outcomes.

The implementation is a simulation model and is not claimed to be a
literal implementation of the full Gottesman-Chuang or Xu-Wang protocol.

The Gottesman-Chuang construction supplies the information-theoretic
QDS security foundation, while the teleportation mechanism supplies the
quantum-state transfer mechanism required by this project.

---

## 4. Participants

The simplified model contains:

- Alice: signer;
- Bob: verifier;
- Eve: adversary.

Alice prepares the quantum signing state.

Bob receives the teleported state and verification information.

Eve attempts to modify, forge, replay, or impersonate a signature.

---

## 5. Quantum Resources

The simulator uses:

- single-qubit states;
- a Bell state

    |Phi+> = (|00> + |11>) / sqrt(2);

- classical communication for teleportation measurement results;
- Pauli X and Z correction operations;
- projective measurements in X, Y and Z bases.

The current P1 implementation supports the single-qubit states:

    |0>
    |1>
    |+>
    |->

and projective measurements in:

    X, Y, Z.

---

## 6. Signature Representation

The Q-Shield simulation separates the quantum state from the classical
verification metadata.

A simulated signature record is conceptually represented as:

    Signature =
        {
            message,
            quantum_state_identifier,
            teleportation_measurement_data,
            verification_basis,
            verification_metadata
        }

This representation is an engineering interface for simulation.

It must not be interpreted as the exact signature format of the
Gottesman-Chuang or Xu-Wang protocols.

The quantum component is the state whose integrity/authenticity is tested
through verification measurements.

---

## 7. Signing Procedure

The simplified simulation performs:

1. Alice selects the quantum state associated with the message.
2. Alice prepares the state.
3. Alice and Bob share a Bell pair.
4. Alice performs the Bell-basis measurement required for teleportation.
5. Alice obtains two classical measurement bits.
6. The corresponding Pauli corrections are applied to Bob's qubit.
7. Bob obtains the teleported quantum state.
8. Bob performs the prescribed verification measurement.

The current P1 teleportation implementation realizes steps 2--7.

The complete QDS protocol layer remains to be implemented in
`quantum/protocol.py`.

---

## 8. Verification Procedure

Verification is based on repeated measurements.

Let:

    B in {X, Y, Z}

denote the selected Pauli measurement basis.

Let:

    x_i in {0,1}

be the outcome of the i-th measurement.

For N repeated measurements, define:

    n_0 = number of zero outcomes
    n_1 = number of one outcomes

with:

    n_0 + n_1 = N.

The empirical distribution is:

    p_hat(0) = n_0 / N
    p_hat(1) = n_1 / N.

The verifier compares the observed distribution against the distribution
predicted by the legitimate quantum state and protocol.

A signature is accepted only when the observed statistics are compatible
with the legitimate verification model.

---

## 9. Pauli Eigenstate Model

For a Pauli operator P, an eigenstate satisfies:

    P |psi_lambda> = lambda |psi_lambda>

where:

    lambda in {+1,-1}.

The relevant Pauli operators are:

    X = [[0,1],
         [1,0]]

    Y = [[0,-i],
         [i,0]]

    Z = [[1,0],
         [0,-1]].

The X eigenstates are:

    |+>  = (|0> + |1>) / sqrt(2)

    |->  = (|0> - |1>) / sqrt(2).

The Y eigenstates are:

    |+i> = (|0> + i|1>) / sqrt(2)

    |-i> = (|0> - i|1>) / sqrt(2).

The Z eigenstates are:

    |0>
    |1>.

The current P1 measurement implementation realizes the X, Y and Z
projective measurement bases by basis rotations followed by
computational-basis measurement.

---

## 10. Legitimate Measurement Statistics

For an ideal state |psi>, measurement probabilities are determined by
the Born rule.

For projector Pi_x associated with outcome x:

    p(x | psi, B) =
        <psi | Pi_x^(B) | psi>.

For N independent measurements, the observed count vector follows the
corresponding multinomial distribution.

For a single qubit measured in a fixed basis, this reduces to a binomial
distribution:

    n_0 ~ Binomial(N, p_0)

where:

    p_0 = p(0 | psi, B).

Examples from the current teleportation implementation:

For |+> measured in the X basis:

    p(0) = 1
    p(1) = 0

For |+> measured in the Z basis:

    p(0) = 1/2
    p(1) = 1/2

For |+> measured in the Y basis:

    p(0) = 1/2
    p(1) = 1/2.

These are teleportation sanity-check distributions, not yet the complete
QDS security distribution.

The final legitimate distribution must be tied to the state specified
by the selected QDS protocol.

---

## 11. Forgery Probability

The security quantity of interest is the probability that an adversary
can cause a forged signature to be accepted.

Define:

    P_forge =
        Pr[Verifier accepts forged signature].

For an experimental simulation, the corresponding empirical quantity is:

    FAR =
        number of forged attempts accepted
        --------------------------------
        total number of forged attempts.

P_forge and FAR must not be treated as identical.

P_forge is a protocol/security quantity, whereas FAR is an experimentally
estimated acceptance rate.

For N independent forged verification attempts with acceptance
probability p_forge, the number of accepted attempts A follows:

    A ~ Binomial(N, p_forge).

The simulator will estimate FAR from attack experiments.

No arbitrary value for P_forge is assumed.

---

## 12. Statistical Detection Model

The detector uses hypothesis testing.

Null hypothesis:

    H0:
    observed measurements are compatible with a legitimate signature.

Alternative hypothesis:

    H1:
    observed measurements are inconsistent with the legitimate signature
    model.

The detector must use the legitimate probability distribution supplied
by the protocol model.

For a binary outcome distribution, one possible test statistic is the
binomial likelihood:

    L(p0 | n0,n1)
      = C(N,n0) p0^n0 (1-p0)^n1.

For multi-outcome measurement data, the corresponding multinomial
likelihood can be used.

A confidence level or significance level must be selected explicitly
before an operational threshold is introduced.

No arbitrary threshold such as "distance > 0.1" is permitted.

The final statistical test must be justified using the measurement
model and desired false-accept/false-reject guarantees.

---

## 13. Statistical Distance

The current P2 implementation also provides total variation distance:

    TV(P,Q) =
        1/2 * sum_x |P(x)-Q(x)|.

This quantity measures distributional deviation.

It is a descriptive/statistical quantity and is not itself an attack
decision rule.

A security decision requires a statistically justified acceptance rule.

---

## 14. Replay Attack Model

A replay attack occurs when an adversary submits a previously valid
signature in a context where a fresh signature is required.

The quantum measurement statistics of a replayed valid state may be
indistinguishable from those of the original valid signature.

Therefore, replay detection cannot safely rely only on quantum
measurement-distribution deviation.

The protocol/application layer must bind the signature to a fresh
message/session context, such as a nonce, sequence number, timestamp,
or unique transaction identifier.

The exact freshness mechanism must be specified as an engineering
extension if it is not supplied by the selected QDS protocol.

---

## 15. Impersonation Attack Model

In an impersonation attack, Eve attempts to act as Alice and produce
a signature that Bob accepts as originating from Alice.

The detector evaluates whether Eve's generated quantum state and
associated verification information are statistically compatible with
Alice's legitimate signing model.

The security analysis must distinguish:

    legitimate signer
    from
    adversary without the required signing information.

The simulator must not assume that a statistical measurement test alone
authenticates a classical identity unless the protocol includes an
identity-binding mechanism.

---

## 16. Quantum Channel Manipulation

An adversary may modify the teleported state or introduce an operation
before verification.

In the simulation this can be represented by an attack channel or
additional quantum operation:

    rho -> E(rho)

where E is a quantum channel.

The verifier observes the resulting measurement distribution:

    p_attack(x)
      = Tr(Pi_x E(rho)).

The detector compares this distribution against the legitimate
distribution:

    p_legit(x)
      = Tr(Pi_x rho).

A channel manipulation that changes the observable statistics may
therefore be detected statistically.

---

## 17. Information-Theoretic Security Assumptions

The information-theoretic security claim requires assumptions from the
underlying QDS model.

Relevant assumptions include:

1. quantum mechanics correctly describes the physical system;
2. the adversary cannot violate the no-cloning principle;
3. the adversary is allowed the attack capabilities specified by the
   security model;
4. quantum public-key/state distribution is performed according to the
   protocol assumptions;
5. the number and accessibility of copies of quantum public-key states
   are controlled as required;
6. classical communication required by the protocol is authenticated
   where assumed;
7. measurement devices and quantum channels follow the simulation model
   used by the security analysis.

The Gottesman-Chuang work specifically emphasizes that unrestricted
circulation of copies of quantum public keys would compromise the
security construction. Therefore, the number of public-key copies is a
security parameter rather than an implementation detail.

---

## 18. Interface Requirements for quantum/protocol.py

The protocol layer should expose a clean interface separating:

    protocol logic
    from
    quantum primitives
    from
    statistical detection.

The exact API should provide, at minimum:

### Signing

    sign(message, ...)

returns protocol-defined signing/verification data.

### Verification

    verify(signature, ...)

returns verification information and measurement data.

### Measurement data

The protocol layer should expose measurement counts in a form that can
be consumed by:

    detection.statistics.counts_to_probabilities()

without coupling the detector to Qiskit circuit internals.

### Security metadata

The protocol layer should expose the information needed by the detector
to identify:

- message;
- signer/session context;
- measurement basis;
- expected legitimate distribution;
- observed counts;
- verification result.

The precise fields must be finalized after the protocol mapping is
completed.

---

## 19. Implementation Boundary

The project is deliberately separated into three layers.

### Quantum layer

    quantum/

Provides:

- state preparation;
- Bell states;
- teleportation;
- Pauli correction;
- projective measurement.

### Protocol layer

    quantum/protocol.py

Provides:

- message/signature binding;
- signing procedure;
- verification procedure;
- protocol-specific security metadata.

### Detection layer

    detection/

Provides:

- measurement-count processing;
- probability estimation;
- statistical testing;
- attack classification;
- forgery/false-accept metrics.

This separation prevents the detection layer from changing the
information-theoretic quantum protocol.

---

## 20. Current Status

Completed:

- Bell-state simulation;
- teleportation;
- Pauli corrections;
- X/Y/Z projective measurement;
- measurement-count extraction;
- statistical probability conversion;
- distribution validation;
- total variation distance.

Pending:

- final protocol-specific signature definition;
- protocol-specific verification rule;
- protocol-specific forgery bound;
- statistically justified operational threshold;
- replay/freshness mechanism;
- final attack detector.

No arbitrary security threshold is currently claimed.