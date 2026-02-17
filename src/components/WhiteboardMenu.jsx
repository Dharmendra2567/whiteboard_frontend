import { useEffect, useRef, useState } from "react";
import "./whiteboard.css";

function WhiteboardMenu({
    api,
    onClear,
    allowSave = true,
    allowExport = true,
}) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    /* ---------- CLOSE ON OUTSIDE CLICK ---------- */
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    if (!api) return null;

    /* ---------- ACTIONS ---------- */

    const openFile = async () => {
        setOpen(false);
        const [handle] = await window.showOpenFilePicker({
            types: [
                {
                    description: "Excalidraw JSON",
                    accept: { "application/json": [".json"] },
                },
            ],
        });
        const file = await handle.getFile();
        api.updateScene(JSON.parse(await file.text()));
    };

    const saveFile = async () => {
        setOpen(false);
        const elements = api.getSceneElements();
        const appState = api.getAppState();

        const blob = new Blob(
            [JSON.stringify({ elements, appState })],
            { type: "application/json" }
        );

        const handle = await window.showSaveFilePicker({
            suggestedName: "whiteboard.json",
        });

        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
    };

    const exportPNG = () => {
        setOpen(false);
        const canvas = document.querySelector("canvas");
        const link = document.createElement("a");
        link.download = "whiteboard.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    const toggleTheme = () => {
        const state = api.getAppState();
        api.updateScene({
            appState: {
                ...state,
                theme: state.theme === "dark" ? "light" : "dark",
            },
        });
    };

    const setBackground = (color) => {
        const state = api.getAppState();
        api.updateScene({
            appState: { ...state, viewBackgroundColor: color },
        });
    };

    /* ---------- UI ---------- */

    return (
        <div className="wb-dropdown" ref={menuRef}>
            <button className="wb-trigger" onClick={() => setOpen(!open)}>
                ☰
            </button>

            {open && (
                <div className="wb-menu">
                    <button onClick={openFile}>Open</button>
                    {allowSave && <button onClick={saveFile}>Save</button>}
                    {allowExport && <button onClick={exportPNG}>Export</button>}
                    <button onClick={onClear}>Reset</button>
                    <button onClick={toggleTheme}>Theme</button>

                    <div className="wb-colors">
                        {["#ffffff", "#fef3c7", "#e0f2fe", "#fce7f3"].map((c) => (
                            <span
                                key={c}
                                style={{ background: c }}
                                onClick={() => setBackground(c)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default WhiteboardMenu;
