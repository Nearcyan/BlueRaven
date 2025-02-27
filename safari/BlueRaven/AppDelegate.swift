import Cocoa

@main
class AppDelegate: NSObject, NSApplicationDelegate {
    
    var window: NSWindow?
    
    func applicationDidFinishLaunching(_ notification: Notification) {
        // Make sure the main window is visible
        if let window = NSApplication.shared.windows.first {
            self.window = window
            window.makeKeyAndOrderFront(nil)
        }
        
        // Bring app to foreground
        NSApp.activate(ignoringOtherApps: true)
    }
    
    func applicationWillTerminate(_ notification: Notification) {
        // Insert code here to tear down your application
    }
    
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }
    
    @IBAction func showWindow(_ sender: Any?) {
        // In case the window is hidden, make it visible again
        if let window = self.window ?? NSApplication.shared.windows.first {
            window.makeKeyAndOrderFront(nil)
            NSApp.activate(ignoringOtherApps: true)
        }
    }
}