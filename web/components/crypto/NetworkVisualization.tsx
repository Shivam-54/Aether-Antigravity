'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function NetworkVisualization() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = canvas.width = canvas.parentElement?.clientWidth || 800;
        let height = canvas.height = canvas.parentElement?.clientHeight || 400;

        // --- Config ---
        const nodes = [
            { id: 'BTC', x: width * 0.5, y: height * 0.5, r: 40, color: 'rgba(255, 248, 220, 0.9)' }, // Cream center
            { id: 'ETH', x: width * 0.3, y: height * 0.4, r: 25, color: 'rgba(255, 255, 255, 0.6)' },
            { id: 'SOL', x: width * 0.7, y: height * 0.6, r: 20, color: 'rgba(255, 255, 255, 0.6)' },
            { id: 'ADA', x: width * 0.2, y: height * 0.7, r: 15, color: 'rgba(255, 255, 255, 0.4)' },
            { id: 'DOT', x: width * 0.8, y: height * 0.3, r: 18, color: 'rgba(255, 255, 255, 0.4)' },
        ];

        // Velocity for subtle drift
        const velocities = nodes.map(() => ({
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
        }));

        const links = [
            { source: 0, target: 1 },
            { source: 0, target: 2 },
            { source: 1, target: 3 },
            { source: 2, target: 4 },
            { source: 1, target: 2 },
        ];

        const render = () => {
            // Clear
            ctx.clearRect(0, 0, width, height);

            // Update Positions
            nodes.forEach((node, i) => {
                node.x += velocities[i].vx;
                node.y += velocities[i].vy;

                // Bounce bounds
                if (node.x < 0 || node.x > width) velocities[i].vx *= -1;
                if (node.y < 0 || node.y > height) velocities[i].vy *= -1;
            });

            // Draw Links
            links.forEach(link => {
                const source = nodes[link.source];
                const target = nodes[link.target];

                ctx.beginPath();
                ctx.moveTo(source.x, source.y);
                ctx.lineTo(target.x, target.y);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            // Draw Nodes
            nodes.forEach((node) => {
                // Glow
                const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r * 2);
                gradient.addColorStop(0, node.color);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.r * 2, 0, Math.PI * 2);
                ctx.fill();

                // Solid Core
                ctx.fillStyle = node.color; // Using same color but solid draw
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.r * 0.2, 0, Math.PI * 2);
                ctx.fill();

                // Label
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                ctx.font = '10px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(node.id, node.x, node.y + node.r + 10);
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        const handleResize = () => {
            width = canvas.width = canvas.parentElement?.clientWidth || 800;
            height = canvas.height = canvas.parentElement?.clientHeight || 400;
            // Re-center logic could go here
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="w-full h-full relative overflow-hidden">
            {/* Background noise/grain could be added here via CSS overlay if needed */}
            <canvas ref={canvasRef} className="absolute inset-0 block" />
        </div>
    );
}
