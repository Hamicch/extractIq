import { render, screen } from '@testing-library/react';
import { DocumentStatusBadge } from '../DocumentStatusBadge';

describe('DocumentStatusBadge', () => {
  it('should render uploading status with correct styling', () => {
    render(<DocumentStatusBadge status="uploading" />);

    const badge = screen.getByText('Uploading');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('bg-neutral-100');
  });

  it('should render queued status with correct styling', () => {
    render(<DocumentStatusBadge status="queued" />);

    const badge = screen.getByText('Queued');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('bg-neutral-100');
  });

  it('should render processing status with correct styling', () => {
    render(<DocumentStatusBadge status="processing" />);

    const badge = screen.getByText('Processing');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('bg-blue-100');
  });

  it('should render completed status with correct styling', () => {
    render(<DocumentStatusBadge status="completed" />);

    const badge = screen.getByText('Completed');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('bg-green-100');
  });

  it('should render failed status with correct styling', () => {
    render(<DocumentStatusBadge status="failed" />);

    const badge = screen.getByText('Failed');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('bg-red-100');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <DocumentStatusBadge status="completed" className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render appropriate icon for each status', () => {
    const statuses: Array<
      'uploading' | 'queued' | 'processing' | 'completed' | 'failed'
    > = ['uploading', 'queued', 'processing', 'completed', 'failed'];

    statuses.forEach((status) => {
      const { container } = render(<DocumentStatusBadge status={status} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  // Snapshot test
  it('should match snapshot for all statuses', () => {
    const statuses: Array<
      'uploading' | 'queued' | 'processing' | 'completed' | 'failed'
    > = ['uploading', 'queued', 'processing', 'completed', 'failed'];

    statuses.forEach((status) => {
      const { container } = render(<DocumentStatusBadge status={status} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
