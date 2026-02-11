import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Home, OctagonAlert } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <OctagonAlert className="w-24 h-24 text-destructive mb-6 mx-auto opacity-80" />
            </motion.div>

            <h1 className="text-9xl font-extrabold tracking-widest text-foreground">
                404
            </h1>

            <div className="bg-blue-600 px-2 text-sm rounded rotate-12 absolute mb-16">
                Page Not Found
            </div>

            <p className="text-muted-foreground mt-8 mb-8 max-w-md text-lg">
                Oops! It looks like this coin has delisted or the link is broken.
                Don't let your portfolio suffer!
            </p>

            <Button asChild size="lg" className="gap-2 shadow-lg hover:scale-105 transition-transform">
                <Link to="/">
                    <Home className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>
    );
}
