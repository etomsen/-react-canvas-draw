import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import './Canvas.css';
import { useSyncedRef } from './syncRef.hook';

export interface CanvasProps {
    width: number;
    height: number;
    background?: CanvasImageSource;
    lineStroke?: string | CanvasGradient | CanvasPattern;
    lineWidth?: number;
}

type Coordinate = {
    x: number;
    y: number;
};

export async function getCanvasImage(ref: HTMLCanvasElement): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
        try {
            ref.toBlob((result) => resolve(result));
        } catch (error) {
            reject(error);
        }
    });
}

export function clearCanvas(ref: HTMLCanvasElement) {
    ref.getContext('2d')?.clearRect(0, 0, ref.width, ref.height);
}

const CanvasWithRef = forwardRef<HTMLCanvasElement, CanvasProps>((
    {background, width, height, lineWidth, lineStroke},
    ref
) => {
    const canvasRef = useSyncedRef<HTMLCanvasElement>(ref);
    const [isPainting, setIsPainting] = useState(false);
    const [mousePosition, setMousePosition] = useState<Coordinate | undefined>(undefined);

    const drawLine = useCallback((originalMousePosition: Coordinate, newMousePosition: Coordinate) => {
        if (!canvasRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context = canvas.getContext('2d');
        if (context) {
            context.strokeStyle = lineStroke || 'red';
            context.lineJoin = 'round';
            context.lineWidth = lineWidth || 5;

            context.beginPath();
            context.moveTo(originalMousePosition.x, originalMousePosition.y);
            context.lineTo(newMousePosition.x, newMousePosition.y);
            context.closePath();

            context.stroke();
        }
    }, [canvasRef, lineStroke, lineWidth]);

    const getCoordinates = useCallback((event: MouseEvent | TouchEvent): Coordinate | undefined => {
        if (!canvasRef.current) {
            return;
        }

        const canvas: HTMLCanvasElement = canvasRef.current;
        if ((event as TouchEvent).changedTouches) {
            return {
                x: (event as TouchEvent).changedTouches[0].pageX - canvas.offsetLeft,
                y: (event as TouchEvent).changedTouches[0].pageY - canvas.offsetTop
            };
        } else {
            return {
                x: (event as MouseEvent).pageX - canvas.offsetLeft,
                y: (event as MouseEvent).pageY - canvas.offsetTop
            };
        }
    }, [canvasRef]);

    const startPaint = useCallback((event: MouseEvent | TouchEvent) => {
        const coordinates = getCoordinates(event);
        if (coordinates) {
            setMousePosition(coordinates);
            setIsPainting(true);
        }
    }, [getCoordinates]);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = canvasRef.current;
        canvas.addEventListener('mousedown', startPaint);
        canvas.addEventListener('touchstart', startPaint);
        return () => {
            canvas.removeEventListener('mousedown', startPaint);
            canvas.removeEventListener('touchstart', startPaint);
        };
    }, [startPaint, canvasRef]);

    const paint = useCallback(
        (event: MouseEvent | TouchEvent) => {
            if (isPainting) {
                const newMousePosition = getCoordinates(event);
                console.log('newMousePosition', newMousePosition);
                if (mousePosition && newMousePosition) {
                    drawLine(mousePosition, newMousePosition);
                    setMousePosition(newMousePosition);
                }
            }
        },
        [isPainting, mousePosition, getCoordinates, drawLine]
    );

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = canvasRef.current;
        canvas.addEventListener('mousemove', paint);
        canvas.addEventListener('touchmove', paint);
        return () => {
            canvas.removeEventListener('mousemove', paint);
            canvas.removeEventListener('touchmove', paint);
        };
    }, [paint, canvasRef]);

    const exitPaint = useCallback(() => {
        setIsPainting(false);
        setMousePosition(undefined);
    }, []);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = canvasRef.current;
        canvas.addEventListener('mouseup', exitPaint);
        canvas.addEventListener('mouseleave', exitPaint);
        canvas.addEventListener('touchend', exitPaint);
        canvas.addEventListener('touchcancel', exitPaint);
        return () => {
            canvas.removeEventListener('mouseup', exitPaint);
            canvas.removeEventListener('touchend', exitPaint);
            canvas.removeEventListener('touchcancel', exitPaint);
            canvas.removeEventListener('mouseleave', exitPaint);
        };
    }, [exitPaint, canvasRef]);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }
        if (background) {
            ctx.drawImage(background, 0, 0, width, height);
        } else {
            ctx.clearRect(0, 0, width, height);
        }
    }, [background, width, height, canvasRef]);

    return ( 
        <canvas className="App-Canvas" ref={canvasRef} height={height} width={width} />
    );
});

export default CanvasWithRef;
