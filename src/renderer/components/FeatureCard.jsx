import { Card, Text } from '@mantine/core';
import PropTypes from 'prop-types';

/**
 * FeatureCard Component
 * Reusable card for displaying a feature/technology with title and description.
 *
 * @param {string} title - The feature title
 * @param {string} description - Short description of the feature
 */
function FeatureCard({ title, description }) {
    return (
        <Card withBorder>
            <Text fw={600}>{title}</Text>
            <Text size="sm" c="dimmed">
                {description}
            </Text>
        </Card>
    );
}

FeatureCard.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
};

export default FeatureCard;
