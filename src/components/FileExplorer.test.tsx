import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileExplorer from './FileExplorer';

describe('FileExplorer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders FileExplorer component', () => {
    render(<FileExplorer />);
    expect(screen.getByText('New File')).toBeInTheDocument();
    expect(screen.getByText('New Folder')).toBeInTheDocument();
  });

  test('creates a new file', () => {
    render(<FileExplorer />);
    fireEvent.click(screen.getByText('New File'));
    expect(screen.getByText('New File', { selector: 'span' })).toBeInTheDocument();
  });

  test('creates a new folder', () => {
    render(<FileExplorer />);
    fireEvent.click(screen.getByText('New Folder'));
    expect(screen.getByText('New Folder', { selector: 'span' })).toBeInTheDocument();
  });

  test('deletes a file', () => {
    render(<FileExplorer />);
    fireEvent.click(screen.getByText('New File'));
    const deleteButton = screen.getAllByRole('button')[2]; // The third button should be the delete button
    fireEvent.click(deleteButton);
    expect(screen.queryByText('New File', { selector: 'span' })).not.toBeInTheDocument();
  });
});