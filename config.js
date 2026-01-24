// ====================================================
// config.js - GitHub Configuration for Extra Miles Energy
// ====================================================
// File location: root of your repository (same level as index.html)
// ====================================================

const GITHUB_CONFIG = {
    // ===== GITHUB CREDENTIALS =====
    // Your GitHub username (CORRECTED)
    USERNAME: 'parshantsaharan',
    
    // Repository name
    REPO: 'extramilesenergy.in',
    
    // Branch name (usually 'main' or 'master')
    BRANCH: 'main',
    
    // ===== FILE PATHS =====
    // Where product JSON files will be stored
    PRODUCTS_PATH: 'content/products',
    
    // Where product images will be uploaded
    UPLOADS_PATH: 'uploads',
    
    // ===== GITHUB PERSONAL ACCESS TOKEN =====
    // IMPORTANT: Create this token on GitHub:
    // 1. Go to GitHub.com → Settings → Developer Settings
    // 2. Personal Access Tokens → Tokens (classic)
    // 3. Generate new token (classic)
    // 4. Select scopes: repo, write:packages, delete:packages
    // 5. Copy token and paste it here
    TOKEN: '', // Leave empty initially, will be set in Admin Panel
    
    // ===== API ENDPOINTS =====
    get API_BASE_URL() {
        return `https://api.github.com/repos/${this.USERNAME}/${this.REPO}`;
    },
    
    get PRODUCTS_API_URL() {
        return `${this.API_BASE_URL}/contents/${this.PRODUCTS_PATH}`;
    },
    
    get UPLOADS_API_URL() {
        return `${this.API_BASE_URL}/contents/${this.UPLOADS_PATH}`;
    },
    
    get REPO_URL() {
        return `https://github.com/${this.USERNAME}/${this.REPO}`;
    },
    
    // ===== NETLIFY CONFIG =====
    NETLIFY_SITE_URL: 'https://extramilesenergy.in',
    NETLIFY_DEPLOY_HOOK: '', // Optional: Netlify deploy hook URL
    
    // ===== WEBSITE CONFIG =====
    WEBSITE_TITLE: 'Extra Miles Energy',
    WEBSITE_DESCRIPTION: 'Premium Lithium Battery Manufacturer in Hisar, Haryana',
    WHATSAPP_NUMBER: '917876555055',
    PHONE_NUMBER: '919991144903',
    EMAIL: 'extramilesenergy@gmail.com',
    
    // ===== ADMIN CONFIG =====
    ADMIN_PASSWORD: 'Sky12345', // You can change this
    
    // ===== VALIDATION =====
    isValid: function() {
        const errors = [];
        
        if (!this.USERNAME || this.USERNAME === 'parshantsahara') {
            errors.push('GitHub username is incorrect. Use: parshantsaharan');
        }
        
        if (!this.REPO) {
            errors.push('Repository name is required');
        }
        
        if (!this.TOKEN) {
            errors.push('GitHub Personal Access Token is required');
        }
        
        if (this.TOKEN === 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN') {
            errors.push('Please replace with your actual GitHub token');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    },
    
    // ===== LOGGING =====
    logConfig: function() {
        console.log('=== GitHub Configuration ===');
        console.log('Username:', this.USERNAME);
        console.log('Repository:', this.REPO);
        console.log('Branch:', this.BRANCH);
        console.log('Products Path:', this.PRODUCTS_PATH);
        console.log('API Base URL:', this.API_BASE_URL);
        console.log('Repository URL:', this.REPO_URL);
        console.log('===========================');
        
        const validation = this.isValid();
        if (!validation.valid) {
            console.warn('Configuration Warnings:', validation.errors);
        }
    }
};

// ===== EXPORT FOR BROWSER =====
// Make it globally available
if (typeof window !== 'undefined') {
    window.GITHUB_CONFIG = GITHUB_CONFIG;
}

// ===== INITIALIZATION =====
// Load saved config from localStorage if available
(function() {
    try {
        const savedConfig = localStorage.getItem('github_config');
        if (savedConfig) {
            const parsedConfig = JSON.parse(savedConfig);
            
            // Update config with saved values
            Object.keys(parsedConfig).forEach(key => {
                if (GITHUB_CONFIG.hasOwnProperty(key) && key !== 'isValid' && key !== 'logConfig') {
                    GITHUB_CONFIG[key] = parsedConfig[key];
                }
            });
            
            console.log('Loaded GitHub config from localStorage');
        }
        
        // Log configuration
        GITHUB_CONFIG.logConfig();
        
    } catch (error) {
        console.error('Error loading GitHub config:', error);
    }
})();

// ===== HELPER FUNCTIONS =====
const GitHubHelper = {
    // Test GitHub connection
    testConnection: async function() {
        try {
            if (!GITHUB_CONFIG.TOKEN) {
                return {
                    success: false,
                    message: 'GitHub token not configured'
                };
            }
            
            const response = await fetch(GITHUB_CONFIG.API_BASE_URL, {
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                return {
                    success: true,
                    message: 'GitHub connection successful!'
                };
            } else {
                return {
                    success: false,
                    message: `GitHub API error: ${response.status}`
                };
            }
        } catch (error) {
            return {
                success: false,
                message: `Connection failed: ${error.message}`
            };
        }
    },
    
    // Save product to GitHub
    saveProduct: async function(product, imageFile = null) {
        try {
            const validation = GITHUB_CONFIG.isValid();
            if (!validation.valid) {
                throw new Error(validation.errors.join(', '));
            }
            
            const results = {
                productSaved: false,
                imageUploaded: false,
                productId: product.id
            };
            
            // 1. Upload image if provided
            if (imageFile) {
                const imageResult = await this.uploadImage(imageFile);
                results.imageUploaded = imageResult.success;
                results.imageUrl = imageResult.url;
            }
            
            // 2. Save product JSON
            const fileName = `${product.id}.json`;
            const filePath = `${GITHUB_CONFIG.PRODUCTS_PATH}/${fileName}`;
            const content = JSON.stringify(product, null, 2);
            
            const response = await fetch(`${GITHUB_CONFIG.API_BASE_URL}/contents/${filePath}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: `Add product: ${product.name}`,
                    content: btoa(unescape(encodeURIComponent(content))),
                    branch: GITHUB_CONFIG.BRANCH
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`GitHub API error: ${errorData.message || response.status}`);
            }
            
            results.productSaved = true;
            results.productUrl = `${GITHUB_CONFIG.REPO_URL}/blob/${GITHUB_CONFIG.BRANCH}/${filePath}`;
            
            return results;
            
        } catch (error) {
            console.error('Error saving product to GitHub:', error);
            throw error;
        }
    },
    
    // Upload image to GitHub
    uploadImage: async function(imageFile) {
        try {
            const fileName = imageFile.name;
            const filePath = `${GITHUB_CONFIG.UPLOADS_PATH}/${fileName}`;
            
            // Convert to base64
            const base64Content = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(imageFile);
            });
            
            const response = await fetch(`${GITHUB_CONFIG.API_BASE_URL}/contents/${filePath}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: `Upload image: ${fileName}`,
                    content: base64Content,
                    branch: GITHUB_CONFIG.BRANCH
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`GitHub API error: ${errorData.message || response.status}`);
            }
            
            return {
                success: true,
                url: `${GITHUB_CONFIG.REPO_URL}/blob/${GITHUB_CONFIG.BRANCH}/${filePath}`,
                rawUrl: `https://raw.githubusercontent.com/${GITHUB_CONFIG.USERNAME}/${GITHUB_CONFIG.REPO}/${GITHUB_CONFIG.BRANCH}/${filePath}`
            };
            
        } catch (error) {
            console.error('Error uploading image to GitHub:', error);
            throw error;
        }
    },
    
    // Get all products from GitHub
    getProducts: async function() {
        try {
            const response = await fetch(GITHUB_CONFIG.PRODUCTS_API_URL, {
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            const files = await response.json();
            const products = [];
            
            for (const file of files) {
                if (file.name.endsWith('.json') && file.type === 'file') {
                    try {
                        const productResponse = await fetch(file.download_url);
                        const product = await productResponse.json();
                        products.push(product);
                    } catch (error) {
                        console.warn(`Error loading product ${file.name}:`, error);
                    }
                }
            }
            
            return products;
            
        } catch (error) {
            console.error('Error getting products from GitHub:', error);
            throw error;
        }
    },
    
    // Trigger Netlify rebuild (optional)
    triggerDeploy: async function() {
        if (!GITHUB_CONFIG.NETLIFY_DEPLOY_HOOK) {
            return { success: false, message: 'No deploy hook configured' };
        }
        
        try {
            const response = await fetch(GITHUB_CONFIG.NETLIFY_DEPLOY_HOOK, {
                method: 'POST'
            });
            
            return {
                success: response.ok,
                message: response.ok ? 'Deploy triggered successfully' : 'Deploy trigger failed'
            };
        } catch (error) {
            return {
                success: false,
                message: `Deploy trigger error: ${error.message}`
            };
        }
    }
};

// ===== MAKE HELPER AVAILABLE =====
if (typeof window !== 'undefined') {
    window.GitHubHelper = GitHubHelper;
}

// ===== EXPORT FOR NODE.JS (if needed) =====
try {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            GITHUB_CONFIG,
            GitHubHelper
        };
    }
} catch (error) {
    // Not in Node.js environment
}
