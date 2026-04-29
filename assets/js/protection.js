// ============================================
// COMPLETE COPY PROTECTION SYSTEM
// File: protection.js
// Version: 2.0
// ============================================

(function() {
    'use strict';
    
    // ========== 1. RIGHT CLICK DISABLE ==========
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showNotification('🚫 Right click disabled', 'error');
        return false;
    });
    
    // ========== 2. KEYBOARD SHORTCUTS DISABLE ==========
    document.addEventListener('keydown', function(e) {
        // Disable Ctrl combinations
        if(e.ctrlKey) {
            const forbidden = ['c', 'C', 'x', 'X', 's', 'S', 'u', 'U', 'p', 'P', 'a', 'A', 'v', 'V'];
            if(forbidden.includes(e.key)) {
                e.preventDefault();
                showNotification('🚫 Copy/Save disabled', 'error');
                return false;
            }
        }
        
        // Disable F12
        if(e.key === 'F12') {
            e.preventDefault();
            showNotification('🚫 DevTools blocked', 'error');
            return false;
        }
        
        // Disable Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
        if(e.ctrlKey && e.shiftKey) {
            const forbidden = ['I', 'i', 'J', 'j', 'C', 'c'];
            if(forbidden.includes(e.key)) {
                e.preventDefault();
                showNotification('🚫 Inspector blocked', 'error');
                return false;
            }
        }
        
        // Disable F5, Ctrl+R (refresh) - optional
        if(e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
            e.preventDefault();
            showNotification('🔄 Refresh disabled temporarily', 'warning');
            return false;
        }
        
        // Disable PrintScreen
        if(e.key === 'PrintScreen') {
            e.preventDefault();
            showNotification('📸 Screenshot attempt detected', 'warning');
            return false;
        }
    });
    
    // ========== 3. TEXT SELECTION DISABLE ==========
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // ========== 4. DRAG AND DROP DISABLE ==========
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // ========== 5. COPY, CUT, PASTE DISABLE ==========
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        showNotification('📋 Copying is disabled', 'error');
        return false;
    });
    
    document.addEventListener('cut', function(e) {
        e.preventDefault();
        showNotification('✂️ Cutting is disabled', 'error');
        return false;
    });
    
    document.addEventListener('paste', function(e) {
        e.preventDefault();
        showNotification('📌 Pasting is disabled', 'error');
        return false;
    });
    
    // ========== 6. DEVTools DETECTION ==========
    let devtoolsOpen = false;
    let devtoolsCheckCount = 0;
    
    const detectDevTools = () => {
        const threshold = 160;
        const widthDiff = window.outerWidth - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;
        const widthThreshold = widthDiff > threshold;
        const heightThreshold = heightDiff > threshold;
        
        // Method 2: Check console log
        const consoleDummy = /./;
        consoleDummy.toString = function() {
            devtoolsOpen = true;
        };
        
        try {
            console.log('%c', consoleDummy);
        } catch(e) {}
        
        // Method 3: Check element inspector
        const element = new Image();
        Object.defineProperty(element, 'id', {
            get: function() {
                devtoolsOpen = true;
                return '';
            }
        });
        
        if(widthThreshold || heightThreshold) {
            if(!devtoolsOpen) {
                devtoolsOpen = true;
                handleDevToolsOpen();
            }
        }
        
        devtoolsCheckCount++;
        if(devtoolsCheckCount > 5 && devtoolsOpen) {
            // Severe protection
            document.body.innerHTML = '<div style="text-align:center;padding:50px;background:black;color:white;height:100vh;"><h1>🔒 ACCESS DENIED</h1><p>Developer tools detected. Content protected.</p><p>This page cannot be inspected.</p></div>';
        }
    };
    
    const handleDevToolsOpen = () => {
        // Blur entire page
        document.body.style.filter = 'blur(50px)';
        document.body.style.pointerEvents = 'none';
        
        // Show warning
        const warningDiv = document.createElement('div');
        warningDiv.innerHTML = `
            <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.95);z-index:999999;display:flex;align-items:center;justify-content:center;flex-direction:column;color:white;font-family:Arial;">
                <h1 style="color:red;">⚠️ DETECTED</h1>
                <p>Developer tools are open!</p>
                <p>Content protection activated.</p>
                <button onclick="location.reload()" style="margin-top:20px;padding:10px20px;cursor:pointer;">Reload Page</button>
            </div>
        `;
        document.body.appendChild(warningDiv);
        
        // Disable all interactions
        document.body.style.pointerEvents = 'none';
        
        showNotification('🚨 DevTools detected! Content locked', 'error');
    };
    
    setInterval(detectDevTools, 1000);
    
    // ========== 7. CONSOLE CLEARING & PROTECTION ==========
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    const originalConsoleInfo = console.info;
    
    console.log = function() {};
    console.warn = function() {};
    console.error = function() {};
    console.info = function() {};
    
    // Keep only for debugging (optional)
    window.debugMode = false;
    if(window.debugMode) {
        console.log = originalConsoleLog;
    }
    
    // ========== 8. NOTIFICATION SYSTEM ==========
    function showNotification(message, type = 'info') {
        let toast = document.getElementById('protectionToast');
        
        if(!toast) {
            toast = document.createElement('div');
            toast.id = 'protectionToast';
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #333;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                z-index: 999999;
                font-size: 14px;
                font-family: Arial, sans-serif;
                animation: slideInRight 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                pointer-events: none;
            `;
            
            // Add animation keyframes
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes fadeOut {
                    from {
                        opacity: 1;
                    }
                    to {
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(toast);
        }
        
        // Set color based on type
        let bgColor = '#333';
        if(type === 'error') bgColor = '#dc3545';
        if(type === 'warning') bgColor = '#ffc107';
        if(type === 'success') bgColor = '#28a745';
        
        toast.style.backgroundColor = bgColor;
        toast.textContent = message;
        toast.style.display = 'block';
        toast.style.animation = 'slideInRight 0.3s ease';
        
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 300);
        }, 2000);
    }
    
    // ========== 9. DISABLE SELECTION CSS + JS ==========
    const disableSelection = () => {
        const style = document.createElement('style');
        style.textContent = `
            body {
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
                user-select: none !important;
                -webkit-tap-highlight-color: transparent !important;
            }
            img {
                -webkit-user-drag: none !important;
                user-drag: none !important;
                pointer-events: none !important;
            }
            ::selection {
                background: transparent !important;
            }
            ::-moz-selection {
                background: transparent !important;
            }
        `;
        document.head.appendChild(style);
    };
    
    disableSelection();
    
    // ========== 10. PROTECT IMAGES ==========
    const protectImages = () => {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Disable right click on images
            img.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });
            
            // Add invisible overlay
            img.style.pointerEvents = 'none';
        });
    };
    
    // Run when DOM loads
    if(document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', protectImages);
    } else {
        protectImages();
    }
    
    // ========== 11. PREVENT SOURCE CODE VIEWING ==========
    // Detect if page is being viewed in iframe
    if(window.top !== window.self) {
        window.top.location = window.self.location;
    }
    
    // ========== 12. DISABLE TEXT SELECTION ON MOBILE ==========
    document.addEventListener('touchstart', function(e) {
        if(e.target.closest('[data-protected="true"]')) {
            e.preventDefault();
        }
    });
    
    // ========== 13. HONEYPOT FOR SCRAPERS ==========
    const addHoneypot = () => {
        const fakeDiv = document.createElement('div');
        fakeDiv.style.display = 'none';
        fakeDiv.innerHTML = '<!-- Fake content for scrapers - This will break your parser -->';
        fakeDiv.setAttribute('data-honeypot', 'true');
        document.body.appendChild(fakeDiv);
    };
    
    addHoneypot();
    
    // ========== 14. DYNAMIC CONTENT OBFUSCATION ==========
    const obfuscateEmails = () => {
        const elements = document.querySelectorAll('[data-email]');
        elements.forEach(el => {
            const email = el.getAttribute('data-email');
            if(email) {
                const reversed = email.split('').reverse().join('');
                el.innerHTML = `<span data-reversed="${reversed}">protected@email.com</span>`;
            }
        });
    };
    
    obfuscateEmails();
    
    // ========== 15. PERIODIC CLEANUP ==========
    setInterval(() => {
        // Remove any saved text from clipboard if possible
        try {
            window.clipboardData && window.clipboardData.clearData();
        } catch(e) {}
    }, 3000);
    
    // ========== 16. DETECT DEBUGGING TOOLS ==========
    const detectDebugging = () => {
        const startTime = performance.now();
        debugger;
        const endTime = performance.now();
        
        if(endTime - startTime > 100) {
            showNotification('🔍 Debugging detected!', 'warning');
        }
    };
    
    setInterval(detectDebugging, 2000);
    
    // ========== 17. BLOCK SELECT ALL (Ctrl+A) ==========
    document.addEventListener('keydown', function(e) {
        if(e.ctrlKey && (e.key === 'a' || e.key === 'A')) {
            e.preventDefault();
            showNotification('📑 Select All disabled', 'warning');
            return false;
        }
    });
    
    // ========== 18. DISABLE PRINT ==========
    window.matchMedia('print').addListener(function(mql) {
        if(mql.matches) {
            showNotification('🖨️ Printing is disabled', 'error');
            document.body.style.display = 'none';
            setTimeout(() => {
                document.body.style.display = 'block';
            }, 100);
        }
    });
    
    // ========== 19. PROTECT AGAINST SCREEN CAPTURE ==========
    // Disable PrtSc (additional protection)
    window.addEventListener('keyup', function(e) {
        if(e.key === 'PrintScreen') {
            navigator.clipboard.writeText('').catch(() => {});
            showNotification('📸 Screenshot blocked', 'error');
        }
    });
    
    // ========== 20. FINAL INITIALIZATION ==========
    console.log('%c🔒 Content Protection Active', 'color: red; font-size: 16px; font-weight: bold;');
    console.log('%cCopying, inspecting, and saving is disabled on this site', 'color: orange; font-size: 12px;');
    
    // Show active protection message
    setTimeout(() => {
        showNotification('🛡️ Content protection activated', 'success');
    }, 1000);
    
})();

// Export for module usage (if needed)
if(typeof module !== 'undefined' && module.exports) {
    module.exports = { protectionActive: true };
}