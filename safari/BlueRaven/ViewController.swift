import Cocoa
import SafariServices
import WebKit

class ViewController: NSViewController, WKNavigationDelegate, WKScriptMessageHandler {

    @IBOutlet var webView: WKWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.webView.navigationDelegate = self
        
        self.webView.configuration.userContentController.add(self, name: "controller")
        
        self.webView.loadFileURL(Bundle.main.url(forResource: "Main", withExtension: "html")!, allowingReadAccessTo: Bundle.main.resourceURL!)
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        // Page loaded
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        // Handle messages from JavaScript
    }
    
    @IBAction func openSafariExtensionPreferences(_ sender: AnyObject?) {
        SFSafariApplication.showPreferencesForExtension(withIdentifier: "com.blueraven.BlueRaven-Extension") { error in
            guard error == nil else {
                // Handle error
                return
            }
            
            // Extension preferences opened successfully
        }
    }
}