import { useState } from 'react';

const Button = ({ onClick, disabled, children }) => (
    <button
        className="pico-background-blue-50"
        style={{ color: '#111' }}
        onClick={onClick}
        disabled={disabled}
    >
        {children}
    </button>
);

export default function Paginator({ onChange, disableNext }) {
    const [currentPage, setCurrentPage] = useState(1);

    const handleClick = increment => {
        setCurrentPage(prev => prev + increment);
        onChange(currentPage + increment);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 300, marginTop: 20 }}>
            <Button
                onClick={() => handleClick(-1)}
                disabled={currentPage === 1}
            >
                &#8592; prev
            </Button>
            <Button
                onClick={() => handleClick(1)}
                disabled={disableNext}
            >
                next &#8594;

            </Button>
        </div>
    );
}