## Database Setup (PostgreSQL)

### Requirements
- PostgreSQL 14+

### Setup Steps

1. Create a database:

   CREATE DATABASE commerce_bank;

2. Connect to the database.

3. Run the schema:

   database/schema.sql

4. (Optional) Insert sample data:

   database/seed.sql


## Database Schema Overview

### Tables

| Table        | Purpose |
|--------------|----------|
| users        | Stores customer information |
| branches     | Stores branch locations |
| timeslots    | Stores appointment time availability per branch |
| appointments | Stores booked, completed, or canceled appointments |

---

### Key Relationships

- A branch has many timeslots.
- A user has many appointments.
- A timeslot can have only one active appointment (booked/completed).



## Business Rules Enforced by Database

1. A timeslot can only have one active appointment.
2. Canceling an appointment automatically reopens it to the timeslot table.
3. Deleting a branch deletes its timeslots and related appointments.
4. Deleting a user deletes their appointments.
5. Allowed appointment statuses:
    - *booked*
    - *completed*
    - *canceled*


## Performance Considerations

Indexes included:

- idx_appointments_user
- idx_appointments_timeslot
- idx_timeslots_branch
- unique_active_slot (prevents double booking)


## Common Query Patterns

- Get available timeslots by branch and date
- Get all appointments for a user
- Book an appointment (insert into appointments)
- Cancel an appointment (update status to 'canceled')


Tested On:
- PostgreSQL 18.2
