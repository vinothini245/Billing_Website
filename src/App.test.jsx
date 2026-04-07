import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from './App';
import { fetchMenu, createMenuItem } from './api';

vi.mock('./api', () => ({
  fetchMenu: vi.fn(),
  createMenuItem: vi.fn(),
  updateMenuItem: vi.fn(),
  removeMenuItem: vi.fn(),
}));

const sampleMenu = [
  {
    id: 'idly',
    name: 'Idly',
    price: 30,
    image: '',
    category: 'Breakfast',
  },
];

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  window.print = vi.fn();
  window.confirm = vi.fn(() => true);
  fetchMenu.mockResolvedValue(sampleMenu);
});

it('adds menu items to the cart and saves an order', async () => {
  const user = userEvent.setup();
  render(<App />);

  const addButton = await screen.findByRole('button', { name: /add to bill/i });
  await user.click(addButton);

  const cartHeading = await screen.findByRole('heading', { name: /current bill/i });
  const cartPanel = cartHeading.closest('.cart-panel');
  expect(cartPanel).not.toBeNull();
  expect(within(cartPanel).getByRole('button', { name: /remove/i })).toBeInTheDocument();
  expect(screen.getByText(/Grand Total/)).toBeInTheDocument();

  const checkoutButton = screen.getByRole('button', { name: /checkout & save bill/i });
  await user.click(checkoutButton);

  expect(await screen.findByText(/Last Receipt/i)).toBeInTheDocument();
});

it('clears the cart when requested', async () => {
  const user = userEvent.setup();
  render(<App />);

  const addButton = await screen.findByRole('button', { name: /add to bill/i });
  await user.click(addButton);
  const cartHeading = await screen.findByRole('heading', { name: /current bill/i });
  const cartPanel = cartHeading.closest('.cart-panel');
  expect(within(cartPanel).getByRole('button', { name: /remove/i })).toBeInTheDocument();

  const clearButton = screen.getByRole('button', { name: /clear cart/i });
  await user.click(clearButton);

  expect(within(cartPanel).queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
  expect(await screen.findByText(/Tap any item to start a bill/i)).toBeInTheDocument();
});

it('creates a new menu item from the manage tab', async () => {
  fetchMenu.mockResolvedValueOnce(sampleMenu).mockResolvedValueOnce([
    ...sampleMenu,
    { id: 'vada', name: 'Vada', price: 25, image: '', category: 'Snack' },
  ]);
  const user = userEvent.setup();
  render(<App />);

  const manageTab = screen.getByRole('button', { name: /manage menu/i });
  await user.click(manageTab);

  await user.type(screen.getByLabelText(/Name/i), 'Vada Curry');
  await user.type(screen.getByLabelText(/Price/i), '80');
  await user.type(screen.getByLabelText(/Image URL/i), 'https://example.com/vada.jpg');
  await user.type(screen.getByLabelText(/Category/i), 'Snack');

  createMenuItem.mockResolvedValue({
    id: 'vada-curry',
    name: 'Vada Curry',
    price: 80,
    image: 'https://example.com/vada.jpg',
    category: 'Snack',
  });

  await user.click(screen.getByRole('button', { name: /create item/i }));

  await waitFor(() =>
    expect(createMenuItem).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Vada Curry', price: 80 }),
    ),
  );
});

