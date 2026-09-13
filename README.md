# Quantum-Inspired Cyber Threat Detection for Digital Signature Security

**SIH26141 · Team Egreen Quanta · Blockchain & Cybersecurity**

A quantum-inspired cybersecurity framework for detecting attacks against teleportation-based Quantum Digital Signature (QDS) protocols, using quantum measurements and statistical analysis — without Artificial Intelligence or Machine Learning.

---

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
- [Authentication System](#authentication-system)
- [Frontend Interface](#frontend-interface)
- [Getting Started & Running Locally](#getting-started--running-locally)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Why No AI/ML?](#why-no-aiml)
- [Dataset](#dataset)
- [Expected Deliverables](#expected-deliverables)
- [Key Principles](#key-principles)
- [Known Limitations](#known-limitations)
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

The framework simulates a teleportation-based QDS protocol, including:

- Bell-state entanglement
- Quantum teleportation
- Pauli correction operations
- Pauli eigenstate preparation
- Projective measurements
- Signature verification

A legitimate signature run is used to establish the expected measurement behavior that later experiments are compared against.

### 2. Attack Scenarios

The framework addresses five threat scenarios. Each has a different relationship to quantum measurement data.

**Forgery Attack** — An attacker attempts to create or modify a valid signature.

```
Legitimate:  Signer   ──> Verifier   (valid signature)
Forgery:     Attacker ──> Verifier   (fake / modified signature)
```

**Impersonation** — An attacker attempts to act as the legitimate signer.

```
Signer   ──> Verifier   (legitimate)
Attacker ──> Verifier   (pretending to be signer)
```

**Replay Attack** — An attacker captures a previously valid signature and attempts to reuse it.

```
Signer ──> Verifier
    |
    | signature captured
    v
Attacker ──> Verifier   (reuses old signature)
```

**Unauthorized Verification** — An unauthorized entity attempts to perform or access verification operations. Handled by recording and evaluating verification attempts against defined protocol rules.

**Quantum Channel Manipulation** — An attacker interferes with the quantum state while it is in transit.

```
Signer ──> Attacker (modifies state) ──> Verifier
```

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

Detection thresholds are derived from the selected QDS protocol and the statistical model used for comparison (chi-squared test or confidence-interval-based bound), rather than fixed arbitrary numbers.

---

## Security Metrics

| Metric | Definition |
|---|---|
| **Detection Rate** | Fraction of actual attacks correctly flagged |
| **False Accept Rate** | Fraction of malicious attempts incorrectly accepted as legitimate |
| **False Reject Rate** | Fraction of legitimate signatures incorrectly rejected |
| **Verification Accuracy** | Fraction of all signatures correctly classified |
| **Forgery Probability** | Estimated probability that a forged signature passes verification |

These values are outputs of running many simulated experiments — not fixed or assumed in advance.

---

## Repeated Experiments

A single simulation run is not sufficient to make a security claim. The framework runs each scenario many times to build up a statistical picture. For example:

```
Attack type: Forgery
Shots per experiment: 5,000
Number of trials: 100
```

Across all trials, the framework computes the security metrics listed above.

---

## Authentication System

**Issue-1 — Backend Authentication (FastAPI + JWT)**

The backend implements a complete authentication system that binds every cryptographic operation to a verified identity.

### Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/login` | Authenticate with `{username, password}` → returns JWT + user object |
| `POST` | `/auth/register` | Register a new account (verifier role only) |
| `GET` | `/auth/me` | Return the currently authenticated user (requires Bearer token) |

### JWT Token

- Algorithm: `HS256`
- Expiry: 60 minutes (configurable via `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`)
- Claims: `user_id`, `username`, `role`, `iat`, `exp`
- Secret: set via `JWT_SECRET_KEY` environment variable

### Password Security

Passwords are hashed with **bcrypt** and never stored in plain text. Verification uses `bcrypt.checkpw`.

### Role-Based Access Control

Four roles are enforced at the backend level via the `require_roles()` dependency:

| Role | Identity | Access |
|---|---|---|
| `signer` | Alice | Simulation Studio, Batch Benchmarks |
| `verifier` | Bob | Experiment Logs |
| `admin` | Security Admin | Threat Analytics, Batch Benchmarks |
| `adversary` | Eve | Attack Lab (Issue-5) |

### Demo Accounts

Pre-seeded in memory — no database required for these accounts:

| Username | Email | Role | Password |
|---|---|---|---|
| `alice` | alice@qshield.quantum | signer | `qshield123` |
| `bob` | bob@qshield.quantum | verifier | `qshield123` |
| `admin` | admin@qshield.quantum | admin | `qshield123` |
| `eve` | eve@adversary.network | adversary | `qshield123` |

### SecurityContext

`detection/security.py` exports a `SecurityContext` dataclass and `validate_context()` function that binds `user_id` and `role` to every protocol session, rejecting impersonation attempts from unauthorized roles.

### Backend Tests

11 unit tests in `tests/test_auth.py` covering login, registration, token expiry, RBAC, and all four demo accounts:

```bash
pytest tests/test_auth.py -v
```

---

## Frontend Interface

**Issue-2 — Frontend Authentication UI (Next.js + Tailwind CSS)**

### Authentication Modal

The app is fully gated behind authentication. An `AuthModal` appears on first load with three tabs:

- **Demo Personas** — one-click login cards for Alice, Bob, Eve, and Admin. Each card shows a per-role accent colour (cyan / emerald / rose / purple) and a loading spinner on the clicked card only.
- **Sign In** — username and password form.
- **Create Account** — registration form (requires Firestore; see [Known Limitations](#known-limitations)).

### Navbar

The Navbar shows:
- Q-SHIELD logo and SIH26141 badge (consistent with the dashboard)
- Role-filtered navigation tabs — each user only sees tabs their role permits
- Per-role accent colour on the active tab
- Backend status indicator (QISKIT LIVE / OFFLINE)
- Identity badge pill — click to open a dropdown showing username, role, email, access level, cosmetic key fingerprint, and a Sign Out button

### Role-Gated Views

View access is controlled by a single permission map in `src/config/roles.js`. Adding a new view requires one line:

```
overview:   all roles
simulation: signer only
batch:      signer, admin
threats:    admin only
history:    all roles
```

> **Note:** Client-side gating is UX convenience only. The backend enforces real RBAC on every API call.

### Session Persistence

- JWT stored in `localStorage` under `qshield_token`
- On page refresh, token is re-validated against `GET /auth/me` — not trusted blindly from storage
- JWT `exp` claim decoded client-side; automatic logout fires at expiry via `setTimeout`
- Cross-tab sync via the browser `storage` event — sign out in one tab, all tabs log out

### New Files (Issue-2)

| File | Purpose |
|---|---|
| `src/config/roles.js` | Role metadata, demo personas, `VIEW_PERMISSIONS` map, `canAccess()` |
| `src/services/authApi.js` | Fetch wrapper for the three `/auth` endpoints with error normalisation |
| `src/hooks/useAuth.jsx` | `AuthProvider` + `useAuth()` hook |
| `src/components/auth/AuthModal.jsx` | Three-tab authentication modal |
| `src/components/auth/auth.css` | Glassmorphic styles, per-role accents, motion-safe animations |
| `src/components/layout/UserBadge.jsx` | `RoleGate` component |
| `frontend/.env.example` | Environment variable template |

### Modified Files (Issue-2)

| File | Change |
|---|---|
| `src/app/layout.jsx` | Wrapped tree in `<AuthProvider>` |
| `src/app/page.jsx` | Auth gate, session restore spinner, `<RoleGate>` on each view |
| `src/components/Navbar.jsx` | Role-filtered tabs, per-role accent, identity badge dropdown |

---

## Getting Started & Running Locally

### Prerequisites

- Python 3.10+
- Node.js 18+
- pip

### 1. Install Python Dependencies

```bash
cd Q-Shield
pip install -r requirements.txt
```

### 2. Run the Backend

```bash
python run_backend.py
```

Backend runs at `http://127.0.0.1:8000`. Interactive API docs at `http://127.0.0.1:8000/docs`.

### 3. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The AuthModal appears — click any Demo Persona to log in instantly.

### 4. Run Backend Tests

```bash
pytest tests/test_auth.py -v
# 11 tests — login, registration, token expiry, RBAC, demo accounts
```

To run the full test suite:

```bash
pytest
```

### 5. Environment Variables (optional)

Copy `frontend/.env.example` to `frontend/.env.local` and adjust if your backend runs on a different port:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

For Firestore (required for new user registration only):

```env
GOOGLE_APPLICATION_CREDENTIALS=firebase/serviceAccountKey.json
```

> The four demo accounts (alice, bob, admin, eve) are hardcoded in memory and work without any Firestore configuration.

### 6. Build for Production

```bash
cd frontend
set NODE_OPTIONS=--max-old-space-size=512
npx next build
```

---

## Technology Stack

**Frontend**
- Next.js 14 (App Router) — React framework
- Tailwind CSS — utility-first styling with custom obsidian/quantum colour palette
- Lucide React — icons
- Recharts — experiment visualisations

**Backend**
- Python, FastAPI — REST API and quantum simulation engine
- PyJWT — JWT token generation and validation
- bcrypt — password hashing
- Uvicorn — ASGI server

**Quantum Simulation**
- Qiskit, Qiskit Aer — circuit simulation, Bell-state generation, teleportation, Pauli operations, measurements

**Analysis**
- NumPy, SciPy — measurement processing, probability calculations, statistical comparisons

**Data Storage**
- Firebase Firestore — experiment results, security metrics, experiment history (optional for demo)

---

## Project Structure

```
Q-Shield/
├── backend/
│   ├── routers/
│   │   ├── auth.py          # POST /auth/login, /auth/register, GET /auth/me
│   │   ├── attacks.py
│   │   ├── experiments.py
│   │   └── results.py
│   ├── services/
│   │   ├── auth_service.py  # bcrypt, JWT, demo accounts, DEMO_USERS
│   │   └── experiment_service.py
│   ├── dependencies.py      # get_current_user, require_roles RBAC
│   ├── schemas.py           # UserLogin, UserRegister, UserResponse, TokenResponse
│   └── main.py
├── detection/
│   └── security.py          # SecurityContext, validate_context()
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.jsx   # AuthProvider wraps the tree
│   │   │   ├── page.jsx     # Auth gate + RoleGate per view
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── AuthModal.jsx   # Three-tab auth modal
│   │   │   │   └── auth.css        # Glassmorphic styles
│   │   │   ├── layout/
│   │   │   │   └── UserBadge.jsx   # RoleGate component
│   │   │   └── Navbar.jsx          # Role-filtered nav + identity badge
│   │   ├── config/
│   │   │   └── roles.js     # ROLE_ACCENT, DEMO_PERSONAS, VIEW_PERMISSIONS
│   │   ├── hooks/
│   │   │   └── useAuth.jsx  # AuthProvider, useAuth()
│   │   └── services/
│   │       ├── api.js        # Simulation, metrics, health endpoints
│   │       └── authApi.js    # /auth/login, /auth/register, /auth/me
│   └── package.json
├── quantum/                  # QDS protocol simulation
├── attacks/                  # Attack scenario implementations
├── detection/                # Statistical threat detection
├── experiments/              # Experiment pipeline and storage
├── tests/
│   ├── test_auth.py          # 11 auth unit tests
│   └── ...
├── requirements.txt
└── run_backend.py
```

---

## Why No AI/ML?

The problem statement explicitly excludes AI and Machine Learning from the detection method. The framework's detection logic is built from:

- Quantum measurements
- Mathematical and statistical analysis
- Protocol-derived security thresholds

This keeps the detection process explainable and directly tied to the underlying quantum protocol.

---

## Dataset

We do not currently have access to an official SIH26141 dataset.

- The core framework generates its own experimental measurement data by running Qiskit simulations.
- If an official dataset becomes available, it can be used for validation or comparison alongside simulated results.
- Since the problem statement excludes AI/ML, any such dataset will be used for validation only — never as training data.

---

## Expected Deliverables

- Teleportation-based QDS simulation
- Bell-state entanglement simulation
- Pauli correction operations and eigenstate measurements
- Projective measurement analysis
- Simulation of all five attack scenarios
- Statistical threat detection pipeline
- Forgery probability analysis
- Verification accuracy, detection rate, false accept rate, false reject rate
- Support for repeated/batched experiments
- Interactive experiment configuration
- Measurement visualisation
- Security analysis with explanation of detection decisions
- Experiment history
- JWT-based authentication with role-based access control
- Glassmorphic authentication UI with demo persona one-click login
- Role-filtered navigation and identity badge

---

## Key Principles

- **No AI/ML** — detection relies on quantum measurements and statistical methods only.
- **Explainable** — detection decisions are reported along with the reasoning behind them.
- **Experiment-driven** — performance claims come from repeated simulations, not single demonstrations.
- **Protocol-grounded** — detection logic is tied to the specific QDS protocol being simulated.
- **Identity-bound** — every cryptographic operation is bound to a verified user identity and role via JWT and SecurityContext.

---

## Known Limitations

- **Create Account requires Firestore.** The `POST /auth/register` endpoint calls `create_user()` which writes to Firestore. Without `GOOGLE_APPLICATION_CREDENTIALS` configured, the request crashes before sending a response. The four demo accounts work without Firestore. This will be resolved in Issue-6 (local JSON fallback).

- **Key fingerprint is cosmetic.** The fingerprint shown in the Navbar identity badge is a djb2 hash of `user_id + username` derived client-side. It is not real Table-1 QDS key material. The backend `UserResponse` schema does not currently return a public key field. This is a pending request for Issue-1.

- **Client-side role gating is UX only.** The `RoleGate` component and filtered nav tabs are convenience features. The backend enforces real RBAC on every API call via `require_roles()`.

---

## Disclaimer

This project is a software simulation and research prototype. Results from simulated quantum environments are not proof of security for real-world quantum communication systems. Security conclusions depend on the correctness of the implemented QDS protocol, the attack model used, the statistical analysis applied, and the assumptions underlying all of these.
