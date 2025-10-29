'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import { Result } from '@zxing/library';

/**
 * QrScanner Component
 * 
 * Uses @zxing/browser to scan QR codes from the device camera.
 * Used by attendees to scan the trainer's QR code and claim NFTs.
 */
interface QrScannerProps {
    onScan: (data: string) => void;
    onError?: (error: Error) => void;
}

export default function QrScanner({ onScan, onError }: QrScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const controlsRef = useRef<IScannerControls | null>(null);

    useEffect(() => {
        return () => {
            // Cleanup on unmount
            if (controlsRef.current) {
                controlsRef.current.stop();
            }
        };
    }, []);

    const startScanning = async () => {
        if (!videoRef.current) return;

        try {
            setScanning(true);
            setError(null);

            const codeReader = new BrowserQRCodeReader();

            // Get available video input devices
            const videoInputDevices = await codeReader.listVideoInputDevices();

            if (videoInputDevices.length === 0) {
                throw new Error('No camera found on this device');
            }

            // Use the first available camera (usually back camera on mobile)
            const selectedDeviceId = videoInputDevices[0].deviceId;

            // Start decoding from the camera
            const controls = await codeReader.decodeFromVideoDevice(
                selectedDeviceId,
                videoRef.current,
                (result: Result | null, error: Error | undefined) => {
                    if (result) {
                        // Successfully scanned QR code
                        onScan(result.getText());
                        // Stop scanning after successful scan
                        if (controlsRef.current) {
                            controlsRef.current.stop();
                        }
                        setScanning(false);
                    }

                    if (error && !(error.message.includes('NotFoundException'))) {
                        // Ignore NotFoundException (no QR code in frame)
                        // Report other errors
                        console.error('QR scan error:', error);
                        if (onError) {
                            onError(error);
                        }
                    }
                }
            );

            controlsRef.current = controls;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to start camera';
            setError(errorMessage);
            setScanning(false);
            if (onError) {
                onError(err instanceof Error ? err : new Error(errorMessage));
            }
        }
    };

    const stopScanning = () => {
        if (controlsRef.current) {
            controlsRef.current.stop();
            controlsRef.current = null;
        }
        setScanning(false);
    };

    return (
        <div className="space-y-4">
            {/* Video preview */}
            <div className="relative bg-black rounded-lg overflow-hidden aspect-square max-w-md mx-auto">
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                />

                {!scanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                        <div className="text-center text-white">
                            <svg
                                className="w-16 h-16 mx-auto mb-4 opacity-50"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                                />
                            </svg>
                            <p className="text-sm">Camera ready</p>
                        </div>
                    </div>
                )}

                {scanning && (
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Scanning overlay with corner markers */}
                        <div className="absolute inset-8 border-2 border-primary-500">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
                        </div>
                        <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                            Position QR code within frame
                        </div>
                    </div>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg p-3 text-red-700 dark:text-red-200 text-sm">
                    {error}
                </div>
            )}

            {/* Controls */}
            <div className="flex gap-2 justify-center">
                {!scanning ? (
                    <button onClick={startScanning} className="btn btn-primary">
                        <svg
                            className="w-5 h-5 mr-2 inline-block"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        Start Scanning
                    </button>
                ) : (
                    <button onClick={stopScanning} className="btn btn-secondary">
                        <svg
                            className="w-5 h-5 mr-2 inline-block"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                            />
                        </svg>
                        Stop Scanning
                    </button>
                )}
            </div>
        </div>
    );
}

