import { render, screen } from '@testing-library/react';
import AlphaGo from './AlphaGo';

test('renders learn react link', () => {
  render(<AlphaGo />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
