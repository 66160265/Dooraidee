import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from './Pagination';

describe('Pagination', () => {
    test('renders nothing when there is one page or fewer', () => {
        const { container } = render(<Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />);
        expect(container).toBeEmptyDOMElement();
    });

    test('renders every page number with no ellipsis when the total is small', () => {
        render(<Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />);
        for (const n of [1, 2, 3, 4, 5]) {
            expect(screen.getByRole('button', { name: String(n) })).toBeInTheDocument();
        }
        expect(screen.queryByText('···')).not.toBeInTheDocument();
    });

    test('collapses the middle of a long page range into ellipses around the current page', () => {
        render(<Pagination currentPage={10} totalPages={20} onPageChange={() => {}} />);

        expect(screen.getAllByText('···')).toHaveLength(2);
        for (const n of [1, 8, 9, 10, 11, 12, 20]) {
            expect(screen.getByRole('button', { name: String(n) })).toBeInTheDocument();
        }
        expect(screen.queryByRole('button', { name: '7' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '13' })).not.toBeInTheDocument();
    });

    test('disables ก่อนหน้า on the first page and ถัดไป on the last page', () => {
        const { rerender } = render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
        expect(screen.getByRole('button', { name: 'ก่อนหน้า' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'ถัดไป' })).not.toBeDisabled();

        rerender(<Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />);
        expect(screen.getByRole('button', { name: 'ถัดไป' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'ก่อนหน้า' })).not.toBeDisabled();
    });

    test('clicking a page number calls onPageChange with that page', async () => {
        const onPageChange = vi.fn();
        render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);

        await userEvent.click(screen.getByRole('button', { name: '3' }));
        expect(onPageChange).toHaveBeenCalledWith(3);
    });

    test('clicking ถัดไป calls onPageChange with currentPage + 1', async () => {
        const onPageChange = vi.fn();
        render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);

        await userEvent.click(screen.getByRole('button', { name: 'ถัดไป' }));
        expect(onPageChange).toHaveBeenCalledWith(3);
    });
});
