-- purely for testing purposes

-- =========================
-- BRANCHES
-- =========================
INSERT INTO branches (branch_name, address)
VALUES
    ('Main Branch', '123 Main St'),
    ('North Branch', '456 North Ave');

-- =========================
-- USERS
-- =========================
INSERT INTO users (first_name, last_name, email, phone)
VALUES
    ('John', 'Doe', 'john@example.com', '111-111-1111'),
    ('Jane', 'Smith', 'jane@example.com', '222-222-2222'),
    ('Alice', 'Brown', 'alice@example.com', '333-333-3333');

-- =========================
-- TIMESLOTS (for March 1, 2026)
-- =========================
INSERT INTO timeslots (branch_id, start_time, end_time)
VALUES
-- Branch 1
(1, '2026-03-01 11:00:00-06', '2026-03-01 11:30:00-06'),
(1, '2026-03-01 11:30:00-06', '2026-03-01 12:00:00-06'),
(1, '2026-03-01 12:00:00-06', '2026-03-01 12:30:00-06'),

-- Branch 2
(2, '2026-03-01 11:00:00-06', '2026-03-01 11:30:00-06'),
(2, '2026-03-01 11:30:00-06', '2026-03-01 12:00:00-06');

-- =========================
-- APPOINTMENTS
-- =========================
INSERT INTO appointments (user_id, time_slot_id, type, status)
VALUES
    (1, 1, 'Loan Consultation', 'booked'),
    (2, 2, 'Account Opening', 'completed');

-- Cancel one to demonstrate trigger reopening
INSERT INTO appointments (user_id, time_slot_id, type, status)
VALUES
    (3, 3, 'Mortgage Inquiry', 'canceled');
