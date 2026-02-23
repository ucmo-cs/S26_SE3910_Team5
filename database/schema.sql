-- =========================
-- USERS
-- =========================
CREATE TABLE users (
                       user_id BIGSERIAL PRIMARY KEY,
                       first_name VARCHAR(50) NOT NULL,
                       last_name VARCHAR(50),
                       email VARCHAR(255) NOT NULL UNIQUE,
                       phone VARCHAR(20),
                       created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- BRANCHES
-- =========================
CREATE TABLE branches (
                          branch_id BIGSERIAL PRIMARY KEY,
                          branch_name VARCHAR(150) NOT NULL,
                          address VARCHAR(255) NOT NULL
);

-- =========================
-- TIMESLOTS
-- =========================
CREATE TABLE timeslots (
                           time_slot_id BIGSERIAL PRIMARY KEY,
                           branch_id BIGINT NOT NULL,
                           start_time TIMESTAMPTZ NOT NULL,
                           end_time TIMESTAMPTZ NOT NULL,
                           is_available BOOLEAN DEFAULT TRUE,

                           CONSTRAINT fk_branch
                               FOREIGN KEY (branch_id)
                                   REFERENCES branches(branch_id)
                                   ON DELETE CASCADE,

                           CONSTRAINT unique_branch_start
                               UNIQUE (branch_id, start_time)
);

-- =========================
-- APPOINTMENTS
-- =========================
CREATE TABLE appointments (
                              appointment_id BIGSERIAL PRIMARY KEY,
                              user_id BIGINT NOT NULL,
                              time_slot_id BIGINT NOT NULL,
                              type VARCHAR(50) NOT NULL,
                              status VARCHAR(20) NOT NULL,
                              created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

                              CONSTRAINT fk_user
                                  FOREIGN KEY (user_id)
                                      REFERENCES users(user_id)
                                      ON DELETE CASCADE,

                              CONSTRAINT fk_timeslot
                                  FOREIGN KEY (time_slot_id)
                                      REFERENCES timeslots(time_slot_id)
                                      ON DELETE CASCADE,

                              CONSTRAINT status_check
                                  CHECK (status IN ('booked', 'completed', 'canceled'))
);

-- =========================
-- PREVENT DOUBLE BOOKING
-- =========================
CREATE UNIQUE INDEX unique_active_slot
    ON appointments (time_slot_id)
    WHERE status IN ('booked', 'completed');

-- =========================
-- PERFORMANCE INDEXES
-- =========================
CREATE INDEX idx_appointments_user
    ON appointments(user_id);

CREATE INDEX idx_appointments_timeslot
    ON appointments(time_slot_id);

CREATE INDEX idx_timeslots_branch
    ON timeslots(branch_id);

-- =========================
-- TRIGGER FUNCTION
-- =========================
CREATE OR REPLACE FUNCTION handle_appointment_status()
RETURNS TRIGGER AS $$
BEGIN

    IF TG_OP = 'INSERT' THEN
        IF NEW.status IN ('booked', 'completed') THEN
UPDATE timeslots
SET is_available = FALSE
WHERE time_slot_id = NEW.time_slot_id;
END IF;
RETURN NEW;
END IF;

    IF TG_OP = 'UPDATE' THEN
        IF NEW.status = 'canceled' THEN
UPDATE timeslots
SET is_available = TRUE
WHERE time_slot_id = NEW.time_slot_id;
END IF;

        IF NEW.status IN ('booked', 'completed') THEN
UPDATE timeslots
SET is_available = FALSE
WHERE time_slot_id = NEW.time_slot_id;
END IF;

RETURN NEW;
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- TRIGGER
-- =========================
CREATE TRIGGER appointment_status_trigger
    AFTER INSERT OR UPDATE ON appointments
                        FOR EACH ROW
                        EXECUTE FUNCTION handle_appointment_status();
