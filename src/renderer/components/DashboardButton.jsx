import { Button, Text, Stack } from '@mantine/core';
import PropTypes from 'prop-types';

/**
 * DashboardButton Component
 * Large, desktop-optimized navigation button for the dashboard.
 * Designed for mouse interaction with generous click targets.
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
        transaction: 'teal',
        user: 'violet',
        report: 'orange',
        default: 'gray',
    };

    const color = colorMap[variant] || colorMap.default;

    return (
        <Button
            variant="light"
            color={color}
            size="xl"
            h={100}
            fullWidth
            disabled={disabled}
            onClick={onClick}
            className="transition-all duration-150 hover:scale-[1.03] hover:shadow-lg active:scale-[0.98] cursor-pointer"
            styles={{
                root: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    border: '2px solid transparent',
                    '&:hover': {
                        borderColor: 'var(--mantine-color-' + color + '-4)',
                    },
                },
                label: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                },
            }}
        >
            <Stack gap={6} align="center">
                {icon && <span className="text-3xl">{icon}</span>}
                <Text size="md" fw={600}>
                    {label}
                </Text>
            </Stack>
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
