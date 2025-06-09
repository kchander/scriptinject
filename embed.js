// ScriptInject Embed Script
// This script gets injected into target websites
(function() {
    // Prevent multiple instances
    if (window.ScriptInject) return;
    window.ScriptInject = true;
    
    let isManagerOpen = false;
    let scripts = JSON.parse(localStorage.getItem('scriptinject_scripts') || '[]');
    
    // Create floating button
    const floatingBtn = document.createElement('button');
    floatingBtn.innerHTML = '⚙️';
    floatingBtn.title = 'ScriptInject Manager';
    floatingBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #667eea;
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
    `;
    
    floatingBtn.onmouseover = function() {
        this.style.transform = 'scale(1.1)';
        this.style.background = '#5a67d8';
    };
    
    floatingBtn.onmouseout = function() {
        this.style.transform = 'scale(1)';
        this.style.background = '#667eea';
    };
    
    floatingBtn.onclick = openScriptManager;
    
    // Wait for DOM to be ready before adding button
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            document.body.appendChild(floatingBtn);
        });
    } else {
        document.body.appendChild(floatingBtn);
    }
    
    // Execute saved scripts
    function executeScripts() {
        scripts.forEach(script => {
            if (script.active) {
                try {
                    eval(script.code);
                } catch (error) {
                    console.error(`ScriptInject Error in "${script.name}":`, error);
                }
            }
        });
    }
    
    // Save scripts to localStorage
    function saveScripts() {
        localStorage.setItem('scriptinject_scripts', JSON.stringify(scripts));
    }
    
    // Create script manager modal
    function openScriptManager() {
        if (isManagerOpen) return;
        isManagerOpen = true;
        
        const modal = document.createElement('div');
        modal.id = 'scriptinject-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 10px;
            padding: 2rem;
            width: 90%;
            max-width: 800px;
            max-height: 80%;
            overflow-y: auto;
            position: relative;
        `;
        
        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2 style="margin: 0; color: #2d3748;">🛠 ScriptInject Manager</h2>
                <button onclick="window.ScriptInjectClose()" style="background: #e53e3e; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px;">✕ Close</button>
            </div>
            
            <div style="background: #f7fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #667eea;">
                <small style="color: #4a5568;">
                    <strong>Domain:</strong> ${window.location.hostname} • 
                    <strong>Scripts:</strong> ${scripts.length} • 
                    <strong>Active:</strong> ${scripts.filter(s => s.active).length}
                </small>
            </div>
            
            <div style="margin-bottom: 2rem; background: #f9f9f9; padding: 1.5rem; border-radius: 8px;">
                <h3 style="margin: 0 0 1rem 0; color: #2d3748;">Create New Script</h3>
                <input type="text" id="scriptinject-name" placeholder="Script name (e.g. 'Welcome Popup')..." style="width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;">
                <textarea id="scriptinject-code" placeholder="Enter your JavaScript code here...

Example:
const popup = document.createElement('div');
popup.innerHTML = 'Hello World!';
popup.style.cssText = 'position:fixed;top:20px;right:20px;background:#4299e1;color:white;padding:15px;border-radius:8px;z-index:9999;';
document.body.appendChild(popup);
setTimeout(() => popup.remove(), 3000);" style="width: 100%; height: 150px; padding: 10px; margin: 8px 0; border: 1px solid #e2e8f0; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 13px; resize: vertical;"></textarea>
                <div>
                    <button onclick="window.ScriptInjectAdd()" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-right: 8px; font-size: 14px;">Add Script</button>
                    <button onclick="window.ScriptInjectTest()" style="background: #38a169; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px;">Test Script</button>
                </div>
            </div>
            
            <div>
                <h3 style="margin: 0 0 1rem 0; color: #2d3748;">Saved Scripts</h3>
                <div id="scriptinject-list"></div>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Add event listeners
        window.ScriptInjectClose = function() {
            const modal = document.getElementById('scriptinject-modal');
            if (modal) {
                modal.remove();
                isManagerOpen = false;
            }
        };
        
        window.ScriptInjectAdd = function() {
            const name = document.getElementById('scriptinject-name').value.trim();
            const code = document.getElementById('scriptinject-code').value.trim();
            
            if (!name || !code) {
                alert('Please enter both name and code');
                return;
            }
            
            scripts.push({
                id: Date.now(),
                name: name,
                code: code,
                active: true,
                created: new Date().toISOString()
            });
            
            saveScripts();
            document.getElementById('scriptinject-name').value = '';
            document.getElementById('scriptinject-code').value = '';
            renderScriptsList();
            
            // Execute the new script immediately
            try {
                eval(code);
            } catch (error) {
                console.error('ScriptInject: Error executing new script:', error);
            }
        };
        
        window.ScriptInjectTest = function() {
            const code = document.getElementById('scriptinject-code').value.trim();
            if (!code) {
                alert('Please enter some code to test');
                return;
            }
            
            try {
                eval(code);
            } catch (error) {
                alert('Script Error: ' + error.message);
            }
        };
        
        window.ScriptInjectToggle = function(id) {
            const script = scripts.find(s => s.id === id);
            if (script) {
                script.active = !script.active;
                saveScripts();
                renderScriptsList();
            }
        };
        
        window.ScriptInjectDelete = function(id) {
            if (confirm('Are you sure you want to delete this script?')) {
                scripts = scripts.filter(s => s.id !== id);
                saveScripts();
                renderScriptsList();
            }
        };
        
        window.ScriptInjectEdit = function(id) {
            const script = scripts.find(s => s.id === id);
            if (script) {
                document.getElementById('scriptinject-name').value = script.name;
                document.getElementById('scriptinject-code').value = script.code;
                // Remove the original script
                scripts = scripts.filter(s => s.id !== id);
                saveScripts();
                renderScriptsList();
            }
        };
        
        // Close modal when clicking outside
        modal.onclick = function(e) {
            if (e.target === modal) {
                window.ScriptInjectClose();
            }
        };
        
        renderScriptsList();
    }
    
    function renderScriptsList() {
        const container = document.getElementById('scriptinject-list');
        if (!container) return;
        
        if (scripts.length === 0) {
            container.innerHTML = '<p style="color: #718096; font-style: italic; text-align: center; padding: 2rem;">No scripts saved yet. Create your first script above!</p>';
            return;
        }
        
        container.innerHTML = scripts.map(script => `
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin: 1rem 0; background: white;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4 style="margin: 0; color: #2d3748;">${script.name}</h4>
                    <div>
                        <button onclick="window.ScriptInjectToggle(${script.id})" style="background: ${script.active ? '#38a169' : '#a0aec0'}; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin: 0 2px; font-size: 12px;">${script.active ? '✓ Active' : '⏸ Inactive'}</button>
                        <button onclick="window.ScriptInjectEdit(${script.id})" style="background: #3182ce; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin: 0 2px; font-size: 12px;">Edit</button>
                        <button onclick="window.ScriptInjectDelete(${script.id})" style="background: #e53e3e; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin: 0 2px; font-size: 12px;">Delete</button>
                    </div>
                </div>
                <small style="color: #718096;">Created: ${new Date(script.created).toLocaleDateString()}</small>
                <pre style="background: #f7fafc; padding: 8px; border-radius: 4px; margin-top: 8px; font-size: 11px; overflow-x: auto; border: 1px solid #e2e8f0; max-height: 150px; overflow-y: auto;">${script.code}</pre>
            </div>
        `).join('');
    }
    
    // Execute scripts on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', executeScripts);
    } else {
        executeScripts();
    }
    
})();
