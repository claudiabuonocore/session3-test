# Story: Add priority field with default P3

## Acceptance Criteria

- New tasks created without an explicit priority are stored with priority value "P3".
- Priority field supports only values "P1", "P2", "P3".
- Selecting a different priority for an existing task should update the task's priority.
- Ensure priority selections are saved to in-memory.

## Technical Requirements

- In the backend, implement a `PUT` request to update existing task item's priority.
- Extend in-memory task object shape in frontend state to include `priority`.
- The default selected priority in the FE for a new task should be `priority: 'P3'`.
- Update local storage serialization to persist `priority`.
- Add UI control constrained to P1/P2/P3.
- Add unit tests for new features.
