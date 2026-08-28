from pprint import pprint
from attacks import get_attack


def sample_experiment():
    return {
        "experiment_id": "EXP001",
        "message": "HELLO",
        "sender_id": "alice",
        "receiver_id": "bob",
        "session_id": "SESSION123",
        "timestamp": 1234567890,
        "signature": {
            "basis": "Z",
            "expected_state": "0"
        },
        "measurements": {
            "0": 950,
            "1": 50
        }
    }


experiment = sample_experiment()

print("\n========== ORIGINAL ==========")
pprint(experiment)


# 1. FORGERY
attack = get_attack("forgery", forged_state="1")
result = attack.apply(experiment)

print("\n========== FORGERY ==========")
pprint(result)


# 2. REPLAY
attack = get_attack("replay")
result = attack.apply(experiment)

print("\n========== REPLAY ==========")
pprint(result)


# 3. IMPERSONATION
attack = get_attack(
    "impersonation",
    attacker_id="mallory"
)
result = attack.apply(experiment)

print("\n========== IMPERSONATION ==========")
pprint(result)


# 4. UNAUTHORIZED VERIFICATION
attack = get_attack(
    "unauthorized_verification",
    verifier_id="eve"
)
result = attack.apply(experiment)

print("\n========== UNAUTHORIZED VERIFICATION ==========")
pprint(result)


# 5. CHANNEL MANIPULATION
attack = get_attack(
    "channel_manipulation",
    manipulation_type="bit_flip",
    probability=0.2
)
result = attack.apply(experiment)

print("\n========== CHANNEL MANIPULATION ==========")
pprint(result)


print("\n========== ORIGINAL AFTER ALL ATTACKS ==========")
pprint(experiment)