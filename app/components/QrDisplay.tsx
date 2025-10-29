'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

/**
 * QrDisplay Component
 * 
 * Generates and displays a QR code from text data.
 * Used by trainers to show the claim QR code to attendees.
 */
interface QrDisplayProps {
    data: string;
    size?: number;
    label?: string;
}

export default function QrDisplay({ data, size = 300, label }: QrDisplayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!canvasRef.current || !data) return;

        const generateQR = async () => {
            try {
                await QRCode.toCanvas(canvasRef.current, data, {
                    width: size,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF',
                    },
                });
                setError(null);
            } catch (err) {
                console.error('QR generation error:', err);
                setError('Failed to generate QR code');
            }
        };

        generateQR();
    }, [data, size]);

    return (
        <div className="space-y-4">
            {label && (
                <p className="text-center text-gray-700 dark:text-gray-300 font-medium">
                    {label}
                </p>
            )}

            <div className="bg-white p-4 rounded-lg shadow-lg inline-block">
                {error ? (
                    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    </div>
                ) : (
                    <canvas
                        ref={canvasRef}
                        className="rounded"
                    />
                )}
            </div>

            <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono break-all max-w-md mx-auto">
                    {data.length > 100 ? `${data.slice(0, 50)}...${data.slice(-50)}` : data}
                </p>
            </div>
        </div>
    );
}

