import React from 'react';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Table } from '@mantine/core';
import { MantineProvider } from '@mantine/core';

describe('Mantine Table element tags', () => {
  it('should render standard html table elements', () => {
    const { container } = render(
      <MantineProvider>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Header 1</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>Data 1</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </MantineProvider>
    );

    console.log(container.innerHTML);

    const tables = container.querySelectorAll('table');
    console.log('Tables found:', tables.length);

    if (tables.length > 0) {
      const tbodys = tables[0].querySelectorAll('tbody');
      console.log('tbodys found:', tbodys.length);

      const rows = tables[0].querySelectorAll('tbody tr');
      console.log('tbody rows found:', rows.length);
    }
  });
});
