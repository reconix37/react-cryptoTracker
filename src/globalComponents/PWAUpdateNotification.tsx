
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';

export default function PWAUpdateNotification() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log(' SW Registered:', r);
        },
        onRegisterError(error) {
            console.error('SW registration error:', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    const handleUpdate = () => {
        updateServiceWorker(true);
    };
    if (!offlineReady && !needRefresh) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-5">
            <div className="bg-background border border-border rounded-lg shadow-lg p-4">
                {offlineReady ? (
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 text-emerald-500" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold mb-1">
                                App ready to work offline
                            </h3>
                            <p className="text-xs text-muted-foreground mb-3">
                                You can now use the app without internet connection
                            </p>

                            <Button size="sm" variant="outline" onClick={close}>
                                Got it
                            </Button>
                        </div>

                        <button
                            onClick={close}
                            aria-label="Close notification"
                            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 text-blue-500" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold mb-1">
                                New version available
                            </h3>
                            <p className="text-xs text-muted-foreground mb-3">
                                Click reload to update to the latest version
                            </p>

                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={handleUpdate}
                                    className="flex-1"
                                >
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    Reload
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={close}
                                >
                                    Later
                                </Button>
                            </div>
                        </div>
                        <button
                            onClick={close}
                            aria-label="Close notification"
                            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

