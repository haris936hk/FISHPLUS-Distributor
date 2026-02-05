import { Button, Text, Group } from '@mantine/core';
import PropTypes from 'prop-types';

/**
 * DashboardButton Component
 * Navigation button for the dashboard with icon support and consistent styling.
 *
 * @param {string} label - Button text label
 * @param {React.ReactNode} icon - Optional icon element
 * @param {function} onClick - Click handler
 * @param {boolean} disabled - Whether button is disabled
 * @param {string} variant - Button color variant
 */
function DashboardButton({ label, icon, onClick, disabled = false, variant = 'default' }) {
    // Color mapping for different button categories
    const colorMap = {
        administration: 'blue',
        transaction: 'green',
        user: 'violet',
        report: 'orange',
        default: 'gray',
    };

    const color = colorMap[variant] || colorMap.default;

    return (
        <Button
            variant="light"
            color={color}
            size="md"
            h={60}
            fullWidth
            disabled={disabled}
            onClick={onClick}
            className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
            styles={{
                root: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                },
                label: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                },
            }}
        >
            <Group gap="xs" wrap="nowrap">
                {icon && <span className="text-lg">{icon}</span>}
                <Text size="sm" fw={500} className="whitespace-nowrap">
                    {label}
                </Text>
            </Group>
        </Button>
    );
}

DashboardButton.propTypes = {
    label: PropTypes.string.isRequired,
    icon: PropTypes.node,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    variant: PropTypes.oneOf(['administration', 'transaction', 'user', 'report', 'default']),
};

export default DashboardButton;
