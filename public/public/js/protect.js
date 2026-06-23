// Disable Right Click
document.addEventListener('contextmenu', event => {
    event.preventDefault();
});

// Disable Keyboard Shortcuts
document.addEventListener('keydown', function(e) {

    // F12
    if (e.key === 'F12') {
        e.preventDefault();
        return false;
    }

    // Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
    }

    // Ctrl+Shift+J
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
    }

    // Ctrl+U
    if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
    }

    // Ctrl+S
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
    }

    // Ctrl+C
    if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        return false;
    }

    // Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
    }

    // Ctrl+A
    if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        return false;
    }
});

setInterval(function () {

    const before = new Date().getTime();

    debugger;

    const after = new Date().getTime();

    if (after - before > 100) {
        document.body.innerHTML = `
        <div style="
            display:flex;
            justify-content:center;
            align-items:center;
            height:100vh;
            font-family:Arial;
            background:#111;
            color:white;
            font-size:30px;
        ">
            Developer Tools Detected
        </div>`;
    }

}, 1000);