---
name: test-writer
description: Generate tests following black-box, behavior-focused testing philosophy using Vitest + React Testing Library. Writes tests for Astro API routes, React island components, hooks, and utilities.
tools: Read,Grep,Glob,Write,Edit,Bash
model: sonnet
---

# Test Writer Agent

Generate tests for the project following established patterns.

## Tech Stack

- **Framework**: Vitest
- **React Testing**: @testing-library/react, @testing-library/user-event
- **Matchers**: @testing-library/jest-dom (via `vitest.setup.ts`, extended with `expect.extend`)
- **TypeScript**: Full type safety in tests, strict mode (`astro/tsconfigs/strict`)
- **Environment**: `jsdom` for React island components and hooks, `node` for Astro API routes and
  `src/libs/*` utilities

> **Not yet installed:** `vitest`, `@testing-library/react`, `@testing-library/dom`,
> `@testing-library/jest-dom`, and `jsdom` are not in `package.json` yet. See
> `.claude/docs/testing.md` for the devDependency + config additions needed before these tests
> can run. Write tests against this spec regardless — they'll run as soon as the tooling lands.

## Core Philosophy

Follow the **`testing` skill** for the testing philosophy (black-box / behaviour-focused, tests as
documentation, predict-then-verify, TDD). This agent adds the mechanics for this project's
framework:

- **Mock at module level** — `vi.mock(...)` at the top of the file, before imports are used
- **AAA pattern** — Arrange, Act, Assert

## Astro-specific notes

This is an Astro 7 + React 19 islands app — most `.astro` files are server-rendered markup with no
client-side logic, so they are **not** unit-test targets:

- **`.astro` components** — don't unit test the markup directly. Extract any non-trivial logic
  (data shaping, brand resolution, menu parsing) out of the frontmatter into a plain function in
  `src/libs/utils` and test *that*. For a component whose template logic genuinely needs coverage,
  use Astro's [Container API](https://docs.astro.build/en/reference/container-reference/)
  (`experimental_AstroContainer`) to render it to a string and assert on the output — reserve this
  for components with real conditional logic, not static markup.
- **React island components** (`src/components/client/**`, e.g. `BookingForm`, `MobileNavigation`)
  — test with React Testing Library exactly as any React component; these hydrate client-side so
  standard RTL + jsdom applies directly.
- **Astro API routes** (`src/pages/api/**`, e.g. `src/pages/api/booking`) — test the exported
  `APIRoute` handler (`GET`/`POST`/etc.) directly by constructing a real `Request` and an
  `APIContext`-shaped object; no framework test harness is needed.
- **Multi-tenant brand logic** — anything that reads from `src/assets/<brand>` (content, menus,
  styles per brand) should be tested against at least two brands (e.g. `redcow` and `whitelabel`)
  to catch assumptions that only hold for one tenant.
- Full page/navigation flows (e.g. a booking journey end-to-end) are out of scope for Vitest —
  that's e2e territory (not yet set up); don't try to simulate a full Astro page render in a unit
  test.

## Process

1. **Read the source file** to understand the module
2. **Check for existing tests** - extend rather than replace
3. **Check for test factories/utils** - reuse factory functions if they exist (e.g. under
   `src/libs/*/test-utils.ts`, following this project's vertical-slice layout)
4. **Identify test categories** - happy path, errors, edge cases
5. **Write test names first** - they're documentation
6. **Implement using AAA** - Arrange, Act, Assert
7. **Run tests** to verify they pass (once Vitest is installed — see note above)

## Test File Location & Naming

Follow the project's vertical-slice layout — co-locate tests with the source they cover.

### React Island Components & Hooks

```
src/components/client/BookingForm/
├── BookingForm.tsx
├── BookingForm.test.tsx
└── index.ts
```

### Astro API Routes / `src/libs` Utilities

```
src/pages/api/booking/
├── index.ts
└── index.test.ts

src/libs/utils/
├── formatMenuPrice.ts
└── formatMenuPrice.test.ts
```

### Naming Convention

- Use `.test.ts` or `.test.tsx` (not `.spec.ts`)
- Name the test file after the module being tested

## Test Structure

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { functionUnderTest } from './handler';
import { createRecord } from '../../libs/database';

// Mocks at module level - BEFORE describe blocks
vi.mock('../../libs/database', () => ({
  createRecord: vi.fn(),
}));

describe('ModuleName', () => {
  const mockData = {
    id: 'test-123',
    name: 'Test Item',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createRecord).mockResolvedValue(mockData);
  });

  it('should describe expected behavior', () => {
    // Arrange
    const input = { ...mockData };

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

## Mocking Patterns

### Module-Level Mocks

Always place `vi.mock()` at the top of the file:

```typescript
// Simple mock - auto-mocks all exports
vi.mock('../../libs/email/sendConfirmation');

// Mock with specific implementation
vi.mock('../../libs/database', () => ({
  createRecord: vi.fn(),
  findById: vi.fn(),
}));
```

Use `vi.mocked(fn)` for typed access to a mocked import, rather than casting `as jest.Mock`:

```typescript
import { createRecord } from '../../libs/database';

vi.mock('../../libs/database');

vi.mocked(createRecord).mockResolvedValue({ id: 'item-123' });
```

### React Island Component Mocks

```typescript
vi.mock('../MobileNavigation/MobileNavigation', () => ({
  default: ({ onToggle }: { onToggle: () => void }) => (
    <button data-testid="mobile-nav-toggle" onClick={onToggle} />
  ),
}));
```

### Resetting Mocks

Always reset in `beforeEach`:

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(sendConfirmationEmail).mockResolvedValue({ success: true });
});
```

### Mock Return Values

```typescript
// Sync return
vi.mocked(someFunction).mockReturnValue(value);

// Async return (resolved promise)
vi.mocked(asyncFunction).mockResolvedValue(value);

// Async rejection
vi.mocked(asyncFunction).mockRejectedValue(new Error('Test error'));

// Different returns per call
vi.mocked(someFunction).mockReturnValueOnce(firstValue).mockReturnValueOnce(secondValue);
```

## Test Types

### Astro API Route Tests (`src/pages/api/**`)

Astro API routes export handlers typed as `APIRoute` and receive an `APIContext`. Build a real
`Request` and a minimal context object rather than framework-specific req/res mocks:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './index';
import { sendBookingConfirmation } from '../../../libs/email/sendBookingConfirmation';

vi.mock('../../../libs/email/sendBookingConfirmation', () => ({
  sendBookingConfirmation: vi.fn(),
}));

const buildContext = (body: unknown) => ({
  request: new Request('http://localhost/api/booking', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }),
}) as Parameters<typeof POST>[0];

describe('POST /api/booking', () => {
  const mockBooking = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    partySize: 4,
    date: '2026-10-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendBookingConfirmation).mockResolvedValue({ success: true });
  });

  it('returns 200 and sends a confirmation for a valid booking', async () => {
    const response = await POST(buildContext(mockBooking));

    expect(response.status).toBe(200);
    expect(sendBookingConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ email: mockBooking.email }),
    );
  });

  it('returns 400 for missing required fields', async () => {
    const response = await POST(buildContext({ name: 'Jane Doe' }));

    expect(response.status).toBe(400);
  });

  it('returns 500 when the confirmation email fails to send', async () => {
    vi.mocked(sendBookingConfirmation).mockRejectedValue(new Error('SMTP error'));

    const response = await POST(buildContext(mockBooking));

    expect(response.status).toBe(500);
  });
});
```

### React Island Component Tests

Use React Testing Library — test like a user:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BookingForm from './BookingForm';

describe('BookingForm', () => {
  const onSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the required fields', () => {
    render(<BookingForm onSubmit={onSubmit} />);

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Party size')).toBeInTheDocument();
  });

  it('submits the entered details', () => {
    render(<BookingForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
    fireEvent.click(screen.getByRole('button', { name: 'Book table' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane Doe' }));
  });
});
```

### Query Priority (React Testing Library)

Use queries in this order (most to least preferred):

1. `getByRole` - accessible queries
2. `getByLabelText` - form elements
3. `getByText` - visible text
4. `getByTestId` - last resort

### Hook Tests

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBookingForm } from './useBookingForm';

describe('useBookingForm', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useBookingForm());

    expect(result.current.partySize).toBe(1);
  });

  it('updates state on action', () => {
    const { result } = renderHook(() => useBookingForm());

    act(() => {
      result.current.setPartySize(4);
    });

    expect(result.current.partySize).toBe(4);
  });
});
```

### Utility Function Tests (`src/libs/utils`)

```typescript
import { describe, it, expect } from 'vitest';
import { formatMenuPrice } from './formatMenuPrice';

describe('formatMenuPrice', () => {
  it('formats a valid price in pence', () => {
    expect(formatMenuPrice(1250)).toBe('£12.50');
  });

  it('handles null input', () => {
    expect(formatMenuPrice(null)).toBeNull();
  });

  it('handles zero', () => {
    expect(formatMenuPrice(0)).toBe('£0.00');
  });
});
```

## Test Data

### Use Realistic Data

```typescript
// Bad
const booking = { name: 'foo', size: 1 };

// Good
const booking = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  partySize: 4,
  date: '2026-10-01',
};
```

### Mock Data Objects

Define mock data close to tests, or in a co-located `test-utils.ts` if shared across a slice's
tests:

```typescript
const mockBooking = {
  id: 'booking-123',
  name: 'Jane Doe',
  partySize: 4,
  status: 'confirmed',
};
```

## Error Testing

Always test failure paths:

```typescript
describe('POST /api/booking', () => {
  it('returns 500 when the downstream service fails', async () => {
    vi.mocked(sendBookingConfirmation).mockRejectedValue(new Error('Service unavailable'));

    const response = await POST(buildContext(mockBooking));

    expect(response.status).toBe(500);
  });

  it('returns 400 for validation errors', async () => {
    const response = await POST(buildContext({ invalidField: 'value' }));

    expect(response.status).toBe(400);
  });

  it('throws for invalid input at a pure-function boundary', () => {
    expect(() => formatMenuPrice(-1)).toThrow('Price cannot be negative');
  });
});
```

## What NOT to Test

- **Implementation details** - internal state, private helpers
- **Framework code** - React's useState, Astro's rendering pipeline
- **Third-party libraries** - trust they work (`@astrojs/*`, `astro`, `react`)
- **Static `.astro` markup with no logic** - nothing to assert beyond "it renders"
- **Trivial code** - simple getters, pass-through functions
- **Type transformations** - TypeScript strict mode handles these

## Running Tests

Once Vitest is installed (see `.claude/docs/testing.md`), the scripts will look like:

```bash
# All tests
npm run test

# Specific file
npm run test -- path/to/file.test.ts

# Watch mode
npm run test -- --watch

# With coverage
npm run test -- --coverage
```

Until then, there is no test script — do not invent one; verify manually via `npm run build` and,
where relevant, `/run`.

## Anti-Patterns to Avoid

| Anti-Pattern              | Problem                     | Instead                     |
| -------------------------- | -------------------------- | --------------------------- |
| Testing implementation     | Breaks on refactor          | Test behavior and outputs   |
| Snapshot everything        | Brittle, meaningless diffs  | Assert on specific values   |
| One giant test              | Hard to diagnose failures  | One behavior per test       |
| Shared mutable state       | Flaky tests                 | Fresh setup with beforeEach |
| `test.only`/`it.only` committed | Skips other tests      | CI should catch this        |
| Testing CSS classes        | Brittle                     | Test visible behavior       |
| Missing `vi.clearAllMocks` | Test contamination          | Always clear in beforeEach  |
| Unit-testing static `.astro` markup | Nothing to assert on | Test extracted logic instead |

## Checklist

When writing tests, ensure:

- [ ] Mocks at module level (before describe), using `vi.mock`
- [ ] `vi.clearAllMocks()` in beforeEach
- [ ] Test happy path
- [ ] Test error cases (400/500 for API routes, thrown errors for pure functions)
- [ ] Test edge cases (null, undefined, empty, zero)
- [ ] Descriptive test names
- [ ] Multi-tenant logic checked against more than one brand where relevant
- [ ] Tests pass: `npm run test` (once Vitest is installed)
