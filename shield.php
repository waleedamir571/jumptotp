<?php
// ============================================
// COMPLETE PHP PROTECTION SYSTEM
// File: shield.php
// Version: 2.0
// ============================================

session_start();

class SecurityShield {
    
    private $blockedIPs = [];
    private $blockedUserAgents = [];
    private $rateLimit = [];
    private $secretKey = 'YourSuperSecretKey2026!@#$';
    
    public function __construct() {
        $this->initBlockLists();
        $this->runSecurityChecks();
    }
    
    // Initialize block lists
    private function initBlockLists() {
        // Blocked IPs (add more as needed)
        $this->blockedIPs = [
            '127.0.0.1', // Example - don't block localhost in production
            // Add malicious IPs here
        ];
        
        // Blocked user agents (scrapers, bots)
        $this->blockedUserAgents = [
            'HTTrack', 'wget', 'curl', 'Python', 'Java', 'Perl',
            'Ruby', 'Wget', 'libwww', 'WebCopier', 'WebZip',
            'SiteSucker', 'Website eXtractor', 'Offline Explorer'
        ];
    }
    
    // Main security check runner
    private function runSecurityChecks() {
        $this->checkIP();
        $this->checkUserAgent();
        $this->checkRateLimit();
        $this->checkReferer();
        $this->checkSession();
        $this->preventHotlinking();
        $this->addSecurityHeaders();
        $this->disableDirectAccess();
    }
    
    // Check and block malicious IPs
    private function checkIP() {
        $userIP = $this->getUserIP();
        
        if(in_array($userIP, $this->blockedIPs)) {
            $this->blockAccess("IP Address blocked: " . $userIP);
        }
        
        // Block if too many requests from same IP
        if(isset($_SESSION['request_count'])) {
            $_SESSION['request_count']++;
            if($_SESSION['request_count'] > 500) {
                $this->blockAccess("Too many requests from IP: " . $userIP);
            }
        } else {
            $_SESSION['request_count'] = 1;
        }
    }
    
    // Get real user IP address
    private function getUserIP() {
        $ipaddress = '';
        if(getenv('HTTP_CLIENT_IP'))
            $ipaddress = getenv('HTTP_CLIENT_IP');
        else if(getenv('HTTP_X_FORWARDED_FOR'))
            $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
        else if(getenv('HTTP_X_FORWARDED'))
            $ipaddress = getenv('HTTP_X_FORWARDED');
        else if(getenv('HTTP_FORWARDED_FOR'))
            $ipaddress = getenv('HTTP_FORWARDED_FOR');
        else if(getenv('HTTP_FORWARDED'))
            $ipaddress = getenv('HTTP_FORWARDED');
        else if(getenv('REMOTE_ADDR'))
            $ipaddress = getenv('REMOTE_ADDR');
        else
            $ipaddress = 'UNKNOWN';
        
        return $ipaddress;
    }
    
    // Check and block malicious user agents
    private function checkUserAgent() {
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        
        foreach($this->blockedUserAgents as $badAgent) {
            if(stripos($userAgent, $badAgent) !== false) {
                $this->blockAccess("Automated access detected: " . $badAgent);
            }
        }
    }
    
    // Rate limiting
    private function checkRateLimit() {
        $userIP = $this->getUserIP();
        $timeWindow = 60; // 60 seconds
        $maxRequests = 30; // Max 30 requests per minute
        
        if(!isset($_SESSION['rate_limit'][$userIP])) {
            $_SESSION['rate_limit'][$userIP] = [
                'count' => 1,
                'timestamp' => time()
            ];
        } else {
            $data = $_SESSION['rate_limit'][$userIP];
            if(time() - $data['timestamp'] < $timeWindow) {
                $data['count']++;
                if($data['count'] > $maxRequests) {
                    $this->blockAccess("Rate limit exceeded. Please wait " . $timeWindow . " seconds.");
                }
                $_SESSION['rate_limit'][$userIP] = $data;
            } else {
                $_SESSION['rate_limit'][$userIP] = [
                    'count' => 1,
                    'timestamp' => time()
                ];
            }
        }
    }
    
    // Check referer to prevent direct access
    private function checkReferer() {
        $allowedDomains = ['hoisolution.com', 'localhost', 'jumptotp.com'];
        $referer = $_SERVER['HTTP_REFERER'] ?? '';
        
        if(!empty($referer)) {
            $isAllowed = false;
            foreach($allowedDomains as $domain) {
                if(strpos($referer, $domain) !== false) {
                    $isAllowed = true;
                    break;
                }
            }
            
            // Uncomment to enforce referer check
            // if(!$isAllowed) {
            //     $this->blockAccess("Direct access not allowed");
            // }
        }
    }
    
    // Session security
    private function checkSession() {
        // Regenerate session ID periodically
        if(!isset($_SESSION['created'])) {
            $_SESSION['created'] = time();
            session_regenerate_id(true);
        } elseif(time() - $_SESSION['created'] > 1800) { // 30 minutes
            session_regenerate_id(true);
            $_SESSION['created'] = time();
        }
        
        // Check session fingerprint
        $fingerprint = md5($_SERVER['HTTP_USER_AGENT'] . $this->secretKey);
        if(!isset($_SESSION['fingerprint'])) {
            $_SESSION['fingerprint'] = $fingerprint;
        } elseif($_SESSION['fingerprint'] !== $fingerprint) {
            $this->blockAccess("Session tampering detected");
        }
    }
    
    // Prevent hotlinking (image/video theft)
    private function preventHotlinking() {
        $requestURI = $_SERVER['REQUEST_URI'] ?? '';
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'pdf'];
        
        foreach($allowedExtensions as $ext) {
            if(strpos($requestURI, '.' . $ext) !== false) {
                $referer = $_SERVER['HTTP_REFERER'] ?? '';
                $allowedDomains = ['hoisolution.com', 'localhost'];
                $isAllowed = false;
                
                foreach($allowedDomains as $domain) {
                    if(strpos($referer, $domain) !== false) {
                        $isAllowed = true;
                        break;
                    }
                }
                
                if(!$isAllowed && !empty($referer)) {
                    header('HTTP/1.0 403 Forbidden');
                    die("Hotlinking is not allowed");
                }
            }
        }
    }
    
    // Add security headers
    private function addSecurityHeaders() {
        // Prevent XSS
        header("X-XSS-Protection: 1; mode=block");
        
        // Prevent clickjacking
        header("X-Frame-Options: DENY");
        
        // Prevent MIME type sniffing
        header("X-Content-Type-Options: nosniff");
        
        // Content Security Policy
        header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;");
        
        // Referrer Policy
        header("Referrer-Policy: strict-origin-when-cross-origin");
        
        // Permissions Policy
        header("Permissions-Policy: geolocation=(), microphone=(), camera=()");
        
        // Disable caching for sensitive pages
        header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
        header("Pragma: no-cache");
    }
    
    // Block direct access to PHP files
    private function disableDirectAccess() {
        $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
        $blockedFiles = ['config.php', 'database.php', 'shield.php'];
        
        foreach($blockedFiles as $file) {
            if(strpos($scriptName, $file) !== false && basename($scriptName) == $file) {
                if($_SERVER['REQUEST_METHOD'] != 'POST' || !isset($_SERVER['HTTP_X_REQUESTED_WITH'])) {
                    $this->blockAccess("Direct access to " . $file . " is not allowed");
                }
            }
        }
    }
    
    // Block access with message
    private function blockAccess($message = "Access Denied") {
        header('HTTP/1.0 403 Forbidden');
        die("
        <!DOCTYPE html>
        <html>
        <head>
            <title>Access Denied</title>
            <style>
                body {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    font-family: Arial, sans-serif;
                }
                .error-box {
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }
                h1 { color: #dc3545; margin-bottom: 20px; }
                p { color: #666; margin-bottom: 20px; }
                .code { color: #999; font-size: 12px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class='error-box'>
                <h1>⚠️ Access Denied</h1>
                <p>$message</p>
                <p>Your activity has been logged for security purposes.</p>
                <div class='code'>Error Code: SEC_" . md5(time()) . "</div>
            </div>
        </body>
        </html>
        ");
    }
    
    // Generate random class names (for dynamic CSS)
    public function randomClass($prefix = 'c') {
        return $prefix . bin2hex(random_bytes(6));
    }
    
    // Generate random ID
    public function randomId($prefix = 'id') {
        return $prefix . bin2hex(random_bytes(4));
    }
    
    // Obfuscate email addresses
    public function obfuscateEmail($email) {
        $parts = explode('@', $email);
        $name = $parts[0];
        $domain = $parts[1];
        
        $nameLength = strlen($name);
        $obfuscatedName = substr($name, 0, 2) . str_repeat('*', $nameLength - 2);
        
        return $obfuscatedName . '@' . $domain;
    }
    
    // Encrypt sensitive data
    public function encryptData($data) {
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc'));
        $encrypted = openssl_encrypt($data, 'aes-256-cbc', $this->secretKey, 0, $iv);
        return base64_encode($encrypted . '::' . $iv);
    }
    
    // Decrypt data
    public function decryptData($encryptedData) {
        list($encrypted, $iv) = explode('::', base64_decode($encryptedData), 2);
        return openssl_decrypt($encrypted, 'aes-256-cbc', $this->secretKey, 0, $iv);
    }
    
    // Generate CSRF token
    public function generateCSRFToken() {
        if(!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
    
    // Verify CSRF token
    public function verifyCSRFToken($token) {
        if(!isset($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
            $this->blockAccess("CSRF token validation failed");
        }
        return true;
    }
    
    // Log security events
    public function logEvent($event, $details = '') {
        $logFile = 'security_log.txt';
        $timestamp = date('Y-m-d H:i:s');
        $userIP = $this->getUserIP();
        $logEntry = "[$timestamp] [$event] IP: $userIP - $details\n";
        file_put_contents($logFile, $logEntry, FILE_APPEND);
    }
    
    // Clean up temp files
    public function cleanupTempFiles($directory = '.', $hours = 24) {
        $files = glob($directory . '/temp_img_*.png');
        foreach($files as $file) {
            if(file_exists($file) && time() - filectime($file) > ($hours * 3600)) {
                unlink($file);
            }
        }
    }
}

// Initialize security shield
$shield = new SecurityShield();

// Optional: Run cleanup on 1% of requests
if(mt_rand(1, 100) === 1) {
    $shield->cleanupTempFiles();
}

// Export functions for use in other files
function secureClass() {
    global $shield;
    return $shield->randomClass();
}

function secureId() {
    global $shield;
    return $shield->randomId();
}

function csrfToken() {
    global $shield;
    return $shield->generateCSRFToken();
}

function encryptText($text) {
    global $shield;
    return $shield->encryptData($text);
}

// Return shield instance for advanced usage
return $shield;
?>