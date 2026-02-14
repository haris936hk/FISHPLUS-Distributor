import { useState, useCallback } from 'react';
import { Box, Container, Group, Title, Button, Tabs } from '@mantine/core';
import PropTypes from 'prop-types';
import { PurchaseForm, PurchaseSearch } from '../components';

/**
 * Purchases Page Component
 * Container for Purchases module with tabs for new purchase entry and search.
 *
 * @param {function} onBack - Callback to navigate back to dashboard
 */
function Purchases({ onBack }) {
  const [activeTab, setActiveTab] = useState('new');
  const [editPurchase, setEditPurchase] = useState(null);

  // Handle purchase saved
  const handlePurchaseSaved = useCallback(() => {
    setEditPurchase(null);
    setActiveTab('search');
  }, []);

  // Handle edit from search
  const handleEdit = useCallback(async (purchase) => {
    try {
      const response = await window.api.purchases.getById(purchase.id);
      if (response.success) {
        setEditPurchase(response.data);
        setActiveTab('new');
      }
    } catch (error) {
      console.error('Failed to load purchase:', error);
    }
  }, []);

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditPurchase(null);
  }, []);

  return (
    <Box
      className="min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #1a4731 0%, #2d3748 50%, #1a202c 100%)',
      }}
    >
      <Container size="xl" py="xl">
        {/* Header */}
        <Group justify="space-between" align="center" mb="xl">
          <Title order={2} c="white">
            📦 Purchases / خریداری
          </Title>
          <Button variant="light" color="gray" onClick={onBack}>
            ← Back to Dashboard
          </Button>
        </Group>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List mb="md">
            <Tabs.Tab value="new" color="green">
              {editPurchase ? 'Edit Purchase' : 'New Purchase'}
            </Tabs.Tab>
            <Tabs.Tab value="search" color="teal">
              Search Purchases
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="new">
            <PurchaseForm
              editPurchase={editPurchase}
              onSaved={handlePurchaseSaved}
              onCancel={editPurchase ? handleCancelEdit : null}
            />
          </Tabs.Panel>

          <Tabs.Panel value="search">
            <PurchaseSearch onEdit={handleEdit} />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </Box>
  );
}

Purchases.propTypes = {
  onBack: PropTypes.func.isRequired,
};

export default Purchases;
