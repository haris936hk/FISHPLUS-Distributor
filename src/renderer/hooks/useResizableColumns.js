import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for resizable table columns (FR-GRID-008).
 * Allows users to drag column header borders to resize columns.
 *
 * @param {Object} initialWidths - Map of column key to initial width in px
 * @returns {{ columnWidths, getResizeProps }}
 */
export function useResizableColumns(initialWidths) {
    const [columnWidths, setColumnWidths] = useState(initialWidths);
    const resizing = useRef(null);

    const onMouseMove = useCallback((e) => {
        if (!resizing.current) return;
        const { key, startX, startWidth } = resizing.current;
        const diff = e.clientX - startX;
        const newWidth = Math.max(40, startWidth + diff);
        setColumnWidths((prev) => ({ ...prev, [key]: newWidth }));
    }, []);

    const onMouseUp = useCallback(() => {
        resizing.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, [onMouseMove, onMouseUp]);

    /**
     * Returns props to spread on Th elements for resize behavior.
     * @param {string} key - Column key matching initialWidths
     */
    const getResizeProps = useCallback(
        (key) => ({
            style: {
                width: columnWidths[key],
                position: 'relative',
                userSelect: resizing.current ? 'none' : undefined,
            },
            children: undefined, // caller provides children
            onMouseDown: undefined, // not on the Th itself
            // Attach this to a resize handle element inside the Th
            resizeHandle: {
                onMouseDown: (e) => {
                    e.preventDefault();
                    resizing.current = {
                        key,
                        startX: e.clientX,
                        startWidth: columnWidths[key],
                    };
                    document.body.style.cursor = 'col-resize';
                    document.body.style.userSelect = 'none';
                },
                style: {
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: 5,
                    cursor: 'col-resize',
                    zIndex: 1,
                },
            },
        }),
        [columnWidths]
    );

    return { columnWidths, getResizeProps };
}

export default useResizableColumns;
