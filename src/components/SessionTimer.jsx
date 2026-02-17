import React, { useState, useEffect } from "react";

import clockIcon from "../assets/clock.svg";

const SessionTimer = ({ startTime, endTime, dateOfSession }) => {
    const [statusText, setStatusText] = useState("");
    const [timeLeft, setTimeLeft] = useState(null);
    const [isWarning, setIsWarning] = useState(false);
    const [showDot, setShowDot] = useState(true);

    const formatDisplayTime = (dateObj, originalStr) => {
        if (!dateObj) return originalStr;

        // Format to IST
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        };
        const timeStr = dateObj.toLocaleTimeString('en-IN', options);
        return `${timeStr} IST`;
    };

    const parseDateTime = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return null;
        // Handle ISO strings if they are passed instead of formatted strings
        if (timeStr.includes('T') || !isNaN(Date.parse(timeStr))) {
            return new Date(timeStr);
        }

        const parts = dateStr.split("-");
        if (parts.length !== 3) return null;
        const [day, month, year] = parts.map(Number);

        const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!match) return null;

        let [_, hours, minutes, period] = match;
        hours = parseInt(hours, 10);
        minutes = parseInt(minutes, 10);

        if (period.toUpperCase() === "PM" && hours < 12) hours += 12;
        if (period.toUpperCase() === "AM" && hours === 12) hours = 0;

        return new Date(year, month - 1, day, hours, minutes);
    };

    useEffect(() => {
        const start = parseDateTime(dateOfSession, startTime);
        const end = parseDateTime(dateOfSession, endTime);

        if (!end) {
            console.error("SessionTimer invalid times:", { startTime, endTime, dateOfSession });
            setTimeLeft("Invalid Time");
            return;
        }

        const calculateTime = () => {
            const now = Date.now();

            // Check if session hasn't started yet
            if (start && now < start.getTime()) {
                const displayTime = formatDisplayTime(start, startTime);
                setStatusText(`Starts at ${displayTime}`);
                setTimeLeft(null);
                setIsWarning(false);
                return;
            }

            const diff = end.getTime() - now;

            if (diff <= 0) {
                setStatusText("Session Ended");
                setTimeLeft(null);
                setIsWarning(true);
                return;
            }

            setStatusText(""); // Clear status text to show countdown
            setIsWarning(diff < 10 * 60 * 1000);

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            const h = hours.toString().padStart(2, "0");
            const m = minutes.toString().padStart(2, "0");
            const s = seconds.toString().padStart(2, "0");

            setTimeLeft(`${h}:${m}:${s}`);
        };

        calculateTime();
        const timer = setInterval(() => {
            calculateTime();
            setShowDot((prev) => !prev);
        }, 1000);

        return () => clearInterval(timer);
    }, [startTime, endTime, dateOfSession]);

    if (!timeLeft && !statusText) return null;

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
                whiteSpace: "nowrap"
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
            {isWarning && timeLeft && (
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
            <span>{statusText || timeLeft}</span>
        </div>
    );
};

export default SessionTimer;