import { useEffect, useRef } from 'react';
import { globalRobotController } from '@/components/robot/RobotController';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function useRobotSection({ id, config }) {
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!triggerRef.current) return;

    const applyTarget = () => {
      let finalConfig = { ...config };

      // Smart Layout & Mobile Fallback
      // The layout switches to stacked below lg (1024px). Thus, any screen < 1024px should use the mobile/centered config.
      const isMobile = window.innerWidth < 1024;
      const isTablet = false; // We treat everything under 1024px as mobile for the robot's positional purposes.

      if (isMobile) {
        if (config.mobileConfig) {
          finalConfig = { ...finalConfig, ...config.mobileConfig };
        } else {
          // Mobile Fallback: Shrink robot and move it to a safe top/bottom decorative zone
          finalConfig.scale = (config.scale || 1) * 0.75; // 75% size instead of 50%

          // Force x to be closer to center or edge without overlapping
          if (finalConfig.position) {
            const x = finalConfig.position[0];
            const safeX = x > 0 ? 1.5 : (x < 0 ? -1.5 : 0);
            finalConfig.position = [safeX, finalConfig.position[1] + 1, finalConfig.position[2] - 1];
          }
        }
      } else if (isTablet) {
        finalConfig.scale = (config.scale || 1) * 0.8;
      }

      globalRobotController.setTarget(finalConfig, id);
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: triggerRef.current,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) => {
          if (self.isActive) {
            applyTarget();
          }
        },
      });
    });

    // If it's the hero section, apply immediately on mount so it doesn't spawn offscreen
    if (id === 'hero') {
      applyTarget();
    }

    // Recalculate on resize
    window.addEventListener('resize', applyTarget);

    return () => {
      ctx.revert();
      window.removeEventListener('resize', applyTarget);
    };
  }, [id, config]);

  return triggerRef;
}
