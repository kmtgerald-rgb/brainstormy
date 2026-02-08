import { useState } from 'react';
import { ChevronDown, ChevronUp, Shuffle, Lightbulb, Timer, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function HowItWorks() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between py-2 px-3 rounded-md',
          'text-left font-mono text-[10px] uppercase tracking-wider',
          'text-muted-foreground hover:text-foreground hover:bg-muted/50',
          'transition-colors'
        )}
      >
        <span>How it works</span>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 py-3 px-3 bg-muted/30 rounded-md text-sm">
              {/* Core Concept */}
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">The Concept</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Mash-Up Cards forces unexpected connections between four elements: 
                  a consumer insight, an existing asset, a creative catalyst (technology, format, or channel), 
                  and a wild card. The magic happens in the collision.
                </p>
              </div>

              {/* How to Play */}
              <div className="space-y-2">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Shuffle className="w-3.5 h-3.5" />
                  Basic Flow
                </h4>
                <ol className="text-muted-foreground text-xs leading-relaxed space-y-1 list-decimal list-inside">
                  <li>Set your <strong>focus</strong> (or go free-form)</li>
                  <li>Hit <strong>Shuffle</strong> to draw four random cards</li>
                  <li>Find a connection — don't judge yet, just combine</li>
                  <li>Name and describe your idea inline, or let <strong>AI Fill</strong> suggest one</li>
                  <li>Hit <strong>Capture</strong> to save your spark</li>
                  <li>Flip any card to see <strong>Why It Matters</strong></li>
                  <li>Repeat until you've exhausted the unexpected</li>
                </ol>
              </div>

              {/* Game Modes */}
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Game Modes</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Freejam</span>
                      <span className="text-muted-foreground"> — Open exploration, no pressure</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Timer className="w-3.5 h-3.5 mt-0.5 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Time Attack</span>
                      <span className="text-muted-foreground"> — Race the clock to generate ideas</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Target className="w-3.5 h-3.5 mt-0.5 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Target</span>
                      <span className="text-muted-foreground"> — Hit a specific idea count goal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
