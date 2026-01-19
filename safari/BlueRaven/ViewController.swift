import Cocoa
import SafariServices
import WebKit

class ViewController: NSViewController, WKNavigationDelegate, WKScriptMessageHandler {

    @IBOutlet var webView: WKWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Make sure the window is visible
        if let window = self.view.window {
            window.makeKeyAndOrderFront(nil)
        }
        
        // Configure the webView if it exists
        if let webView = self.webView {
            webView.navigationDelegate = self
            webView.configuration.userContentController.add(self, name: "controller")
            
            if let htmlURL = Bundle.main.url(forResource: "Main", withExtension: "html") {
                webView.loadFileURL(htmlURL, allowingReadAccessTo: Bundle.main.resourceURL!)
            } else {
                // If HTML file not found, create a simple UI programmatically
                createFallbackUI()
            }
        } else {
            // If webView outlet not connected, create UI programmatically
            createFallbackUI()
        }
        
        // Bring app to foreground
        NSApp.activate(ignoringOtherApps: true)
    }
    
    func createFallbackUI() {
        // Remove any existing subviews
        self.view.subviews.forEach { $0.removeFromSuperview() }
        
        // Create a simple UI with a button
        let button = NSButton(title: "Enable Safari Extension", target: self, action: #selector(openSafariExtensionPreferences(_:)))
        button.bezelStyle = .rounded
        button.translatesAutoresizingMaskIntoConstraints = false
        
        let titleLabel = NSTextField(labelWithString: "BlueRaven for Safari")
        titleLabel.font = NSFont.systemFont(ofSize: 18, weight: .bold)
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let descLabel = NSTextField(labelWithString: "Make Twitter (sometimes known as X) look more like Twitter again")
        descLabel.translatesAutoresizingMaskIntoConstraints = false
        
        self.view.addSubview(titleLabel)
        self.view.addSubview(descLabel)
        self.view.addSubview(button)
        
        NSLayoutConstraint.activate([
            titleLabel.centerXAnchor.constraint(equalTo: self.view.centerXAnchor),
            titleLabel.topAnchor.constraint(equalTo: self.view.topAnchor, constant: 50),
            
            descLabel.centerXAnchor.constraint(equalTo: self.view.centerXAnchor),
            descLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 20),
            
            button.centerXAnchor.constraint(equalTo: self.view.centerXAnchor),
            button.topAnchor.constraint(equalTo: descLabel.bottomAnchor, constant: 40)
        ])
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        // Page loaded
        NSApp.activate(ignoringOtherApps: true)
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        // Handle messages from JavaScript
        if message.body as? String == "openPreferences" {
            openSafariExtensionPreferences(nil)
        }
    }
    
    @IBAction func openSafariExtensionPreferences(_ sender: AnyObject?) {
        SFSafariApplication.showPreferencesForExtension(withIdentifier: "com.blueraven.BlueRaven-Extension") { error in
            DispatchQueue.main.async {
                if let error = error {
                    let alert = NSAlert()
                    alert.messageText = "Error Opening Safari Extension Preferences"
                    alert.informativeText = error.localizedDescription
                    alert.alertStyle = .warning
                    alert.addButton(withTitle: "OK")
                    alert.runModal()
                } else {
                    // Extension preferences opened successfully
                    print("Safari Extension preferences opened successfully")
                }
            }
        }
    }
}