import React, { useState, useEffect } from "react";

import clockIcon from "../assets/clock.svg";

const SessionTimer = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = useState(null);
    const [isWarning, setIsWarning] = useState(false);
    const [showDot, setShowDot] = useState(true);

    useEffect(() => {
        console.log("SessionTimer endTime:", endTime);
        if (!endTime) return;

        const calculateTime = () => {
            const end = new Date(endTime).getTime();
            const now = Date.now();
            const diff = end - now;

            // If diff is invalid (NaN), stop
            if (isNaN(diff)) {
                console.error("SessionTimer invalid endTime:", endTime);
                setTimeLeft("Invalid Time");
                return;
            }

            if (diff <= 0) {
                setTimeLeft("00:00:00");
                setIsWarning(true);
                return;
            }

            // Warning if less than 10 minutes (600,000 ms)
            setIsWarning(diff < 10 * 60 * 1000);

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            const h = hours.toString().padStart(2, "0");
            const m = minutes.toString().padStart(2, "0");
            const s = seconds.toString().padStart(2, "0");

            const formattedTime = `${h}:${m}:${s}`;
            setTimeLeft(formattedTime);
        };

        calculateTime(); // Initial calc

        // Update timer every second
        const timer = setInterval(() => {
            calculateTime();
            setShowDot((prev) => !prev);
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    if (!timeLeft) return null;

    return (
        <div
            style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: "14px",
                fontWeight: "600",
                color: isWarning ? "#ef4444" : "#333",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 16px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: isWarning ? "1px solid #ef4444" : "1px solid rgba(0,0,0,0.05)",
                borderRadius: "100px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                height: "34px",
                boxSizing: "border-box",
            }}
        >
            <img
                src={clockIcon}
                alt="clock"
                style={{
                    width: "16px",
                    height: "16px",
                    filter: isWarning ? "invert(27%) sepia(91%) saturate(2352%) hue-rotate(341deg) brightness(95%) contrast(90%)" : "none"
                }}
            />
            {isWarning && (
                <div
                    style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#ef4444",
                        opacity: showDot ? 1 : 0,
                        transition: "opacity 0.2s ease-in-out",
                    }}
                />
            )}
            <span>{timeLeft}</span>
        </div>
    );
};

export default SessionTimer;