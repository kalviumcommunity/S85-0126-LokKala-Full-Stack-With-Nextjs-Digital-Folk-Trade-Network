import Button from '@/components/ui/Button';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Button component', () => {
  it('renders label and handles clicks', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<Button label="Click Me" onClick={handleClick} />);

    await user.click(screen.getByRole('button', { name: /click me/i }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading spinner and disables interaction', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<Button label="Loading" onClick={handleClick} isLoading />);

    const button = screen.getByRole('button', { name: /loading/i });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
