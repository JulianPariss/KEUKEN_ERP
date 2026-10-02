'use client';

import { useTheme } from "@repo/ui/theme";
import { formatCssColor } from "@/lib/utils/formatter.helper";
import React, { useEffect, useRef, useState } from "react";
import { Layer, Stage, Text } from "react-konva";

interface Particle {
    id: number;
    x: number;
    y: number;
    speed: number;
    scale: number;
    icon: string;
    initialOpacity: number;
}

interface BackgroundProps {
    density?: number; // 1 to 10
    opacity?: number; // 0 to 1
    direction?: "left" | "right";
    icons?: (keyof typeof DX_ICON_MAP)[];
    color?: string;
}

import { DX_ICON_MAP } from "@repo/icons/dx";

const DynamicBackground: React.FC<BackgroundProps> = ({
    density = 4,
    opacity = 0.2,
    direction = "right",
    icons = ["money", "box", "cart", "runner"],
    color = "currentColor",
}) => {
    const { theme } = useTheme();

    const [formatedColor, setFormatedColor] = useState(formatCssColor(color));

    useEffect(() => {
        setFormatedColor(formatCssColor(color));
    }, [theme])

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [particles, setParticles] = useState<Particle[]>([]);
    const requestRef = useRef<number>(null);

    useEffect(() => {
        const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (dimensions.width === 0) return;

        const count = Math.floor((dimensions.width * dimensions.height) / 50000) * (density / 5);
        const newParticles: Particle[] = [];
        for (let i = 0; i < count; i++) {
            const iconName = icons[Math.floor(Math.random() * icons.length)];
            newParticles.push({
                id: i,
                x: Math.random() * dimensions.width,
                y: Math.random() * dimensions.height,
                speed: (Math.random() * 0.5 + 0.2) * (direction === "right" ? 1 : -1),
                icon: DX_ICON_MAP[iconName] || DX_ICON_MAP["box"],
                scale: Math.random() * 20 + 10,
                initialOpacity: Math.random() * 0.5 + 0.5,
            });
        }
        setParticles(newParticles);
    }, [dimensions, density, direction]);

    const animate = (time: number) => {
        setParticles((prev) =>
            prev.map((p) => {
                let newX = p.x + p.speed;
                if (newX > dimensions.width + 50) newX = -50;
                if (newX < -50) newX = dimensions.width + 50;
                return { ...p, x: newX };
            })
        );
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [dimensions.width, direction]);

    if (dimensions.width === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden select-none opacity-60">
            <Stage width={dimensions.width} height={dimensions.height}>
                <Layer>
                    {particles.map((p) => (
                        <Text
                            key={p.id}
                            text={p.icon}
                            x={p.x}
                            y={p.y}
                            fontSize={p.scale}
                            fontFamily="DXIcons"
                            fill={formatedColor}
                            opacity={p.initialOpacity * opacity}
                            listening={false}
                            shadowColor={formatedColor}
                            shadowBlur={10}
                            shadowOpacity={0.8}
                            shadowOffset={{ x: 0, y: 0 }}
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
};

export default DynamicBackground;
