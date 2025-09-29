import React, { act } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

// Mock server to intercept API requests
let mockItems = [
  { id: 1, name: 'Test Item 1', created_at: '2023-01-01T00:00:00.000Z', priority: 'P1' },
  { id: 2, name: 'Test Item 2', created_at: '2023-01-02T00:00:00.000Z', priority: 'P2' }
];

const server = setupServer(
  // GET /api/items handler
  rest.get('/api/items', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockItems));
  }),

  // POST /api/items handler
  rest.post('/api/items', (req, res, ctx) => {
    const { name, priority } = req.body;
    if (!name || name.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Item name is required' }));
    }
    const newItem = {
      id: mockItems.length + 1,
      name,
      priority: ['P1','P2','P3'].includes(priority) ? priority : 'P3',
      created_at: new Date().toISOString()
    };
    mockItems.push(newItem);
    return res(ctx.status(201), ctx.json(newItem));
  }),

  // PUT priority update
  rest.put('/api/items/:id/priority', (req, res, ctx) => {
    const { id } = req.params;
    const { priority } = req.body;
    if (!['P1','P2','P3'].includes(priority)) {
      return res(ctx.status(400), ctx.json({ error: 'Invalid priority value' }));
    }
    const idx = mockItems.findIndex(i => i.id === Number(id));
    if (idx === -1) return res(ctx.status(404), ctx.json({ error: 'Item not found' }));
    mockItems[idx] = { ...mockItems[idx], priority };
    return res(ctx.status(200), ctx.json(mockItems[idx]));
  })
);

// Setup and teardown for the mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the header', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText('React Frontend with Node Backend')).toBeInTheDocument();
    expect(screen.getByText('Connected to in-memory database')).toBeInTheDocument();
  });

  test('loads and displays items', async () => {
    await act(async () => {
      render(<App />);
    });
    
    // Initially shows loading state
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    });
  });

  test('adds a new item with default P3 priority', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    });
    
    // Fill in the form and submit
    const input = screen.getByPlaceholderText('Enter item name');
    await act(async () => {
      await user.type(input, 'New Test Item');
    });
    
    const submitButton = screen.getByText('Add Item');
    await act(async () => {
      await user.click(submitButton);
    });
    
    // Check new item appears and has default selected P3 button
    await waitFor(() => {
      expect(screen.getByText('New Test Item')).toBeInTheDocument();
      const p3Buttons = screen.getAllByText('P3');
      // At least one P3 should be selected (new item). We check selected class via DOM query.
      const selected = p3Buttons.filter(btn => btn.classList.contains('selected'));
      expect(selected.length).toBeGreaterThan(0);
    });
  });

  test('updates priority when clicking another button', async () => {
    const user = userEvent.setup();

    await act(async () => { render(<App />); });
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });

    // Find first item's P3 button (should not be selected initially) and click P3 to change from P1
    const firstItem = screen.getByText('Test Item 1').closest('li');
    const p3Button = within(firstItem).getByText('P3');
    await act(async () => { await user.click(p3Button); });

    // After click, button should have selected class
    expect(p3Button.classList.contains('selected')).toBe(true);
  });

  test('handles API error', async () => {
    // Override the default handler to simulate an error
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch data/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no items', async () => {
    // Override the default handler to return empty array
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for empty state message
    await waitFor(() => {
      expect(screen.getByText('No items found. Add some!')).toBeInTheDocument();
    });
  });
});