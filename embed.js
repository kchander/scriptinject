/**
 * ScriptInject Embed Script
 * This script loads and executes user-defined scripts from localStorage
 */

(function() {
    'use strict';
    
    // Prevent multiple loads
    if (window.scriptInjectLoaded) {
        return;
    }
    window.scriptInjectLoaded = true;
    
    console.log('🚀 ScriptInject loaded');
    
    // Configuration
    const STORAGE_KEY = 'scriptinject_scripts';
    const DEBUG = false; // Set to true for debugging
    
    function log(message, ...args) {
        if (DEBUG) {
            console.log(`[ScriptInject] ${message}`, ...args);
        }
    }
    
    function logError(message, error) {
        console.error(`[ScriptInject] ${message}`, error);
    }
    
    // Get scripts from localStorage
    function getStoredScripts() {
        try {
            const scripts = localStorage.getItem(STORAGE_KEY);
            return scripts ? JSON.parse(scripts) : [];
        } catch (error) {
            logError('Failed to load scripts from localStorage:', error);
            return [];
        }
    }
    
    // Execute a single script safely
    function executeScript(script) {
        if (!script || !script.code || !script.active) {
            return;
        }
        
        try {
            log(`Executing script: ${script.name}`);
            
            // Create isolated execution context
            const scriptElement = document.createElement('script');
            scriptElement.textContent = `
                (function() {
                    try {
                        // User script starts here
                        ${script.code}
                        // User script ends here
                    } catch (error) {
                        console.error('[ScriptInject] Error in script "${script.name}":', error);
                    }
                })();
            `;
            
            // Add to DOM
            (document.head || document.documentElement).appendChild(scriptElement);
            
            // Clean up after execution
            setTimeout(() => {
                if (scriptElement.parentNode) {
                    scriptElement.parentNode.removeChild(scriptElement);
                }
            }, 100);
            
            log(`Successfully executed: ${script.name}`);
            
        } catch (error) {
            logError(`Failed to execute script "${script.name}":`, error);
        }
    }
    
    // Execute all active scripts
    function executeAllScripts() {
        const scripts = getStoredScripts();
        const activeScripts = scripts.filter(script => script.active);
        
        if (activeScripts.length === 0) {
            log('No active scripts found');
            return;
        }
        
        log(`Found ${activeScripts.length} active scripts to execute`);
        
        // Execute each script with a small delay to prevent blocking
        activeScripts.forEach((script, index) => {
            setTimeout(() => {
                executeScript(script);
            }, index * 10); // 10ms delay between scripts
        });
    }
    
    // Wait for DOM to be ready
    function waitForDOM(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            // DOM is already ready
            callback();
        }
    }
    
    // Main initialization
    function initialize() {
        log('Initializing ScriptInject...');
        
        waitForDOM(() => {
            log('DOM ready, executing scripts...');
            executeAllScripts();
        });
        
        // Also listen for localStorage changes (if scripts are updated in another tab)
        window.addEventListener('storage', function(e) {
            if (e.key === STORAGE_KEY) {
                log('Scripts updated in another tab, reloading...');
                // Small delay to ensure changes are committed
                setTimeout(() => {
                    executeAllScripts();
                }, 100);
            }
        });
    }
    
    // Expose API for debugging (only in debug mode)
    if (DEBUG) {
        window.ScriptInject = {
            getScripts: getStoredScripts,
            executeScript: executeScript,
            executeAll: executeAllScripts,
            version: '1.0.0'
        };
    }
    
    // Add some basic CSS to prevent conflicts
    const style = document.createElement('style');
    style.textContent = `
        /* ScriptInject: Ensure injected elements don't interfere with existing styles */
        [data-scriptinject] {
            box-sizing: border-box;
        }
    `;
    (document.head || document.documentElement).appendChild(style);
    
    // Start the show!
    initialize();
    
})();
