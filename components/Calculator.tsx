import React, { useState, useCallback } from 'react';
import { CalculatorIcon, XMarkIcon } from './Icons';

const Calculator: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [display, setDisplay] = useState('0');
    const [operator, setOperator] = useState<string | null>(null);
    const [prevValue, setPrevValue] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState(true);

    const inputDigit = useCallback((digit: string) => {
        if (waitingForOperand) {
            setDisplay(digit);
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? digit : display + digit);
        }
    }, [display, waitingForOperand]);
    
    const inputDot = useCallback(() => {
        if (!display.includes('.')) {
            setDisplay(display + '.');
            setWaitingForOperand(false);
        }
    }, [display]);

    const clearDisplay = useCallback(() => {
        setDisplay('0');
        setOperator(null);
        setPrevValue(null);
        setWaitingForOperand(true);
    }, []);

    const performOperation = useCallback((nextOperator: string) => {
        const inputValue = parseFloat(display);
        if (prevValue === null) {
            setPrevValue(display);
        } else if (operator) {
            const prev = parseFloat(prevValue);
            const result = calculate(prev, inputValue, operator);
            const resultString = String(result);
            setDisplay(resultString);
            setPrevValue(resultString);
        }
        setWaitingForOperand(true);
        setOperator(nextOperator);
    }, [display, operator, prevValue]);

    const calculate = (prev: number, current: number, op: string): number => {
        switch (op) {
            case '+': return prev + current;
            case '-': return prev - current;
            case '*': return prev * current;
            case '/': return prev / current;
            case '=': return current;
            default: return current;
        }
    };

    const handleEquals = useCallback(() => {
        if (operator && prevValue !== null) {
            const result = calculate(parseFloat(prevValue), parseFloat(display), operator);
            setDisplay(String(result));
            setPrevValue(null);
            setOperator(null);
            setWaitingForOperand(true);
        }
    }, [display, operator, prevValue]);

    const handleButtonClick = (value: string) => {
        if (/\d/.test(value)) {
            inputDigit(value);
        } else if (value === '.') {
            inputDot();
        } else if (value === 'C') {
            clearDisplay();
        } else if (['+', '-', '*', '/'].includes(value)) {
            performOperation(value);
        } else if (value === '=') {
            handleEquals();
        }
    };
    
    const renderButton = (value: string, className = '') => (
        <button
            onClick={() => handleButtonClick(value)}
            className={`text-xl font-semibold p-4 rounded-lg transition-colors ${className}`}
        >
            {value}
        </button>
    );

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-20 right-4 md:bottom-4 md:right-4 bg-[var(--bg-accent)] text-[var(--text-inverted)] p-4 rounded-full shadow-lg hover:bg-[var(--bg-accent-hover)] transition-transform hover:scale-110 z-30"
                aria-label="Abrir/Fechar Calculadora"
            >
                {isOpen ? <XMarkIcon className="w-6 h-6" /> : <CalculatorIcon className="w-6 h-6" />}
            </button>
            {isOpen && (
                <div className="fixed bottom-36 right-4 md:bottom-20 md:right-4 w-64 bg-[var(--bg-secondary)] rounded-lg shadow-2xl z-30 border border-[var(--border-primary)]">
                    <div className="bg-gray-800 text-white text-2xl text-right p-4 rounded-t-lg break-words">{display}</div>
                    <div className="grid grid-cols-4 gap-1 p-2 bg-[var(--bg-primary)]">
                        {renderButton('C', 'col-span-2 bg-red-200 hover:bg-red-300 text-red-800')}
                        {renderButton('/', 'bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-accent)]')}
                        {renderButton('*', 'bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-accent)]')}

                        {renderButton('7', 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]')}
                        {renderButton('8', 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]')}
                        {renderButton('9', 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]')}
                        {renderButton('-', 'bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-accent)]')}

                        {renderButton('4', 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]')}
                        {renderButton('5', 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]')}
                        {renderButton('6', 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]')}
                        {renderButton('+', 'bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-accent)]')}

                        <div className="col-span-3 grid grid-cols-3 gap-1">
                            {renderButton('1', 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]')}
                            {renderButton('2', 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]')}
                            {renderButton('3', 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]')}
                            {renderButton('0', 'col-span-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]')}
                            {renderButton('.', 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]')}
                        </div>
                        {renderButton('=', 'row-span-2 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-inverted)]')}
                    </div>
                </div>
            )}
        </>
    );
};

export default Calculator;
