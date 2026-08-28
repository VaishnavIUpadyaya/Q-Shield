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

## 3. Protocol Selection and Scope

Q-Shield uses the 2022 Xu-Wang quantum digital signature (QDS)
scheme based on superdense teleportation as the primary literature
reference for the teleportation-based QDS model.

The original Gottesman-Chuang construction is retained as the
foundational information-theoretic QDS reference, but it is not
identified as a teleportation-based signing algorithm.

The Xu-Wang protocol is a 2-bit QDS construction based on superdense
teleportation. In that construction, the sender generates a quantum
signature using unitary transformations and Bell-basis measurement,
while receivers verify the signature using unitary transformations
and computational-basis measurement.

Q-Shield does not claim that the existing three-qubit teleportation
implementation is a literal implementation of the complete Xu-Wang
protocol.

Instead, the existing P1 quantum modules provide reusable quantum
primitives:

- single-qubit state preparation;
- Bell-state generation;
- ordinary quantum teleportation;
- Pauli X/Z corrections;
- X/Y/Z projective measurement.

The protocol layer must explicitly distinguish these reusable
primitives from the QDS signing and verification construction.

---

## 4. Protocol Participants

The conceptual protocol contains:

- Alice: signer;
- Bob: verifier/recipient;
- Eve: adversary.

Alice generates a signature for a message.

Bob receives the message together with the protocol-defined quantum
and classical verification information.

Eve attempts to produce a valid signature without possessing the
signer's required secret information, or attempts to modify or reuse
a signature.

---

## 5. Message Model

The primary literature model is a 2-bit message.

Let the message be

    m ∈ {00, 01, 10, 11}.

Longer messages are outside the minimum Q-Shield interface and must
not be silently introduced into the protocol implementation.

A future extension may process multiple 2-bit blocks according to
the construction described by Xu and Wang.

---

## 6. Quantum Signature Model

The quantum signature must not be represented as an arbitrary
classical string.

For the Xu-Wang model, the signature generation process involves:

1. preparation of the required quantum registers;
2. message-dependent unitary transformations;
3. measurement in the Bell basis;
4. use of the sender's measurement result as part of the public
   verification information.

Therefore, the protocol implementation must preserve the distinction
between:

- the message;
- the quantum registers used during signing;
- the sender's Bell-basis measurement result;
- the public verification information;
- the verifier's measurement result.

The exact mathematical register construction and unitary operations
must follow the selected Xu-Wang protocol rather than being invented
from the existing P1 teleportation circuit.

---

## 7. Signer Inputs and Outputs

The protocol-level signer interface shall conceptually accept:

    message

and the protocol's required secret/signing state.

The signer operation shall produce a protocol-defined signature
record containing only information that is actually required by the
selected protocol.

At minimum, the protocol implementation must distinguish:

    message
    signing/secret state
    quantum-signature state
    sender measurement result
    public verification information

The implementation must not introduce application-level fields such
as signer_id or nonce as though they were part of the Xu-Wang QDS
construction.

---

## 8. Verifier Inputs

The verifier receives:

1. the signed message;
2. the quantum signature material required by the protocol;
3. the public verification information derived during signing.

The verifier then applies the protocol-defined unitary operations and
measurement procedure.

The verifier's result must contain enough information for the
statistical detection layer to evaluate the observed measurement
outcomes.

---

## 9. Verification Model

The Xu-Wang construction describes verification through unitary
transformations followed by computational-basis measurement.

Therefore:

    verifier_input
          |
          v
    protocol-defined
    unitary operations
          |
          v
    computational-basis
    measurement
          |
          v
    measurement outcomes
          |
          v
    verification result

Q-Shield must not replace this protocol-defined verification
procedure with an arbitrary probability threshold.

The detection layer is responsible for statistical analysis of
observations.

The protocol layer is responsible for producing the observations
and the protocol-defined expected verification conditions.

---

## 10. Role of Pauli Eigenstates

The current P1 implementation supports the single-qubit states:

    |0>
    |1>
    |+>
    |->

and projective measurements in:

    X
    Y
    Z

These states and measurements are quantum primitives available to the
simulation.

They must not automatically be interpreted as the complete QDS
signature alphabet.

For a state |ψ> and Pauli observable P, a projective measurement
produces the corresponding eigenvalue outcome according to the Born
rule.

For example:

    |+> is a +1 eigenstate of X
    |-> is a -1 eigenstate of X

Therefore an ideal X-basis measurement gives deterministic outcomes
for these states.

For |+> measured in the Z basis:

    P(0) = 1/2
    P(1) = 1/2

For |+> measured in the Y basis:

    P(0) = 1/2
    P(1) = 1/2

These are quantum-state measurement expectations, not arbitrary QDS
security thresholds.

---

## 11. Legitimate Measurement Statistics

For a known ideal state |ψ> and measurement basis B, the legitimate
distribution is determined by quantum mechanics:

    P(x | ψ, B) = <ψ| Π_x^B |ψ>

where Π_x^B is the projector associated with outcome x in basis B.

Repeated measurements produce empirical counts:

    C = {c_x}

and empirical probabilities:

    p_hat(x) = c_x / N

where

    N = Σ_x c_x.

Q-Shield's statistical layer compares the observed distribution with
the protocol-defined legitimate distribution.

The statistical layer must not invent a fixed probability difference
such as "0.1 means forgery."

---

## 12. Statistical Verification

For a binary verification outcome, let:

    p0 = legitimate probability of outcome 0

and

    p_hat = observed probability of outcome 0.

The Q-Shield detection layer may calculate a confidence interval for
p_hat using the Wilson interval.

For example:

    p_hat = c0 / N

with confidence interval:

    [L, U].

A statistical observation is considered compatible with the supplied
legitimate model when the expected probability is contained in the
chosen confidence interval.

This is a statistical compatibility test.

It is not, by itself, a proof of QDS security or a proof that an
incompatible observation was caused by forgery.

---

## 13. Forgery Probability

Forgery probability must not be defined as an arbitrary percentage
chosen by the implementation.

For an information-theoretically secure QDS protocol, the relevant
security quantity is the adversary's probability of successfully
producing a valid signature without the legitimate signing
information, subject to the assumptions and security analysis of the
selected protocol.

The Xu-Wang paper claims unconditional security for its 2-bit
construction.

Q-Shield therefore reports experimental/simulation statistics
separately from the theoretical security claim.

The simulator must not claim that a particular empirical threshold
proves unconditional security.

---

## 14. Replay

Replay is conceptually different from quantum-state forgery.

A replay attacker may reuse previously valid protocol material
without changing the quantum measurement statistics.

Therefore statistical anomaly detection alone cannot establish
freshness.

Replay prevention requires a protocol/application freshness mechanism
outside the core quantum-statistical detector.

Any nonce, session identifier, timestamp, or transaction identifier
used by Q-Shield must therefore be documented as an application-level
extension and must not be presented as part of the Xu-Wang quantum
signature construction unless explicitly supported by that protocol.

---

## 15. Impersonation

Impersonation means an adversary attempts to act as the legitimate
signer without possessing the signing information required by the
protocol.

The quantum verification layer evaluates whether the supplied
signature material satisfies the protocol's verification conditions.

Identity management and authentication metadata are outside the
quantum measurement model.

Fields such as:

    signer_id

must therefore be treated as application-level metadata rather than
as quantum signature material.

---

## 16. Security Assumptions

The information-theoretic security claim belongs to the mathematical
protocol model and its stated assumptions.

Q-Shield must not claim unconditional security for the complete
software system merely because the underlying paper proves an
unconditional-security result.

The simulation must explicitly distinguish:

1. security properties established by the selected protocol;
2. assumptions made by the protocol;
3. assumptions introduced by the simulation;
4. engineering-level authentication and freshness mechanisms.

In particular, the implementation must not silently replace the
protocol's security assumptions with classical cryptographic
assumptions.

---

## 17. Separation of Responsibilities

The Q-Shield architecture separates the protocol layer from the
statistical detection layer.

### quantum/protocol.py

Responsible for:

- protocol-level signing;
- protocol-level verification;
- quantum register preparation required by the protocol;
- protocol-defined unitary operations;
- protocol-defined measurements;
- returning protocol-defined measurement information.

### detection/

Responsible for:

- converting counts to probabilities;
- validating probability distributions;
- calculating statistical intervals;
- evaluating statistical compatibility;
- generating controlled experimental attack data;
- reporting anomalies.

The detector must not define the QDS signature format.

The protocol must not contain arbitrary statistical attack
thresholds.

---

## 18. Protocol Interface for P1

The `quantum/protocol.py` module shall expose a protocol-level
signing and verification interface.

The interface must preserve the distinction between:

- the signed 2-bit message;
- the quantum registers/state used by the protocol;
- the sender's protocol-defined measurement result;
- the public verification information;
- the verifier's measurement result.

Conceptual interface:

    sign(message, signing_state) -> signature

    verify(signature) -> verification_result

The exact internal representation may use dataclasses or equivalent
Python structures.

The implementation must not invent additional cryptographic fields
that are not required by the selected protocol.

In particular, the following are NOT part of the quantum signature
interface:

    signer_id
    nonce
    timestamp
    arbitrary authentication metadata

Those belong, if required, to an application-level security layer.

### Required verification output

The verification operation must expose:

    measurement_counts
    measurement_basis
    expected_distribution

where these values are derived from the implemented protocol/state
model rather than arbitrary detector thresholds.

The verification operation may also expose a protocol-level
verification status.

The statistical detection layer consumes the measurement counts and
protocol-defined expected distribution. It must not define the
signature format or the underlying quantum verification procedure.

### Implementation boundary

If the complete Xu-Wang superdense-teleportation construction cannot
be represented using the current P1 quantum primitives, the
implementation must document the supported simulation subset rather
than silently replacing the protocol with ordinary three-qubit
teleportation.
---

## 19. P1 Implementation Boundary

P1 shall implement `quantum/protocol.py` strictly according to this
specification.

The existing P1 modules should remain unchanged unless an actual
integration issue is discovered:

    quantum/states.py
    quantum/bell_states.py
    quantum/teleportation.py
    quantum/measurements.py

The protocol implementation must not claim to be a literal
implementation of the complete Xu-Wang protocol if the existing
qubit primitives do not provide all of its required registers,
operations, or measurements.

Where the Q-Shield implementation necessarily simplifies the
published construction, the simplification must be explicitly
documented in code and documentation.

---

## 20. References

1. D. Gottesman and I. Chuang, "Quantum Digital Signatures,"
   arXiv:quant-ph/0105032 (2001).

2. L. Xu and M. Wang, "A QDS scheme based on superdense
   teleportation," Quantum Information Processing 21, 220 (2022),
   DOI: 10.1007/s11128-022-03562-1.

3. The Q-Shield P1 quantum foundation:
   `quantum/states.py`
   `quantum/bell_states.py`
   `quantum/teleportation.py`
   `quantum/measurements.py`

The published protocol references define the cryptographic model.
The Q-Shield implementation documentation defines which parts are
implemented directly and which parts are simulation abstractions.