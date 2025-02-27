import Cocoa
import SafariServices

@main
class AppDelegate: NSObject, NSApplicationDelegate {
    
    var window: NSWindow?
    
    func applicationDidFinishLaunching(_ notification: Notification) {
        // Create a window programmatically
        let window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 500, height: 300),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false)
        
        window.center()
        window.title = "BlueRaven Safari Extension"
        
        // Create UI components
        let view = NSView(frame: window.contentView!.bounds)
        
        // Create title label
        let titleLabel = NSTextField(labelWithString: "BlueRaven for Safari")
        titleLabel.font = NSFont.systemFont(ofSize: 20, weight: .bold)
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(titleLabel)
        
        // Create description label
        let descLabel = NSTextField(labelWithString: "Make Twitter look more like Twitter again")
        descLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(descLabel)
        
        // Create main button
        let button = NSButton(title: "Enable BlueRaven Extension", target: self, action: #selector(openExtensionPreferences(_:)))
        button.bezelStyle = .rounded
        button.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(button)
        
        // Create secondary button to open Safari extensions page directly
        let safariButton = NSButton(title: "Open Safari Extensions Settings", target: self, action: #selector(openSafariExtensions(_:)))
        safariButton.bezelStyle = .rounded
        safariButton.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(safariButton)
        
        // Create status label
        let statusLabel = NSTextField(labelWithString: "If the extension doesn't appear, you may need to enable developer mode in Safari")
        statusLabel.font = NSFont.systemFont(ofSize: 12)
        statusLabel.textColor = NSColor.secondaryLabelColor
        statusLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(statusLabel)
        
        // Set up constraints
        NSLayoutConstraint.activate([
            titleLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            titleLabel.topAnchor.constraint(equalTo: view.topAnchor, constant: 60),
            
            descLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            descLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 20),
            
            button.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            button.topAnchor.constraint(equalTo: descLabel.bottomAnchor, constant: 40),
            
            safariButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            safariButton.topAnchor.constraint(equalTo: button.bottomAnchor, constant: 20),
            
            statusLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            statusLabel.topAnchor.constraint(equalTo: safariButton.bottomAnchor, constant: 30)
        ])
        
        window.contentView = view
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
        
        self.window = window
    }
    
    @objc func openExtensionPreferences(_ sender: Any) {
        print("Attempting to open Safari Extension preferences with bundle ID: com.blueraven.BlueRaven-Extension")
        
        // Try to open the Safari preferences with the extension ID
        SFSafariApplication.showPreferencesForExtension(withIdentifier: "com.blueraven.BlueRaven-Extension") { error in
            DispatchQueue.main.async {
                if let error = error {
                    print("Error opening extension preferences: \(error.localizedDescription)")
                    
                    // Show alert with detailed error
                    let alert = NSAlert()
                    alert.messageText = "Error Opening Safari Extension Preferences"
                    alert.informativeText = "Error: \(error.localizedDescription)\n\nBundle ID: com.blueraven.BlueRaven-Extension\n\nThis usually means the extension is not properly signed or not built correctly."
                    alert.alertStyle = .warning
                    alert.addButton(withTitle: "OK")
                    
                    // Add an option to open Safari's general extension preferences
                    alert.addButton(withTitle: "Open Safari Extensions")
                    
                    let response = alert.runModal()
                    
                    // If the user clicked "Open Safari Extensions"
                    if response == .alertSecondButtonReturn {
                        NSWorkspace.shared.open(URL(string: "safari-preferences://extensions")!)
                    }
                } else {
                    print("Safari Extension preferences opened successfully")
                }
            }
        }
    }
    
    @objc func openSafariExtensions(_ sender: Any) {
        // Opens Safari's extensions preferences directly
        NSWorkspace.shared.open(URL(string: "safari-preferences://extensions")!)
    }
    
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }
}