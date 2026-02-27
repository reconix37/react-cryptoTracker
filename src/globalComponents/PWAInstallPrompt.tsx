import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-5">
            <div className="bg-background border border-border rounded-xl shadow-2xl p-5">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Download className="w-6 h-6 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-bold tracking-tight">
                                Install CryptoTracker
                            </h3>
                            <button
                                onClick={handleDismiss}
                                aria-label="Close"
                                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                            Install our app for quick access and offline support
                        </p>

                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                            <Button
                                size="sm"
                                onClick={handleInstall}
                                className="w-full md:w-auto px-6 font-medium"
                            >
                                Install
                            </Button>

                            <button
                                onClick={handleDismiss}
                                className=" text-xs font-medium py-2 px-3 text-muted-foreground/60 transition-all duration-200 hover:text-muted-foreground hover:underline hover:underline-offset-4 decoration-1 active:scale-95 text-center"
                            >
                                Later
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}