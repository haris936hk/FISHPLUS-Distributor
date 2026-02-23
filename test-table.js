import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Table, MantineProvider } from '@mantine/core';

const html = renderToStaticMarkup(
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

console.log('---HTML---');
console.log(html);
